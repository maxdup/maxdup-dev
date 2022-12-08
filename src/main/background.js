import vsScript from "../shaders/background.vert";
import fsScript from "../shaders/background.frag";


import {remap, identityMatrix,
        perspectiveMatrix, matrixTranslate, matrixRotate} from "../utils";

//Size of two-dimensional square lattice
const N = 50;
const L = 6;
const Tn = 3;

const DD = 1; // space spacing
const V = 4; // velocity

const SHEEN_COLORS = [[1.0, 0.0, 0.2],
                      [0.2, 0.8, 0.4],
                      [1.0, 1.0, 1.0]];

function makeSheen (){
  return {
    inactive: true,
    angle: [0,1],
    origin: [-4,-4],
    speed: 0
  }
}
function sheensToString(){
  let sheensStr = [];
  [].concat.apply([], SHEEN_COLORS).forEach((s) => {
    sheensStr.push(s.toFixed(1));
  });
  return sheensStr.join();
}

const SHEENS_STR = sheensToString();

let gl, c, p;
let initial = true;
let pjMatrix = null;
let mvMatrix = matrixTranslate(identityMatrix(4), [-0.5, 0, -4]);

let aLoc = [];
let uLoc = [];

let targetFPS = 60;
let frameTiming = Date.now();
let frameInterval =  1000 / targetFPS;

let vertexBuffer;
let positions = [];
let heights;

let inertiaFactor;
let f = new Array(Tn);
let dt; // deltatime

let scrollProgress = 0;


const MSGS = {
  initialize: 0,
  start: 1,
  setSize: 2,
  setInertia: 3,
  setPositions: 4,
  setSheens: 5,
  setFPS: 6,
  setProgress: 7,
}

self.onmessage = (ev) => {

  switch(MSGS[ev.data.msg]){
  case MSGS.init:
    self.initWebGL(ev.data.canvas);
    break;
  case MSGS.start:
    self.start();
    break;
  case MSGS.setSize:
    self.setSize(ev.data.value.width, ev.data.value.height);
    break;
  case MSGS.setProgress:
    self.setProgress(ev.data.value)
    break;
  case MSGS.setInertia:
    self.setInertia(ev.data.value);
    break;
  case MSGS.setPositions:
    self.setPositions(ev.data.value);
    break;
  case MSGS.setSheens:
    self.setSheens(ev.data.value);
    break;
  case MSGS.setFPS:
    self.setFPS(ev.data.value);
  }
}

self.initWebGL = (canvas) => {
  c = canvas;
  gl = canvas.getContext("webgl");
}

self.initShaders = () => {
  p = gl.createProgram();

  let vs = gl.createShader(gl.VERTEX_SHADER);
  let fs = gl.createShader(gl.FRAGMENT_SHADER);
  vsScript = vsScript.replace(/\%lineColors\%/g, "mat3("+SHEENS_STR+")");

  gl.shaderSource(vs, vsScript);
  gl.shaderSource(fs, fsScript);
  gl.compileShader(vs);
  gl.compileShader(fs);
  gl.attachShader(p, vs);
  gl.attachShader(p, fs);

  gl.linkProgram(p);
  gl.useProgram(p);
  aLoc[0] = gl.getAttribLocation(p, "position");
  aLoc[1] = gl.getAttribLocation(p, "height");
  gl.enableVertexAttribArray(aLoc[0]);
  gl.enableVertexAttribArray(aLoc[1]);
  uLoc[0] = gl.getUniformLocation(p, "pjMatrix");
  uLoc[1] = gl.getUniformLocation(p, "mvMatrix");
  uLoc[2] = gl.getUniformLocation(p, "lines");
}

self.initBuffers = () => {
  for (let i = 0; i <= N; i++) {
    for (let j = 0; j <= N; j++) {
      positions = positions.concat([(-N / 2 + i) * L * 0.02, (-N / 2 + j) * L * 0.02]);
    }
  }
  heights = new Array((N+1)*(N+1)).fill(0);

  vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.DYNAMIC_DRAW);
  gl.vertexAttribPointer(aLoc[0], 2, gl.FLOAT, false, 0, 0);

  vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(heights), gl.DYNAMIC_DRAW);
  gl.vertexAttribPointer(aLoc[1], 1, gl.FLOAT, false, 0, 0);
}

self.setPositions = (parameter) => {
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
      f[1][i][j] = f[0][i][j] + V * V / 2.0 * dt * dt / (DD * DD) *
        (f[0][i + 1][j] + f[0][i - 1][j] + f[0][i][j + 1] + f[0][i][j - 1] - 4.0 * f[0][i][j]);
    }
  }
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
  initial = false;
}

