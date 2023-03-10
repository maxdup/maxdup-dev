import vsScript from "../shaders/background.vert";
import fsScript from "../shaders/background.frag";
import sfsScript from "../shaders/sprite.frag";

import quickNoise from 'quick-perlin-noise-js';

import {N, L} from './config';
const HN = Math.floor(N/2);

let dt = 0;
let gl, glExt, c;

let lineProgram = null;
let laLoc = [];
let luLoc = [];

let dotProgram = null;
let daLoc = [];
let duLoc = [];

let dotTexture = null;
let mtlTexture = null

let dotBuffer;
let lineBuffer;

function Void(scene, camera, waves, grid, nodes, sheens){

  this.scene = scene;
  this.camera = camera;
  this.waves = waves;
  this.grid = grid;
  this.sheens = sheens;
  this.nodes = nodes;

  this.grid.offset = this.waves.len;
  this.nodes.offset = this.waves.len + this.grid.len;

  let noise = new Array(N*N);

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
  let buildConnectionBuffer = () => {
    let connectedConnections = mapConnected(this.nodes.idTable, this.nodes.connections, 1);
    let gridConnections = new Array(this.grid.idTable.length).fill(0);
    return [...this.nodes.connections, ...gridConnections, ...connectedConnections];
  }
  let buildPositionBuffer = () => {
    let positions = Array.from(
      { length: N*N }, // [x1, y1, z1, x2, y2, z2, x3, y3, z3, ...]
      (_,xy) => {
        let x = Math.floor(xy / N);
        let y = xy % N;
        let sinZ =
            Math.sin((x/N * 1.25 - 0.125) * Math.PI) *
            Math.sin((y/N * 1.25 - 0.125) * Math.PI) * 2 - 0.7;
        return [L * 0.02 * (-N / 2 + x),
                L * 0.02 * (-N / 2 + y),
                sinZ + quickNoise.noise(x/N*20, y/N*15, 0) *0.25];
      }).flat();

    let connectedPositions = mapConnected(this.nodes.idTable, positions, 3)
    let gridPositions = mapConnected(this.grid.idTable, positions, 3);
    return [...positions, ...gridPositions, ...connectedPositions];
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
      uLoc[2] = gl.getUniformLocation(p, 'screenScale');
      uLoc[3] = gl.getUniformLocation(p, "sheens");

      uLoc[4] = gl.getUniformLocation(p, "dottedness");
      uLoc[5] = gl.getUniformLocation(p, "nodeness");
      uLoc[6] = gl.getUniformLocation(p, "gridness");
      uLoc[7] = gl.getUniformLocation(p, "fogginess");
      uLoc[8] = gl.getUniformLocation(p, "mapness");

      uLoc[9] = gl.getUniformLocation(p, "dotTexture");
      uLoc[10] = gl.getUniformLocation(p, "mtlTexture");
    }
    function glBuffer(destaLoc, size, data){
      let buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.DYNAMIC_DRAW);
      gl.vertexAttribPointer(destaLoc, size, gl.FLOAT, false, 0, 0);
      return buffer;
    }

    function glTexture(){
    }

    // Dots
    gl.useProgram(dotProgram);

    glSetAttributes(dotProgram, daLoc);
    glSetUniforms(dotProgram, duLoc);

    glBuffer(daLoc[0], 3, positions);
    glBuffer(daLoc[1], 1, connections);
    dotBuffer = glBuffer(daLoc[2], 1, heights);

    glTexture();
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

    gl.activeTexture(gl.TEXTURE0)
    dotTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, dotTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    const dotres = await fetch(require('../images/dot.jpg'), {mode: 'cors'});
    const dotblob = await dotres.blob();
    const dotBitmap = await createImageBitmap(dotblob, {
      premultiplyAlpha: 'none',
      colorSpaceConversion: 'none',
    });

    gl.bindTexture(gl.TEXTURE_2D, dotTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, dotBitmap);
    gl.uniform1i(duLoc[9], 0);


    gl.activeTexture(gl.TEXTURE1)
    mtlTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, mtlTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    const mtlres = await fetch(require('../images/mtl.png'), {mode: 'cors'});
    const mtlblob = await mtlres.blob();
    const mtlBitmap = await createImageBitmap(mtlblob, {
      premultiplyAlpha: 'none',
      colorSpaceConversion: 'none',
    });

    gl.bindTexture(gl.TEXTURE_2D, mtlTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, mtlBitmap);
    gl.uniform1i(duLoc[10], 1);
  }
  let frameCount = 0;
  let frameAvg = null;

  this.render = () => {

    requestAnimationFrame(this.render);

    let now = Date.now();
    let elapsed = now - frameTiming; // ms
    if (elapsed > frameInterval) {

      frameTiming = now - (elapsed % frameInterval);

      this.scene.update(elapsed);
      this.sheens.update(elapsed);
      this.waves.update(dt);

      let heights = buildHeightBuffer();

      // ingest sheens
      let sh = Array.from(this.sheens.array, (s,i) => [...s.origin, ...s.angle]).flat();

      let glUpdateUniforms = (uLoc) => {
        gl.uniformMatrix4fv(uLoc[0], false, this.camera.pjMatrix);
        gl.uniformMatrix4fv(uLoc[1], false, this.camera.mvMatrix);
        gl.uniform1f(uLoc[2], this.camera.resolutionScale);
        gl.uniform2fv(uLoc[3], new Float32Array(sh));

        gl.uniform1f(uLoc[4], this.scene.dottedness);
        gl.uniform1f(uLoc[5], this.scene.nodeness);
        gl.uniform1f(uLoc[6], this.scene.gridness);
        gl.uniform1f(uLoc[7], this.scene.fogginess);
        gl.uniform1f(uLoc[8], this.scene.mapness);
      }

      let glUpdateAttributes = (buffer) => {
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(heights));
      }

      gl.useProgram(lineProgram);
      glUpdateUniforms(luLoc);
      glUpdateAttributes(lineBuffer);
      gl.drawArrays(gl.LINES,  this.grid.offset, this.grid.len + this.nodes.len);

      gl.useProgram(dotProgram);
      glUpdateUniforms(duLoc);
      glUpdateAttributes(dotBuffer);
      gl.drawArrays(gl.POINTS, this.waves.offset, this.waves.len);

      gl.flush();

      let deltaT = Date.now() - now;
      frameAvg = frameAvg || deltaT;
      frameCount++;
      frameAvg += (deltaT - frameAvg) / frameCount;
    }
  }

  this.setSize = (width, height) => {
    c.width = width;
    c.height = height;
    gl.viewport(0, 0, width, height);
    this.camera.updateSize(width, height);
  }

  this.setProgress = (val) => {
    let pitch = 0.6 - 1 * val;
    let yaw = 0.45 - 0.4 * val;
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