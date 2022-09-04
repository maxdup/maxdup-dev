import Scrambler from 'scrambling-letters';

let c, gl;
let aLoc = [];
let uLoc = [];

let positions = [];
let colors = [];

let translation;
let scale;
let eye;
let center;
let up;
let view;
let mvMatrix = mat4.create();
let pMatrix = mat4.create();
let vertexBuffer;
let colorBuffer;

function inertia(val){
  //return Math.min(val * 0.95, val-0.01);
  return val * inertiaFactor;
}
let theta = 0;

let scrollProgress = 0; // 0-1
window.addEventListener('scroll', () => {
  scrollProgress = document.body.scrollTop /
    (document.body.scrollHeight - document.body.clientHeight);
});


const FPS = 60;
let frameTiming = Date.now();
let frameInterval =  1000 / FPS;
let inertiaFactor;

//Size of two-dimensional square lattice
let N = 50;
let l = 6;

let dt = 0.15 / (FPS / 30);
dt = dt /3 *2;
let dd = 1.0; // space spacing
let v = 4; // velocity

// Set boundary condition
let BC = "Neumann"; //or "Dirichlet"

let initialPosition = {
  x: 0,
  y: 0,
  z: 0,
  sigma2: 100
};
let initialPeakPosition = {
  x: 0,
  y: 0,
  z: 50,
  sigma2: 300
};

let postPeakPosition = {
  x: 0,
  y: 0,
  z: 40,
  sigma2: 200
};

let Tn = 3;
let f = new Array(Tn);
let initial = true;

function initCondition(parameter) {
  let x0 = parameter.x;
  let y0 = parameter.y;
  let z0 = parameter.z;
  let sigma2 = parameter.sigma2;

  for (let t = 0; t < Tn; t++) {
    if (initial){
      f[t] = new Array(N);
    }
    for (let i = 0; i <= N; i++) {
      if (initial){
        f[t][i] = new Array(N);
      }
      for (let j = 0; j <= N; j++) {
        let x = (-N / 2 + i) * l;
        let y = (-N / 2 + j) * l;
        // initial conditions
        let z = z0 * Math.exp(-(Math.pow(x - x0, 2) + Math.pow(y - y0, 2)) / (2 * sigma2));
        f[0][i][j] = initial ? z : Math.max(z, f[0][i][j]);
      }
    }
  }
  for (let i = 1; i <= N - 1; i++) {
    for (let j = 1; j <= N - 1; j++) {
      f[1][i][j] = f[0][i][j] + v * v / 2.0 * dt * dt / (dd * dd) * (f[0][i + 1][j] + f[0][i - 1][j] + f[0][i][j + 1] + f[0][i][j - 1] - 4.0 * f[0][i][j]);
    }
  }
  if (BC == "Dirichlet") {
    // Dirichlet boundary condition
    for (let i = 0; i <= N; i++) {
      f[1][i][0] = f[1][i][N] = f[1][0][i] = f[1][N][i] = 0.0; // boundary condition
    }
  } else if (BC == "Neumann") {
    // Neumann boundary condition
    for (let i = 1; i <= N - 1; i++) {
      f[1][i][0] = f[1][i][1];
      f[1][i][N] = f[1][i][N - 1];
      f[1][0][i] = f[1][1][i];
      f[1][N][i] = f[1][N - 1][i];
    }
    // Corner processing
    f[1][0][0] = (f[1][0][1] + f[1][1][0]) / 2;
    f[1][0][N] = (f[1][0][N - 1] + f[1][1][N]) / 2;
    f[1][N][0] = (f[1][N - 1][0] + f[1][N][1]) / 2;
    f[1][N][N] = (f[1][N - 1][N] + f[1][N][N - 1]) / 2;
  }
  initial = false;
}

function initWebGL() {
    c = document.getElementById("c");
    gl = c.getContext("experimental-webgl");

    resizeCanvas();
    window.addEventListener("resize", function(){
        resizeCanvas();
    });
}

function resizeCanvas() {
    c.width = window.innerWidth;
    c.height = window.innerHeight;
    gl.viewport(0, 0, c.width, c.height);
}

function initShaders() {
    let p = gl.createProgram();
    let vs = gl.createShader(gl.VERTEX_SHADER);
    let fs = gl.createShader(gl.FRAGMENT_SHADER);
    let v = document.getElementById("vs").textContent;
    let f = document.getElementById("fs").textContent;
    gl.shaderSource(vs, v);
    gl.shaderSource(fs, f);
    gl.compileShader(vs);
    gl.compileShader(fs);
    gl.attachShader(p, vs);
    gl.attachShader(p, fs);
    gl.linkProgram(p);
    gl.useProgram(p);
    aLoc[0] = gl.getAttribLocation(p, "position");
    aLoc[1] = gl.getAttribLocation(p, "color");
    gl.enableVertexAttribArray(aLoc[0]);
    gl.enableVertexAttribArray(aLoc[1]);
    uLoc[0] = gl.getUniformLocation(p, "pjMatrix");
    uLoc[1] = gl.getUniformLocation(p, "mvMatrix");
}

function initBuffers() {
    for (let i = 0; i <= N; i++) {
        for (let j = 0; j <= N; j++) {
            positions = positions.concat([0, 0, 0]);
            colors = colors.concat([0, 0, 0, 1.0]);
        }
    }

    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(aLoc[0], 3, gl.FLOAT, false, 0, 0);

    colorBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(aLoc[1], 3, gl.FLOAT, false, 0, 0);
}

