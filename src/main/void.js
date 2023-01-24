import vsScript from "../shaders/background.vert";
import fsScript from "../shaders/background.frag";
import sfsScript from "../shaders/sprite.frag";

import {
  remap,
  identityMatrix,
  perspectiveMatrix,
  matrixTranslate,
  matrixRotate} from "../utils";

//Size of two-dimensional square lattice
const N = 50; // duped
const L = 6; // duped
let dt = 0;

let gl, glExt, c;

let dotProgram = null;
let lineProgram = null;

let pjMatrix = null;
let cpMatrix = null;
let mvMatrix = matrixTranslate(identityMatrix(4), [-0.5, 0, -6]);


let texture = null;

let daLoc = [];
let duLoc = [];
let laLoc = [];
let luLoc = [];

let dotBuffer;
let lineBuffer;
let positions = [];

let connections = [];
let connectedIdPairs = [];

let connectedHeights = [];
let allHeights = null;

let scrollProgress = 0;


function Void(waves, sheens){

  this.waves = waves;
  this.sheens = sheens;

  this.targetFPS = 60;

  let frameTiming = Date.now();  // ms
  let frameInterval =  1000 / this.targetFPS;  // ms

  this.loseCTX = () => {
    glExt.loseContext();
  }

  this.initWebGL = (canvas) => {
    c = canvas;
    gl = canvas.getContext("webgl") || canvas.getContext('experimental-webgl');
    glExt = gl.getExtension('WEBGL_lose_context');

    canvas.addEventListener('webglcontextrestored', this.start);
    canvas.addEventListener("webglcontextlost", (event) => {
      event.preventDefault();
      setTimeout(() => { glExt.restoreContext(); });
    }, false);
  }

  this.initShaders = () => {
    dotProgram = gl.createProgram();
    lineProgram = gl.createProgram();

    let vs = gl.createShader(gl.VERTEX_SHADER);
    let fs = gl.createShader(gl.FRAGMENT_SHADER);
    let sfs = gl.createShader(gl.FRAGMENT_SHADER);
    vsScript = vsScript.replace(/\%lineColors\%/g, "mat3("+this.sheens.str+")");

    gl.shaderSource(vs, vsScript);
    gl.shaderSource(fs, fsScript);
    gl.shaderSource(sfs, sfsScript);

    gl.compileShader(vs);
    gl.compileShader(fs);
    gl.compileShader(sfs);

    gl.attachShader(lineProgram, vs);
    gl.attachShader(lineProgram, fs);
    gl.attachShader(dotProgram, vs);
    gl.attachShader(dotProgram, sfs);

    gl.linkProgram(dotProgram);
    gl.linkProgram(lineProgram);

    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  }

  this.initBuffers = () => {

    positions = Array.from( // [x1, y1, x2, y2, x3, y3....]
      Array.from({length: N*N*2}, (_,i) => Math.floor(i/2)),
      (id,i) => L * 0.02 * (-N / 2 + (Math.floor(id/N) * (1-i%2)) + (id%N * (i%2))));

    connections = new Array(N*N).fill(0);
    connectedIdPairs = [];
    for (let i = 0; i <= N; i++){
      connectedIdPairs.push(0);
      connectedIdPairs.push(i*N - i);
    }


    for (let i = 0; i < N*N; i++){
      connections[i] = Math.max(0, Math.floor(Math.random() * 64) - 62);
    }
    connectedIdPairs = [];

    for (let x = 0; x < N; x++){
      for (let y = 0; y < N; y++){

        let id = x * N + y;

        if (connections[id] == 0){ continue }
        let npairs = 0;
        let dist = 0;

        while (npairs < connections[id] +1 && dist < N){
          for (let j = 0; j < dist; j++){

            let sy = y + j;
            let sxp = x + dist - j;
            let sxm = x - dist + j;

            function testpair(c){
              if (connections[c] > 0) {
                connectedIdPairs.push(id);
                connectedIdPairs.push(c);
                npairs++;
                return true;
              }
            }
            if (sy < N && sxp < N && testpair(sxp * N + sy)) { continue }
            if (sy < N && sxm >= 0 && testpair(sxm * N + sy)) { continue }
          }
          dist++;
        }
      }
    }
    allHeights = new Array(N*N + connectedIdPairs.length/2);

    let connectedPositions = new Array(connectedIdPairs.length*2).fill(0);
    let connectedConnections = new Array(connectedIdPairs.length).fill(0);
    connectedHeights = new Array(connectedIdPairs.length).fill(0);

    mapConnected([...positions], connectedPositions);
    mapConnected([...connections], connectedConnections);
    mapConnected([...allHeights], connectedHeights);

    let allPositions = [...positions, ...connectedPositions];
    let allConnections = [...connections, ...connectedConnections];
    allHeights = new Array(N*N).fill(0).concat(connectedHeights);


    function glSetAttributes(p, aLoc){
      aLoc[0] = gl.getAttribLocation(p, "position");
      aLoc[1] = gl.getAttribLocation(p, "nconnection");
      aLoc[2] = gl.getAttribLocation(p, "height");
      gl.enableVertexAttribArray(aLoc[0]);
      gl.enableVertexAttribArray(aLoc[1]);
      gl.enableVertexAttribArray(aLoc[2]);
    }
    function glSetUniforms(p, uLoc){
      uLoc[0] = gl.getUniformLocation(p, "pjMatrix");
      uLoc[1] = gl.getUniformLocation(p, "mvMatrix");
      uLoc[2] = gl.getUniformLocation(p, "sheens");

      gl.uniform2f(gl.getUniformLocation(p, 'screenSize'), c.width, c.height);
    }

    function glBuffer(destaLoc, size, data){
      let buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.DYNAMIC_DRAW);
      gl.vertexAttribPointer(destaLoc, size, gl.FLOAT, false, 0, 0);
      return buffer;
    }

    function glTexture(){
      texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(
        gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
        new Uint8Array([0, 0, 255, 255]));
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }

    // Dots
    gl.useProgram(dotProgram);

    glSetAttributes(dotProgram, daLoc);
    glSetUniforms(dotProgram, duLoc);

    glTexture();

    glBuffer(daLoc[0], 2, allPositions);
    glBuffer(daLoc[1], 1, allConnections);
    dotBuffer = glBuffer(daLoc[2], 1, allHeights);

    this.setImage();

    // Lines
    gl.useProgram(lineProgram);

    glSetAttributes(lineProgram, laLoc);
    glSetUniforms(lineProgram, luLoc);

    lineBuffer = glBuffer(laLoc[2], 1, allHeights);
  }

  function mapConnected(sourceArray, destArray){
    let times = destArray.length / connectedIdPairs.length;
    for (let i = 0; i < connectedIdPairs.length; i++){
      for (let n = 0; n < times; n++){
        destArray[i*times+n] = sourceArray[connectedIdPairs[i]*times+n];
      }
    }
  }

  this.setImage = async () => {
    const res = await fetch(require('../images/dot.jpg'), {mode: 'cors'});
    const blob = await res.blob();
    const bitmap = await createImageBitmap(blob, {
      premultiplyAlpha: 'none',
      colorSpaceConversion: 'none',
    });

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, bitmap);
  }

  this.render = () => {
    requestAnimationFrame(this.render);

    let now = Date.now();
    let elapsed = now - frameTiming; // ms
    if (elapsed > frameInterval) {

      frameTiming = now - (elapsed % frameInterval);

      this.sheens.update(elapsed);
      this.waves.update(dt);
      updateCam();

      // ingest sheens
      let sh = Array.from(this.sheens.array, (s,i) => [...s.origin, ...s.angle]).flat();

      // ingest heights
      for (let i = 0; i < N*N; i++){
        let x = Math.floor(i/N);
        let y = i % N;
        allHeights[i] = this.waves.f[1][x][y] * 0.02;
      }
      mapConnected(allHeights, connectedHeights);
      for (let i = 0; i < connectedHeights.length; i++){
        allHeights[i+N*N] = connectedHeights[i];
      }

      let glUpdateUniforms = (uLoc) => {
        gl.uniformMatrix4fv(uLoc[0], false, pjMatrix);
        gl.uniformMatrix4fv(uLoc[1], false, cpMatrix);
        gl.uniform2fv(uLoc[2], new Float32Array(sh));
      }

      let glUpdateHeights = (buffer) => {
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(allHeights));
      }

      gl.useProgram(dotProgram);
      glUpdateUniforms(duLoc);
      glUpdateHeights(dotBuffer);

      gl.drawArrays(gl.POINTS, 0, N*N);

      gl.useProgram(lineProgram);
      glUpdateUniforms(luLoc);
      glUpdateHeights(lineBuffer);

      gl.drawArrays(gl.LINES, N*N, allHeights.length - N*N);

      gl.flush();
    }
  }

  let updateCam = () => {
    let camPitch = 0.6 - 1 * scrollProgress;
    let camYaw = 1 - 0.4 * scrollProgress;
    cpMatrix = matrixRotate(mvMatrix, camPitch, [1,0,0]);
    cpMatrix = matrixRotate(cpMatrix, camYaw, [0,1,0]);
    cpMatrix = matrixRotate(cpMatrix, 0, [0,1,0]);
  }

  this.setSize = (width, height) => {
    c.width = width;
    c.height = height;
    gl.viewport(0, 0, width, height);
    pjMatrix = perspectiveMatrix(45, width / height, 0.1, 1000.0);
  }

  this.setProgress = (val) => {
    scrollProgress = val;
  }

  this.setFPS = (fps) => {
    this.targetFPS = fps;
    frameInterval =  1000 / this.targetFPS;
    dt = 0.10 / (this.targetFPS / 30)  /3 *2;
  }

  this.start = () => {
    this.initShaders()
    this.initBuffers();
    this.render();
  }

  this.setFPS(this.targetFPS);
}

export default Void;
