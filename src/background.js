import {accent1, accent2} from './constants';
import {HSLStr} from './utils';
import Scrambler from 'scrambling-letters';

import vsScript from "./shaders/background.vert";
import fsScript from "./shaders/background.frag";

import {remap, easeOut, easeInOut} from "./utils";

let max = 0;
let min = 0;

let c, gl;
let aLoc = [];
let uLoc = [];

let positions = [];
let dists = [];

let mvMatrix = mat4.create();
let pMatrix = mat4.create();

let vertexBuffer;
let distBuffer;

function inertia(val){
  return val * inertiaFactor;
}
let theta = 0;

let scrollProgress = 0; // 0-1
window.addEventListener('scroll', () => {
  scrollProgress = document.documentElement.scrollTop /
    (document.documentElement.scrollHeight - document.documentElement.clientHeight);
});


let targetFPS = 60;
let frameTiming = Date.now();
let frameInterval =  1000 / targetFPS;
let inertiaFactor;

//Size of two-dimensional square lattice
let N = 50;
let l = 6;

let dt = 0.15 / (targetFPS / 30);
dt = dt /3 *2;

let dd = 1.0; // space spacing
let v = 4; // velocity

// Set boundary condition
let BC = "Neumann";

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
        f[0][i][j] = initial || Math.abs(z) > Math.abs(f[0][i][j]) ? z : f[0][i][j];
      }
    }
  }
  for (let i = 1; i <= N - 1; i++) {
    for (let j = 1; j <= N - 1; j++) {
      f[1][i][j] = f[0][i][j] + v * v / 2.0 * dt * dt / (dd * dd) * (f[0][i + 1][j] + f[0][i - 1][j] + f[0][i][j + 1] + f[0][i][j - 1] - 4.0 * f[0][i][j]);
    }
  }
  if (BC == "Neumann") {
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
  c = document.createElement("CANVAS");
  document.body.prepend(c);
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
  gl.shaderSource(vs, vsScript);
  gl.shaderSource(fs, fsScript);
  gl.compileShader(vs);
  gl.compileShader(fs);
  gl.attachShader(p, vs);
  gl.attachShader(p, fs);
  gl.linkProgram(p);
  gl.useProgram(p);
  aLoc[0] = gl.getAttribLocation(p, "position");
  aLoc[1] = gl.getAttribLocation(p, "dist");
  gl.enableVertexAttribArray(aLoc[0]);
  gl.enableVertexAttribArray(aLoc[1]);
  uLoc[0] = gl.getUniformLocation(p, "pjMatrix");
  uLoc[1] = gl.getUniformLocation(p, "mvMatrix");
}

function makeSheen (color){
  // consider we spawn and despawn at [4,4] and [-4,-4]
  let a = remap(Math.random(), 10, 70) / 45 * 2
  let sheen = {
    a: a,
    b: 1,
    c: 4*(a+1),
    speed: a * remap(Math.random(), 1, 2),
    color: color
  }
  return sheen
}
function updateSheen(sheen){
  sheen.c -= sheen.speed/10;
  sheen.a += sheen.speed/800;
  if (distToLine(4,4,sheen) < 0.5){
    Object.assign(sheen, makeSheen(sheen.color));
  }
}

function render(){

  requestAnimationFrame(render);

  let now = Date.now();
  let elapsed = now - frameTiming;
  if (elapsed > frameInterval) {

    frameTiming = now - (elapsed % frameInterval);

    [sheen1, sheen2, sheen3].forEach((s) => { updateSheen(s); });

    let rad = 0.6 - 1 * scrollProgress;
    let rad2 = 1 - 0.4 * scrollProgress;

    mat4.perspective(pMatrix, 45, window.innerWidth / window.innerHeight, 0.1, 1000.0);
    mat4.identity(mvMatrix);
    let translation = vec3.create();

    vec3.set(translation, -0.5, 0, -4);
    mat4.translate(mvMatrix, mvMatrix, translation);

    mat4.rotate(mvMatrix, mvMatrix, rad, [1, 0, 0]);
    mat4.rotate(mvMatrix, mvMatrix, rad2, [0, 1, 0]);

    gl.uniformMatrix4fv(uLoc[0], false, pMatrix);
    gl.uniformMatrix4fv(uLoc[1], false, mvMatrix);

    draw();
  }
}

let sheen1 = makeSheen([0.9,0,0.2]);
let sheen2 = makeSheen([0,0.2,1]);
let sheen3 = makeSheen([1,1,1]);

setTimeout(() => { sheen2 = makeSheen(sheen2.color); }, 2000);
setTimeout(() => { sheen3 = makeSheen(sheen3.color); }, 6000);