self.render = () => {
  requestAnimationFrame(self.render);

  let now = Date.now();
  let elapsed = now - frameTiming;
  if (elapsed > frameInterval) {

    frameTiming = now - (elapsed % frameInterval);

    updateSheens();
    let lines = [];
    self.sheens.forEach((s) => { lines = lines.concat(s.origin, s.angle); });
    gl.uniform2fv(uLoc[2], new Float32Array(lines));

    let translation = [-0.5,0,-4];

    let camPitch = 0.6 - 1 * scrollProgress;
    let camYaw = 1 - 0.4 * scrollProgress;
    let cpMatrix = matrixRotate(mvMatrix, camPitch, [1,0,0]);
    cpMatrix = matrixRotate(cpMatrix, camYaw, [0,1,0]);

    gl.uniformMatrix4fv(uLoc[0], false, pjMatrix);
    gl.uniformMatrix4fv(uLoc[1], false, cpMatrix);

    self.draw();
  }
}

self.draw = () => {
  for (let i = 1; i <= N - 1; i++) {
    for (let j = 1; j <= N - 1; j++) {
      f[2][i][j] = inertiaFactor *
        (2.0 * f[1][i][j] - f[0][i][j] + V * V * dt * dt / (DD * DD) *
         (f[1][i + 1][j] + f[1][i - 1][j] + f[1][i][j + 1] + f[1][i][j - 1] - 4.0 * f[1][i][j]));
    }
  }
  for (let i = 1; i <= N - 1; i++) {
    // Neumann boundary condition
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

  // Replace the array numbers for the next calculation. Past information is lost here.
  for (let i = 0; i <= N; i++) {
    for (let j = 0; j <= N; j++) {
      f[0][i][j] = f[1][i][j];
      f[1][i][j] = f[2][i][j];

      heights[(i*(N+1)+j)] = f[1][i][j] * 0.02;
    }
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(heights));

  gl.drawArrays(gl.POINTS, 0, heights.length);
  gl.flush();
}


// --------------------
// Sheens Processing
// --------------------
self.sheens = [makeSheen(),makeSheen(),makeSheen()];
self.sheensRespawn = false;

let sheensActive = false;

self.setSheens = (cfg) => {
  sheensActive = true;
  if (cfg?.respawn !== undefined) {
    self.sheensRespawn = cfg.respawn;
  }
  let a = remap(Math.random(), 10, 70) / 45 * 2
  self.sheens.forEach((s) => {
    let delta = remap((Math.random()+1) /2, -1.5, 1.5);
    s.inactive = false;
    s.speed = remap(a/3 + delta, 0.25, 1.0) * (60 / targetFPS),
    s.angle = [-a+delta*4, 1];
    s.origin = [-4-delta*4, -4-delta*4];
  });
  if (!cfg || !cfg.sheens) { return }
  for (let i = 0; i < cfg.sheens.length; i++){
    Object.assign(self.sheens[i], cfg.sheens[i]);
  }
}

let updateSheen = (sheen) => {
  let dist = sheen.speed/20;
  sheen.angle[0] = Math.min(-0.25, sheen.angle[0] + dist/10);
  sheen.origin[0] += dist;
  sheen.origin[1] += dist;
  sheen.inactive = Math.max(sheen.origin[0], sheen.origin[1]) > 4;
}

let updateSheens = () => {
  if (!sheensActive){ return }
  sheensActive = false;
  self.sheens.forEach((s) => {
    !s.inactive && updateSheen(s);
    sheensActive = sheensActive || !s.inactive;
  });
  !sheensActive && self.sheensRespawn && setTimeout(
    self.setSheens, 2000 + Math.random() * 3000);
}


self.setSize = (width, height) => {
  c.width = width;
  c.height = height;
  gl.viewport(0, 0, width, height);
  pjMatrix = perspectiveMatrix(45, width / height, 0.1, 1000.0);
}

self.setInertia = (val) => {
  inertiaFactor = 1 - val * targetFPS / 30;
}

self.setProgress = (val) => {
  scrollProgress = val;
}

self.setFPS = (fps) => {
  targetFPS = fps;
  frameInterval =  1000 / targetFPS;
  dt = 0.10 / (targetFPS / 30);
  dt = dt /3 *2;
}

self.start = () => {
  self.initShaders()
  self.initBuffers();
  self.render();
}

self.setFPS(targetFPS);