function render(){

  requestAnimationFrame(render);

  let now = Date.now();
  let elapsed = now - frameTiming;
  if (elapsed > frameInterval) {

    frameTiming = now - (elapsed % frameInterval);

    let rad = 0.6 - 1 * scrollProgress;
    let rad2 = 1 - 0.4 * scrollProgress;

    mat4.perspective(pMatrix, 45, window.innerWidth / window.innerHeight, 0.1, 1000.0);
    mat4.identity(mvMatrix);
    let translation = vec3.create();

    vec3.set(translation, -0.5, 0, -2);
    mat4.translate(mvMatrix, mvMatrix, translation);

    mat4.rotate(mvMatrix, mvMatrix, rad, [1, 0, 0]);
    mat4.rotate(mvMatrix, mvMatrix, rad2, [0, 1, 0]);

    gl.uniformMatrix4fv(uLoc[0], false, pMatrix);
    gl.uniformMatrix4fv(uLoc[1], false, mvMatrix);

    draw();
  }
}

function draw() {
  theta += Math.PI * 1/180;

  for (let i = 1; i <= N - 1; i++) {
    for (let j = 1; j <= N - 1; j++) {
      f[2][i][j] = 2.0 * f[1][i][j] - f[0][i][j] + v * v * dt * dt / (dd * dd) * (f[1][i + 1][j] + f[1][i - 1][j] + f[1][i][j + 1] + f[1][i][j - 1] - 4.0 * f[1][i][j]);
      f[2][i][j] = inertia(f[2][i][j]);
    }
  }
  if (BC == "Dirichlet") {
    // Dirichlet boundary condition
    for (let i = 0; i <= N; i++) {
      f[2][i][0] = f[2][i][N] = f[2][0][i] = f[2][N][i] = 0.0; // boundary condition
    }
  } else if (BC == "Neumann") {
    // Neumann boundary condition
    for (let i = 1; i <= N - 1; i++) {
      f[2][i][0] = f[2][i][1];
      f[2][i][N] = f[2][i][N - 1];
      f[2][0][i] = f[2][1][i];
      f[2][N][i] = f[2][N - 1][i];
    }
    // Corner processing
    f[2][0][0] = (f[2][0][1] + f[2][1][0]) / 2;
    f[2][0][N] = (f[2][0][N - 1] + f[2][1][N]) / 2;
    f[2][N][0] = (f[2][N - 1][0] + f[2][N][1]) / 2;
    f[2][N][N] = (f[2][N - 1][N] + f[2][N][N - 1]) / 2;

  }
  // Replace the array numbers for the next calculation. Past information is lost here.
  for (let i = 0; i <= N; i++) {
    for (let j = 0; j <= N; j++) {
      f[0][i][j] = f[1][i][j];
      f[1][i][j] = f[2][i][j];
    }
  }

  let k = 0;
  for (let i = 0; i <= N; i++) {
    for (let j = 0; j <= N; j++) {
      let x = (-N / 2 + i) * l * 0.02;
      let y = f[1][i][j] * 0.02;
      let z = (-N / 2 + j) * l * 0.02;

      positions[k * 3 + 0] = x;
      positions[k * 3 + 1] = inertia(y);
      positions[k * 3 + 2] = z;

      /*
        colors[k * 3 + 0] = x + 0.5;
        colors[k * 3 + 1] = y + 0.5;
        colors[k * 3 + 2] = z + 0.5;
      */

      colors[k * 3 + 0] = 0.5;
      colors[k * 3 + 1] = 0.5;
      colors[k * 3 + 2] = 0.5;

      k++;
    }
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(positions));

  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(colors));

  //gl.drawArrays(gl.LINE_STRIP, 0, positions.length / 3);
  gl.drawArrays(gl.POINTS, 0, positions.length / 3);
  gl.flush();
}
let init = false

window.onload = function() {
  initWebGL();
  initShaders();

  sequence();
  initBuffers();
  render();

};

let sequence = () => {

  inertiaFactor = 1 - 0.01 * FPS / 30;

  let content = document.querySelectorAll(".reserved-space")[0];
  let clonetent = content.cloneNode(true);

  clonetent.classList.add('stand-in');
  document.getElementById("main-content").appendChild(clonetent);
  const DELAY = 1000;

  Scrambler({
    target: '.stand-in .scramble-stage-1',
    random: [DELAY + 500, DELAY + 1000],
    speed: 75
  });
  Scrambler({
    target: '.stand-in .scramble-stage-2 i, .stand-in .scramble-stage-2 b',
    random: [DELAY + 500, DELAY + 2000],
    speed: 75
  });
  Scrambler({
    target: '.stand-in .scramble-stage-3',
    random: [DELAY + 2000, DELAY + 4000],
    speed: 75
  });

  initCondition(initialPosition);

  setTimeout(() => {
    document.querySelector(".stand-in .scramble-stage-1").style.opacity = 1;
    document.querySelector(".stand-in .scramble-stage-2").style.opacity = 1;
    document.querySelectorAll(".scramble-stage-1").forEach((e) => {
      e.style.transform = 'scale(1)'});
    document.querySelectorAll(".scramble-stage-2").forEach((e) => {
      e.style.transform = 'scale(1)'});
    initCondition(initialPeakPosition);
  }, DELAY);
  setTimeout(() => {
    document.querySelector(".stand-in .scramble-stage-3").style.opacity = 1;
    document.querySelectorAll(".scramble-stage-3").forEach((e) => {
      e.style.transform = 'scale(1)'});
    inertiaFactor = 1;

  }, DELAY + 2000);
  setTimeout(() => {
    initCondition(postPeakPosition);
  }, DELAY + 2100);
}