function initBuffers() {
  for (let i = 0; i <= N; i++) {
    for (let j = 0; j <= N; j++) {
      positions = positions.concat([(-N / 2 + i) * l * 0.02, 0, (-N / 2 + j) * l * 0.02]);
      dists = dists.concat([0, 0, 0]);
    }
  }

  vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.DYNAMIC_DRAW);
  gl.vertexAttribPointer(aLoc[0], 3, gl.FLOAT, false, 0, 0);

  distBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, distBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(dists), gl.DYNAMIC_DRAW);
  gl.vertexAttribPointer(aLoc[1], 3, gl.FLOAT, false, 0, 0);
}


function distToLine(x, y, l) {
  return Math.abs((l.a*x) + (l.b*y) + l.c) / Math.sqrt(Math.pow(l.a,2) + Math.pow(l.b,2))
}

function draw() {
  theta += Math.PI * 1/180;

  for (let i = 1; i <= N - 1; i++) {
    for (let j = 1; j <= N - 1; j++) {
      f[2][i][j] = 2.0 * f[1][i][j] - f[0][i][j] + v * v * dt * dt / (dd * dd) *
        (f[1][i + 1][j] + f[1][i - 1][j] + f[1][i][j + 1] + f[1][i][j - 1] - 4.0 * f[1][i][j]);
      f[2][i][j] = inertia(f[2][i][j]);
    }
  }
  if (BC == "Neumann") {
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

  for (let i = 0; i <= N; i++) {
    for (let j = 0; j <= N; j++) {
      let k = 3*(i*(N+1)+j);

      positions[k + 1] = inertia(f[1][i][j] * 0.02);

      // update distances
      dists[k + 0] = distToLine(positions[k], positions[k + 2], sheen1);
      dists[k + 1] = distToLine(positions[k], positions[k + 2], sheen2);
      dists[k + 2] = distToLine(positions[k], positions[k + 2], sheen3);
    }
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(positions));

  gl.bindBuffer(gl.ARRAY_BUFFER, distBuffer);
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(dists));

  gl.drawArrays(gl.POINTS, 0, positions.length / 3);
  gl.flush();
}
let init = false

let sequence = () => {

  inertiaFactor = 1 - 0.001 * targetFPS / 30;
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
    speed: 75,
    afterAll: () => {
      document.querySelector(".stand-in").style.width = '100%';
    }
  });

  initCondition(initialPosition);

  let scramble1 = document.querySelector(".stand-in .scramble-stage-1");
  let scramble2 = document.querySelector(".stand-in .scramble-stage-2");
  let scramble3 = document.querySelector(".stand-in .scramble-stage-3");

  scramble1.style.transform = 'scale(1.4)';
  scramble2.style.transform = 'scale(1.4)';
  scramble3.style.transform = 'scale(1.4)';

  setTimeout(() => {
    scramble1.style.opacity = 1;
    scramble1.style.transform = 'none';
    scramble2.style.opacity = 1;
    scramble2.style.transform = 'none';

    initCondition(initialPeakPosition);
  }, DELAY);
  setTimeout(() => {
    scramble3.style.opacity = 1;
    scramble3.style.transform = 'scale(1)';

    inertiaFactor = 1;

  }, DELAY + 2000);
  setTimeout(() => {
    initCondition(postPeakPosition);
  }, DELAY + 2100);
}


let content = document.querySelectorAll(".reserved-space")[0];
let clonetent = content.cloneNode(true);
content.style.opacity = 0;

clonetent.querySelector(".scramble-stage-1").style.opacity = 0;
clonetent.querySelector(".scramble-stage-2").style.opacity = 0;
clonetent.querySelector(".scramble-stage-3").style.opacity = 0;


clonetent.classList.add('stand-in');
document.getElementById("main-content").appendChild(clonetent);

let setFPS = (fps) => {
  targetFPS = fps;
  frameInterval =  1000 / targetFPS;
  dt = 0.15 / (targetFPS / 30);
  dt = dt /3 *2;
}

function mobileCheck() {
  let check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};

window.onload = function() {

  initWebGL();
  initShaders();

  sequence();
  initBuffers();

  if (navigator.getBattery){
    navigator.getBattery().then(function(result) {
      if (!result.charging && targetFPS != 30){
        setFPS(30);
      }
    });
  }
  setFPS(mobileCheck() ? 30 : 60);
  render();
};


// selection Color
let colorToggle = false;
let applySelectColor = (event) => {
  let clr = HSLStr(colorToggle ? accent2 : accent1);
  document.documentElement.style.setProperty('--select-color', clr);
}
let selectionChanged = () => {
  if (window.getSelection().toString() != ''){
    colorToggle = !colorToggle
    document.removeEventListener('selectionchange', selectionChanged);
  }
}
document.addEventListener('selectstart', (event) => {
  applySelectColor();
  document.addEventListener('selectionchange', selectionChanged);
});
applySelectColor();
