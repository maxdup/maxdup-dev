import {accent1, accent2} from '../constants';
import Scrambler from 'scrambling-letters';

import vsScript from "../shaders/background.vert";
import fsScript from "../shaders/background.frag";

import {HSLStr, remap, identityMatrix,
        perspectiveMatrix, matrixTranslate, matrixRotate} from "../utils";

let max = 0;
let min = 0;

let c, gl;
let aLoc = [];
let uLoc = [];

let vertexBuffer;

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

let positions = [];
let heights;
let lines = [];


let dt = 0.15 / (targetFPS / 30);
dt = dt /3 *2;

let dd = 1; // space spacing
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
  z: -50,
  sigma2: 200
};

let postPeakPosition = {
  x: 0,
  y: 0,
  z: -40,
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

function initWebGL() {
  c = document.createElement("CANVAS");
  document.body.prepend(c);
  gl = c.getContext("experimental-webgl");
  return gl;
}

function resizeCanvas() {
  c.width = window.innerWidth;
  c.height = window.innerHeight;
  gl.viewport(0, 0, c.width, c.height);
  pjMatrix = perspectiveMatrix(45, window.innerWidth / window.innerHeight, 0.1, 1000.0);
}

let p;
function initShaders() {
  p = gl.createProgram();
  let vs = gl.createShader(gl.VERTEX_SHADER);
  let fs = gl.createShader(gl.FRAGMENT_SHADER);
  vsScript = vsScript.replace(/\%lineColors\%/g, "mat3("+sheensStr+")");

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

let pjMatrix = perspectiveMatrix(45, window.innerWidth / window.innerHeight, 0.1, 1000.0);
let mvMatrix = matrixTranslate(identityMatrix(4), [-0.5, 0, -4]);

function render(){

  requestAnimationFrame(render);

  let now = Date.now();
  let elapsed = now - frameTiming;
  if (elapsed > frameInterval) {

    frameTiming = now - (elapsed % frameInterval);

    updateSheens();
    let lines = [];
    sheens.forEach((s) => { lines = lines.concat(s.origin, s.angle); });
    gl.uniform2fv(uLoc[2], new Float32Array(lines));

    let translation = [-0.5,0,-4];

    let camPitch = 0.6 - 1 * scrollProgress;
    let camYaw = 1 - 0.4 * scrollProgress;
    let cpMatrix = matrixRotate(mvMatrix, camPitch, [1,0,0]);
    cpMatrix = matrixRotate(cpMatrix, camYaw, [0,1,0]);

    gl.uniformMatrix4fv(uLoc[0], false, pjMatrix);
    gl.uniformMatrix4fv(uLoc[1], false, cpMatrix);

    draw();
  }
}

function initBuffers() {
  for (let i = 0; i <= N; i++) {
    for (let j = 0; j <= N; j++) {
      positions = positions.concat([(-N / 2 + i) * l * 0.02, (-N / 2 + j) * l * 0.02]);
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

function draw() {
  theta += Math.PI * 1/180;

  for (let i = 1; i <= N - 1; i++) {
    for (let j = 1; j <= N - 1; j++) {
      f[2][i][j] = inertia(
        2.0 * f[1][i][j] - f[0][i][j] + v * v * dt * dt / (dd * dd) *
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

let init = false
let sheenColors = [[1.0, 0.0, 0.2],
                   [0.2, 0.8, 0.4],
                   [1.0, 1.0, 1.0]];

let sheensStr = [];
[].concat.apply([], sheenColors).forEach((s) => {
  sheensStr.push(s.toFixed(1));
});
sheensStr = sheensStr.join();

let sheens = [makeSheen(),makeSheen(),makeSheen()];

function makeSheen (){
  return {
    inactive: true,
    angle: [0,1],
    origin: [-4,-4],
    speed: 0
  }
}

let sheensActive = false;
let sheensRespawn = false;
function makeSheens(){
  sheensActive = true;
  let a = remap(Math.random(), 10, 70) / 45 * 2
  sheens.forEach((s) => {
    let delta = remap((Math.random()+1) /2, -1.5, 1.5);
    s.inactive = false;
    s.speed = remap(a/3 + delta, 0.25, 1.0) * (60 / targetFPS),
    s.angle = [-a+delta*4, 1];
    s.origin = [-4-delta*4, -4-delta*4];
  });
}

function updateSheen(sheen){
  let dist = sheen.speed/20;
  sheen.angle[0] = Math.min(-0.25, sheen.angle[0] + dist/10);
  sheen.origin[0] += dist;
  sheen.origin[1] += dist;
  sheen.inactive = Math.max(sheen.origin[0], sheen.origin[1]) > 4;
}

function updateSheens(){
  if (!sheensActive){ return }
  sheensActive = false;
  sheens.forEach((s) => {
    !s.inactive && updateSheen(s);
    sheensActive = sheensActive || !s.inactive;
  });
  !sheensActive && sheensRespawn && setTimeout(makeSheens, 2000 + Math.random() * 3000);
}

sheensRespawn = false;
inertiaFactor = 1 - 0.005 * targetFPS / 30;

let sequence = () => {
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
    random: [DELAY + 3000, DELAY + 5000],
    speed: 75,
    afterAll: () => {
      document.querySelector(".stand-in").style.width = '100%';
    }
  });

  let scramble1 = document.querySelector(".stand-in .scramble-stage-1");
  let scramble2 = document.querySelector(".stand-in .scramble-stage-2");
  let scramble3 = document.querySelector(".stand-in .scramble-stage-3");

  scramble1.style.transform = 'scale(1.4)';
  scramble2.style.transform = 'scale(1.4)';
  scramble3.style.transform = 'scale(1.4)';

  supports3D && setTimeout(() => {
    makeSheens();
    sheens[0].inactive = true;
    sheens[0].angle = [0,1];
    sheens[1].inactive = true;
    sheens[1].angle = [0,1];
    sheens[2].speed = 5;
  }, DELAY / 2);

  setTimeout(() => {
    scramble1.style.opacity = 1;
    scramble1.style.transform = 'none';
    scramble2.style.opacity = 1;
    scramble2.style.transform = 'none';

    supports3D && initCondition(initialPeakPosition);
  }, DELAY);

  setTimeout(() => {
    scramble3.style.opacity = 1;
    scramble3.style.transform = 'scale(1)';

    inertiaFactor = 1;

  }, DELAY + 3000);

  supports3D && setTimeout(() => {
    initCondition(postPeakPosition);
  }, DELAY + 3100);

  supports3D && setTimeout(() => {
    sheensRespawn = true;
    makeSheens();
  }, DELAY + 8000);

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
  dt = 0.10 / (targetFPS / 30);
  dt = dt /3 *2;
}


function mobileCheck() {
  let check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};

let supports3D = true;
let run3D = function(){

  // remove fallback image
  document.body.classList.add('gl-enabled');
  initShaders();
  initBuffers();
  initCondition(initialPosition);
  resizeCanvas();

  window.addEventListener("resize", resizeCanvas);
  if (navigator.getBattery){
    navigator.getBattery().then(function(result) {
      if (!result.charging && targetFPS != 30){
        setFPS(30);
      }
    });
  }
  setFPS(mobileCheck() ? 30 : 60);
  render();
}

let run2D = function(){
  supports3D = false;
  let cs = document.getElementsByTagName('canvas');
  for (let i = 0; i < cs.length; i++){
    cs[i].parentNode.removeChild(cs[i]);
  }
}

window.onload = function() {
  if (window.WebGLRenderingContext && initWebGL()){
    run3D();
  } else {
    run2D();
  }
  sequence();
};


// selection Color
let selectColorToggle = false;
let applySelectColor = (event) => {
  let clr = HSLStr(selectColorToggle ? accent2 : accent1);
  document.documentElement.style.setProperty('--select-color', clr);
}
let selectionChanged = () => {
  if (window.getSelection().toString() != ''){
    selectColorToggle = !selectColorToggle
    document.removeEventListener('selectionchange', selectionChanged);
  }
}
document.addEventListener('selectstart', (event) => {
  applySelectColor();
  document.addEventListener('selectionchange', selectionChanged);
});
applySelectColor();

// link Color
let linkColorToggle = false;
let applyLinkColor = (event) => {
  let clr = HSLStr(linkColorToggle ? accent2 : accent1);
  document.documentElement.style.setProperty('--link-color', clr);
}
let linkHovered = () => {
  console.log('link hover')
  linkColorToggle = !linkColorToggle;
  applyLinkColor();
}
let links = document.getElementsByTagName('a');
[...links].forEach((l) => {
  l.addEventListener('mouseover', linkHovered);
});
linkHovered();
