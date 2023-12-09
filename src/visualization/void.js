import main_vsScript from "../shaders/main.vert";
import debug_vsScript from "../shaders/debug.vert";

import line_fsScript from "../shaders/line.frag";
import sprite_fsScript from "../shaders/sprite.frag";

import quickNoise from 'quick-perlin-noise-js';

import {N, L} from './config';
const HN = Math.floor(N/2);

let dt = 0;
let gl, glExt, c;

let maLoc = [];
let muLoc = [];

let lineProgram = null;
let luLoc = [];

let dotProgram = null;
let duLoc = [];

let debugProgram = null;
let xaLoc = [];
let xuLoc = [];

let dotTexture = null;
let mtlTexture = null

let staticBuffer;
let dynamicBuffer;
let debugBuffer;

let dynData;

//let DEBUG = true;
let DEBUG = false;

function Void(scene, camera, waves, grid, nodes, roads, sheens){

  this.scene = scene;
  this.camera = camera;
  this.waves = waves;
  this.grid = grid;
  this.nodes = nodes;
  this.roads = roads;
  this.sheens = sheens;

  this.grid.offset = this.waves.len;
  this.nodes.offset = this.waves.len + this.grid.len;
  this.roads.offset = this.waves.len + this.grid.len + this.nodes.len;

  let noise = new Array(N*N);

  this.targetFPS = 60;
  this.renderScale = 1.0;

  let minQuality = false;
  let maxQuality = false;
  let qualityIncreaseCount = 0;

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
    debugProgram = gl.createProgram();

    let main_vs = gl.createShader(gl.VERTEX_SHADER);

    let debug_vs = gl.createShader(gl.VERTEX_SHADER);
    let line_fs = gl.createShader(gl.FRAGMENT_SHADER);
    let sprite_fs = gl.createShader(gl.FRAGMENT_SHADER);
    let debug_fs = gl.createShader(gl.FRAGMENT_SHADER);
    main_vsScript = main_vsScript.replace(/\%lineColors\%/g, "mat3("+this.sheens.str+")");

    gl.shaderSource(main_vs, main_vsScript);
    gl.shaderSource(debug_vs, debug_vsScript);
    gl.shaderSource(line_fs, line_fsScript);
    gl.shaderSource(sprite_fs, sprite_fsScript);
    //gl.shaderSource(debug_fs, sprite_fsScript);
    gl.shaderSource(debug_fs, line_fsScript);

    gl.compileShader(main_vs);
    gl.compileShader(debug_vs);
    gl.compileShader(line_fs);
    gl.compileShader(sprite_fs);
    gl.compileShader(debug_fs);

    gl.attachShader(lineProgram, main_vs);
    gl.attachShader(lineProgram, line_fs);
    gl.attachShader(dotProgram, main_vs);
    gl.attachShader(dotProgram, sprite_fs);

    gl.linkProgram(dotProgram);
    gl.linkProgram(lineProgram);


    if (DEBUG){
      if(!gl.getProgramParameter(lineProgram, gl.LINK_STATUS)){
        console.log(gl.getProgramInfoLog(lineProgram))
      }
      if(!gl.getProgramParameter(dotProgram, gl.LINK_STATUS)){
        console.log(gl.getProgramInfoLog(dotProgram))
      }

      gl.attachShader(debugProgram, debug_vs);
      gl.attachShader(debugProgram, debug_fs);
      gl.bindAttribLocation(debugProgram, 5, "debugPosition");
      gl.linkProgram(debugProgram);

      if(!gl.getProgramParameter(debugProgram, gl.LINK_STATUS)){
        console.log(gl.getProgramInfoLog(debugProgram))
      }
    }

    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  }

  let buildHeightBuffer = () => {
    let nodeHeights = mapConnected(this.nodes.idTable, this.waves.heights, 1);
    let gridHeights = mapConnected(this.grid.idTable, this.waves.heights, 1);
    let roadHeights = mapConnected(this.roads.idTable, this.waves.heights, 1);
    return [...this.waves.heights, ...gridHeights, ...nodeHeights, ...roadHeights];
  }
  let buildConnectionBuffer = () => {
    let connectedConnections = mapConnected(this.nodes.idTable, this.nodes.connections, 1);
    let gridConnections = new Array(this.grid.idTable.length).fill(0);
    let roadConnections = new Array(this.roads.idTable.length).fill(-2);
    return [...this.nodes.connections, ...gridConnections, ...connectedConnections, ...roadConnections];
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
    let roadPositions = mapConnected(this.roads.idTable, positions, 3);
    return [...positions, ...gridPositions, ...connectedPositions, ...roadPositions];
  }

  let buildStaticBuffer = () => {
    let positions  = buildPositionBuffer();
    let connections = buildConnectionBuffer();

    let main = [];
    for (let i = 0; i < connections.length; i++){
      main.push(positions[i*3]);
      main.push(positions[i*3+1]);
      main.push(positions[i*3+2]);
      main.push(connections[i]);
    }
    return main;
  }

  let buildDynamicBuffer = () => {
    return buildHeightBuffer();
  }

  this.initBuffers = () => {

    function glSetUniforms(p, uLoc){
      uLoc[0] = gl.getUniformLocation(p, "pjMatrix");
      uLoc[1] = gl.getUniformLocation(p, "mvMatrix");
      uLoc[2] = gl.getUniformLocation(p, 'screenScale');
      uLoc[3] = gl.getUniformLocation(p, "sheens");

      uLoc[4] = gl.getUniformLocation(p, "nodeness");
      uLoc[5] = gl.getUniformLocation(p, "gridness");
      uLoc[6] = gl.getUniformLocation(p, "mapness");

      uLoc[7] = gl.getUniformLocation(p, "mtlTexture");
      uLoc[8] = gl.getUniformLocation(p, "dotTexture");
    }

    // Debug Buffer
    if (DEBUG){
      debugBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, debugBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.camera.positions), gl.STATIC_DRAW);

      xaLoc[0] = gl.getAttribLocation(debugProgram, "debugPosition");

      gl.enableVertexAttribArray(xaLoc[0]);
      gl.vertexAttribPointer(xaLoc[0], 3, gl.FLOAT, false, 3 * Float32Array.BYTES_PER_ELEMENT, 0);
    }

    // Static Buffer
    let staticData = buildStaticBuffer();

    staticBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, staticBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(staticData), gl.STATIC_DRAW);

    const vertexSizeInBytes = 4 * Float32Array.BYTES_PER_ELEMENT;
    const vertexOffsconnect = 3 * Float32Array.BYTES_PER_ELEMENT;

    maLoc[0] = gl.getAttribLocation(dotProgram, "position");
    gl.enableVertexAttribArray(maLoc[0]);
    gl.vertexAttribPointer(maLoc[0], 3, gl.FLOAT, false, vertexSizeInBytes, 0);

    maLoc[1] = gl.getAttribLocation(dotProgram, "nconnection");
    gl.enableVertexAttribArray(maLoc[1]);
    gl.vertexAttribPointer(maLoc[1], 1, gl.FLOAT, false, vertexSizeInBytes, vertexOffsconnect);

    // Dynamic Buffer
    dynData = buildDynamicBuffer();

    dynamicBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, dynamicBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(dynData), gl.DYNAMIC_DRAW);

    maLoc[2] = gl.getAttribLocation(dotProgram, "height");
    gl.enableVertexAttribArray(maLoc[2]);
    gl.vertexAttribPointer(maLoc[2], 1, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT, 0);


    // Dots
    gl.useProgram(dotProgram);
    glSetUniforms(dotProgram, duLoc);

    this.setImage();

    // Lines
    gl.useProgram(lineProgram);
    glSetUniforms(lineProgram, luLoc);

    // Debug
    if (DEBUG){
      gl.useProgram(debugProgram);

      xuLoc[0] = gl.getUniformLocation(debugProgram, "pjMatrix");
      xuLoc[1] = gl.getUniformLocation(debugProgram, "mvMatrix");
      xuLoc[2] = gl.getUniformLocation(debugProgram, "screenScale");
      xuLoc[3] = gl.getUniformLocation(debugProgram, "dotTexture");
    }
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
    mtlTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, mtlTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    const mtlres = await fetch(require('../images/mtl5.png'), {mode: 'cors'});
    const mtlblob = await mtlres.blob();
    const mtlBitmap = await createImageBitmap(mtlblob, {
      premultiplyAlpha: 'none',
      colorSpaceConversion: 'none',
    });

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, mtlBitmap);
    gl.useProgram(lineProgram);
    gl.uniform1i(luLoc[7], 0);

    gl.useProgram(dotProgram);
    gl.uniform1i(duLoc[7], 0);

    gl.activeTexture(gl.TEXTURE1)
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

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, dotBitmap);

    gl.useProgram(dotProgram);
    gl.uniform1i(duLoc[8], 1);

    if (DEBUG){
      gl.useProgram(debugProgram);
      gl.uniform1i(xuLoc[3], 1);
    }
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

      // ingest sheens
      let sh = Array.from(this.sheens.array, (s,i) => [...s.origin, ...s.angle]).flat();

      let glUpdateUniforms = (uLoc) => {
        gl.uniformMatrix4fv(uLoc[0], false, this.camera.pjMatrix);
        gl.uniformMatrix4fv(uLoc[1], false, this.camera.mvMatrix);
        gl.uniform1f(uLoc[2], this.camera.resolutionScale);
        gl.uniform2fv(uLoc[3], new Float32Array(sh));

        gl.uniform1f(uLoc[4], this.scene.nodeness);
        gl.uniform1f(uLoc[5], this.scene.gridness);
        gl.uniform1f(uLoc[6], this.scene.mapness);
      }

      dynData = buildDynamicBuffer();

      // Dots
      gl.useProgram(dotProgram);
      gl.bindBuffer(gl.ARRAY_BUFFER, dynamicBuffer);

      const vertexSizeInBytes = 4 * Float32Array.BYTES_PER_ELEMENT;
      const vertexOffsconnect = 3 * Float32Array.BYTES_PER_ELEMENT;

      gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(dynData));

      glUpdateUniforms(duLoc);
      gl.drawArrays(gl.POINTS, this.waves.offset, this.waves.len);


      // Lines
      gl.useProgram(lineProgram);
      gl.bindBuffer(gl.ARRAY_BUFFER, dynamicBuffer);

      glUpdateUniforms(luLoc);
      gl.drawArrays(gl.LINES,  this.grid.offset, this.grid.len + this.roads.len + this.nodes.len);

      if (DEBUG){
        gl.useProgram(debugProgram);
        gl.bindBuffer(gl.ARRAY_BUFFER, debugBuffer);

        gl.uniformMatrix4fv(xuLoc[0], false, this.camera.pjMatrix);
        gl.uniformMatrix4fv(xuLoc[1], false, this.camera.mvMatrix);
        gl.uniform1f(xuLoc[2], this.camera.resolutionScale);

        gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(this.camera.positions));
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.camera.positions), gl.STATIC_DRAW);

        gl.drawArrays(gl.LINES, this.camera.offset, this.camera.len);
      }

      gl.flush();

      let deltaT = Date.now() - now;
      frameAvg = frameAvg || deltaT;
      frameCount++;
      frameAvg += (deltaT - frameAvg) / frameCount;
      this.evalFrameTime();
    }
  }

  this.evalFrameTime = () => {
    // We make it harder to increase quality than it is to decrease.
    // This avoids flip-flopping, furthermore, you are capted on the
    // number of increases.
    if (frameCount < this.targetFPS * 3){
      return;
    }
    if (frameAvg * 2 > 1 / this.targetFPS * 1000 &&
        !minQuality){
      this.decreaseRenderQuality();
      maxQuality = false;
    }
    if (frameAvg * 6 < 1 / this.targetFPS * 1000 &&
        !maxQuality && qualityIncreaseCount < 6){
      qualityIncreaseCount++;
      this.increaseRenderQuality();
      minQuality = false;
    }
  }
  this.decreaseRenderQuality = () => {
    let frameCount = 0;
    let frameAvg = null;
    if (this.targetFPS == 60){
      this.setFPS(30);
      return;
    }
    if (this.renderScale == 1) {
      this.setRenderScale(0.75);
      return;
    }
    if (this.renderScale == 0.75) {
      this.setRenderScale(0.5);
      return;
    }
    minQuality = true;
  }
  this.increaseRenderQuality = () => {
    let frameCount = 0;
    let frameAvg = null;
    if (this.renderScale == 0.5){
      this.setRenderScale(0.75);
      return;
    }
    if (this.renderScale == 0.75){
      this.setRenderScale(1);
      return;
    }
    if (this.renderScale == 1 &&
        this.targetFPS == 30){
      this.setFPS(60);
    }
    maxQuality = true;
  }

  this.setRenderScale = (val) => {
    this.renderScale = val;
    this.updateCanvasSize();
  }

  this.setSize = (width, height) => {
    this.windowHeight = height;
    this.windowWidth = width;
    this.updateCanvasSize();
  }
  this.updateCanvasSize = () => {
    let targetWidth = this.windowWidth * this.renderScale;
    let targetHeight = this.windowHeight * this.renderScale;
    c.width = targetWidth;
    c.height = targetHeight;
    gl.viewport(0, 0, targetWidth, targetHeight);
    this.camera.updateSize(targetWidth, targetHeight);
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
