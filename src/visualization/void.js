import vsScript from "../shaders/background.vert";
import fsScript from "../shaders/background.frag";
import sfsScript from "../shaders/sprite.frag";

import {N, L} from './config';

let dt = 0;
let gl, glExt, c;

let dotProgram = null;
let lineProgram = null;

let texture = null;

let daLoc = [];
let laLoc = [];

let duLoc = []; // TODO: combine to daloc?
let luLoc = []; // TODO: combine to laloc?

let dotBuffer;
let lineBuffer;

let scrollProgress = 0;


function Void(camera, waves, grid, nodes, sheens){

  this.camera = camera;
  this.waves = waves;
  this.grid = grid;
  this.sheens = sheens;
  this.nodes = nodes;

  this.grid.offset = this.waves.len;
  this.nodes.offset = this.waves.len + this.grid.len;

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


  let buildHeightBuffer = () => {
    let gridHeights = mapConnected(this.grid.idTable, this.waves.heights, 1);
    let nodeHeights = mapConnected(this.nodes.idTable, this.waves.heights, 1);

    return [...this.waves.heights, ...gridHeights, ...nodeHeights];
  }
  let buildPositionBuffer = () => {
    let positions = Array.from( // [x1, y1, x2, y2, x3, y3....]
      Array.from({length: N*N*2}, (_,i) => Math.floor(i/2)),
      (id,i) => L * 0.02 * (-N / 2 + (Math.floor(id/N) * (1-i%2)) + (id%N * (i%2))));
    let connectedPositions = mapConnected(this.nodes.idTable, positions, 2)
    let gridPositions = mapConnected(this.grid.idTable, positions, 2);
    return [...positions, ...gridPositions, ...connectedPositions];
  }
  let buildConnectionBuffer = () => {
    let connectedConnections = mapConnected(this.nodes.idTable, this.nodes.connections, 1);
    let gridConnections = mapConnected(this.grid.idTable, this.nodes.connections, 1);
    return [...this.nodes.connections, ...gridConnections, ...connectedConnections];

  }
  this.initBuffers = () => {

    let positions  = buildPositionBuffer();
    let heights = buildHeightBuffer();
    let connections = buildConnectionBuffer();

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

    glBuffer(daLoc[0], 2, positions);
    glBuffer(daLoc[1], 1, connections);
    dotBuffer = glBuffer(daLoc[2], 1, heights);

    this.setImage();

    // Lines
    gl.useProgram(lineProgram);

    glSetAttributes(lineProgram, laLoc);
    glSetUniforms(lineProgram, luLoc);

    lineBuffer = glBuffer(laLoc[2], 1, heights);
  }

  function mapConnected(idTable, sourceArray, times){
    let destArray = new Array(idTable.length);
    for (let i = 0; i < idTable.length; i++){
      for (let n = 0; n < times; n++){
        destArray[i*times+n] = sourceArray[idTable[i]*times+n];
      }
    }
    return destArray;
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

      let heights = buildHeightBuffer();

      // ingest sheens
      let sh = Array.from(this.sheens.array, (s,i) => [...s.origin, ...s.angle]).flat();

      let glUpdateUniforms = (uLoc) => {
        gl.uniformMatrix4fv(uLoc[0], false, this.camera.pjMatrix);
        gl.uniformMatrix4fv(uLoc[1], false, this.camera.mvMatrix);
        gl.uniform2fv(uLoc[2], new Float32Array(sh));
      }

      let glUpdateHeights = (buffer, h) => {
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(h));
      }

      gl.useProgram(dotProgram);
      glUpdateUniforms(duLoc);
      glUpdateHeights(dotBuffer, heights);

      gl.drawArrays(gl.POINTS, this.waves.offset, this.waves.len);

      gl.useProgram(lineProgram);
      glUpdateUniforms(luLoc);
      glUpdateHeights(lineBuffer, heights);

      gl.drawArrays(gl.LINES,  this.grid.offset, this.grid.len + this.nodes.len);

      gl.flush();
    }
  }

  this.setSize = (width, height) => {
    c.width = width;
    c.height = height;
    gl.viewport(0, 0, width, height);
    this.camera.updateSize(width, height);
  }

  this.setProgress = (val) => {
    scrollProgress = val;
    let pitch = 0.6 - 1 * scrollProgress;
    let yaw = 1 - 0.4 * scrollProgress;
    this.camera.updateAngle(pitch, yaw, 0);
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

  this.setProgress(0);
  this.setFPS(this.targetFPS);
}

export default Void;
