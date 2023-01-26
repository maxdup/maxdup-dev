import {N, L} from './config';

const Tn = 3;
const DD = 1; // spacing
const V = 4; // velocity

function Waves(){
  let f = new Array(Tn);
  let inertiaFactor = 0;
  let initial = true;
  let dt = 0.033;

  this.setInertia = (i) => {
    inertiaFactor = i;
  }

  this.setPositions = (parameter) => {
    let x0 = parameter.x;
    let y0 = parameter.y;
    let z0 = parameter.z;
    let sigma2 = parameter.sigma2;

    if (initial){
      for (let t = 0; t < Tn; t++) {
        f[t] = new Array(N);
        for (let i = 0; i <= N; i++) {
          f[t][i] = new Array(N);
        }
      }
    }

    for (let t = 0; t < Tn; t++) {
      for (let i = 0; i <= N; i++) {
        for (let j = 0; j <= N; j++) {
          let x = (-N / 2 + i) * L;
          let y = (-N / 2 + j) * L;
          // initial conditions
          let z = z0 * Math.exp(-(Math.pow(x - x0, 2) + Math.pow(y - y0, 2)) / (2 * sigma2));
          f[0][i][j] = initial || Math.abs(z) > Math.abs(f[0][i][j]) ? z : f[0][i][j];
        }
      }
    }

    for (let i = 1; i <= N - 1; i++) {
      for (let j = 1; j <= N - 1; j++) {
        f[1][i][j] = inertiaFactor *
          f[0][i][j] + V * V / 2.0 * dt * dt / (DD * DD) *
          (f[0][i + 1][j] + f[0][i - 1][j] + f[0][i][j + 1] + f[0][i][j - 1] - 4.0 * f[0][i][j]);
      }
    }

    runBoundaries(1);
    runCorners(1);
    initial = false;
    makeHeights();
  }

  let makeHeights = () => {
    this.heights = new Array(N*N);
    for (let i = 0; i < N; i++){
      for (let j = 0; j < N; j++){
        this.heights[i*N+j] = f[1][i][j] * 0.02;
      }
    }
  }


  this.update = (timeDelta) => {
    dt = timeDelta;
    for (let i = 1; i <= N - 1; i++) {
      for (let j = 1; j <= N - 1; j++) {
        f[2][i][j] = inertiaFactor *
          (2.0 * f[1][i][j] - f[0][i][j] + V * V * dt * dt / (DD * DD) *
           (f[1][i + 1][j] + f[1][i - 1][j] + f[1][i][j + 1] + f[1][i][j - 1] - 4.0 * f[1][i][j]));
      }
    }
    runBoundaries(2);
    runCorners(2);

    // Replace the array numbers for the next calculation. Past information is lost here.
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        f[0][i][j] = f[1][i][j];
        f[1][i][j] = f[2][i][j];
      }
    }
    makeHeights();
  }

  let runBoundaries = (s) => {
    // Neumann boundary condition
    for (let i = 1; i <= N - 1; i++) {
      f[s][i][0] = f[s][i][1];
      f[s][i][N] = f[s][i][N - 1];
      f[s][0][i] = f[s][1][i];
      f[s][N][i] = f[s][N - 1][i];
    }
  }
  let runCorners = (s) => {
    // Corner processing
    f[s][0][0] = (f[s][0][1] + f[s][1][0]) / 2;
    f[s][0][N] = (f[s][0][N - 1] + f[s][1][N]) / 2;
    f[s][N][0] = (f[s][N - 1][0] + f[s][N][1]) / 2;
    f[s][N][N] = (f[s][N - 1][N] + f[s][N][N - 1]) / 2;
  }
  this.offset = 0;
  this.len = N*N;
}
export default Waves;
