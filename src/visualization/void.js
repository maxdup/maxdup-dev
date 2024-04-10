import main_vsScript from "../shaders/main.vert";
import debug_vsScript from "../shaders/debug.vert";

import line_fsScript from "../shaders/line.frag";
import sprite_fsScript from "../shaders/sprite.frag";

import quickNoise from 'quick-perlin-noise-js';

import {N, L} from './config';
const HN = Math.floor(N/2);

let dt = 0;
let gl, glExt, c, ctx2D;
let canvas2D, canvas3D;

let maLoc = [];
let muLoc = [];

let lineProgram = null;
let luLoc = [];

let dotProgram = null;
let duLoc = [];

let debugProgram = null;
let xaLoc = [];
let xuLoc = [];

let mtlTexture = null

let staticBuffer;
let bakedBuffer;
let dynamicBuffer;
let debugBuffer;

let dynData;

//let DEBUG = true;
let DEBUG = false;

function Void(scene, camera, ticker, waves, grid, nodes, roads, sheens){

  this.scene = scene;
  this.camera = camera;
  this.ticker = ticker;
  this.waves = waves;
  this.grid = grid;
  this.nodes = nodes;
  this.roads = roads;
  this.sheens = sheens;

  this.grid.offset = this.waves.len;
  this.nodes.offset = this.waves.len + this.grid.len;
  this.roads.offset = this.waves.len + this.grid.len + this.nodes.len;

  let noise = new Array(N*N);

  this.loseCTX = () => {
    glExt.loseContext();
  }

  this.initWebGL = (canvas) => {
    canvas3D = canvas;
    gl = canvas.getContext("webgl") || canvas.getContext('experimental-webgl');
    glExt = gl.getExtension('WEBGL_lose_context');

    canvas.addEventListener('webglcontextrestored', this.start);
    canvas.addEventListener("webglcontextlost", (event) => {
      event.preventDefault();
      setTimeout(() => { glExt.restoreContext(); });
    }, false);
  }

  this.initTextures = (canvas) => {
    canvas2D = canvas;
    ctx2D = canvas.getContext("2d", { willReadFrequently: true });
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
    main_vsScript = main_vsScript.replace(
      /\%lineColors\%/g, "mat3("+this.sheens.str+")");

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

  let buildPositionsArray = () => {
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
    return positions;
  }

  let buildTopoArray = async () => {
    const mtlres = await fetch(require('../images/mtl.webp'), {mode: 'cors'});
    const mtlblob = await mtlres.blob();
    const mtlBitmap = await createImageBitmap(mtlblob, {
      premultiplyAlpha: 'none',
      colorSpaceConversion: 'none',
    });

    canvas2D.width = mtlBitmap.width;
    canvas2D.height = mtlBitmap.height;
    ctx2D.drawImage(mtlBitmap, 0, 0, mtlBitmap.width, mtlBitmap.height);

    return Array.from(
      { length: N*N }, // [x1, y1, x2, y2, x3, y3, ...]
      (_,xy) => {
        let x = Math.floor(xy / N);
        let y = xy % N;

        let texCoordX = x / N * canvas2D.width;
        let texCoordY = y / N * canvas2D.height;

        const imageData = ctx2D.getImageData(texCoordX, texCoordY, 1, 1);

        return [imageData.data[1]/256,
                imageData.data[2]/256];
      }).flat();
  }

  let buildHeightBuffer = () => {
    let gridHeights = mapConnected(this.grid.idTable, this.waves.heights, 1);
    let nodeHeights = mapConnected(this.nodes.idTable, this.waves.heights, 1);
    let roadHeights = mapConnected(this.roads.idTable, this.waves.heights, 1);
    return [...this.waves.heights, ...gridHeights,
            ...nodeHeights, ...roadHeights];
  }
  let buildConnectionBuffer = () => {
    let gridConnections = new Array(this.grid.idTable.length).fill(0);
    let nodeConnections = mapConnected(this.nodes.idTable,
                                       this.nodes.connections, 1);
    let roadConnections = new Array(this.roads.idTable.length).fill(-2);
    return [...this.nodes.connections, ...gridConnections,
            ...nodeConnections, ...roadConnections];
  }
  let buildTopoBuffer = async () => {
    let topoArray = await buildTopoArray();
    let gridTopo = mapConnected(this.grid.idTable, topoArray, 2);
    let nodeTopo = mapConnected(this.nodes.idTable, topoArray, 2);
    let roadTopo = mapConnected(this.roads.idTable, topoArray, 2);
    return [...topoArray, ...gridTopo,
            ...nodeTopo, ...roadTopo];
  }
  let buildPositionBuffer = () => {
    let positions = buildPositionsArray();
    let connectedPositions = mapConnected(this.nodes.idTable, positions, 3)
    let gridPositions = mapConnected(this.grid.idTable, positions, 3);
    let roadPositions = mapConnected(this.roads.idTable, positions, 3);
    return [...positions, ...gridPositions,
            ...connectedPositions, ...roadPositions];
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

  this.initBuffers = () => {

    function glSetUniforms(p, uLoc){
      uLoc[0] = gl.getUniformLocation(p, "pjMatrix");
      uLoc[1] = gl.getUniformLocation(p, "mvMatrix");
      uLoc[2] = gl.getUniformLocation(p, 'screenScale');
      uLoc[3] = gl.getUniformLocation(p, "sheens");

      uLoc[4] = gl.getUniformLocation(p, "nodeness");
      uLoc[5] = gl.getUniformLocation(p, "gridness");
      uLoc[6] = gl.getUniformLocation(p, "toponess");
    }

    let loadStaticBuffer = () => {
      let staticData = buildStaticBuffer();

      staticBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, staticBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(staticData),
                    gl.STATIC_DRAW);

      const vertexPosSize = 3 * Float32Array.BYTES_PER_ELEMENT;
      const vertexConSize = 1 * Float32Array.BYTES_PER_ELEMENT;
      const vertexPosOff = 0;
      const vertexConOff = vertexPosOff + vertexPosSize;
      const vertexStaticSize = vertexPosSize + vertexConSize;

      maLoc[0] = gl.getAttribLocation(dotProgram, "position");
      gl.enableVertexAttribArray(maLoc[0]);
      gl.vertexAttribPointer(maLoc[0], 3, gl.FLOAT, false,
                             vertexStaticSize, vertexPosOff);

      maLoc[1] = gl.getAttribLocation(dotProgram, "nconnection");
      gl.enableVertexAttribArray(maLoc[1]);
      gl.vertexAttribPointer(maLoc[1], 1, gl.FLOAT, false,
                             vertexStaticSize, vertexConOff);
    }

    let loadBakedBuffer = async () => {
      let bakedData = await buildTopoBuffer();

      bakedBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, bakedBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bakedData),
                    gl.STATIC_DRAW);

      const vertexTopoSize = 2 * Float32Array.BYTES_PER_ELEMENT;
      const vertexTopoOff = 0;
      const vertexBakedSize = vertexTopoSize;

      maLoc[2] = gl.getAttribLocation(dotProgram, "topology");
      gl.enableVertexAttribArray(maLoc[2]);
      gl.vertexAttribPointer(maLoc[2], 2, gl.FLOAT, false,
                             vertexBakedSize, vertexTopoOff);
    }

    let loadDynamicBuffer = () => {
      dynData = buildHeightBuffer();

      dynamicBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, dynamicBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(dynData),
                    gl.DYNAMIC_DRAW);

      maLoc[3] = gl.getAttribLocation(dotProgram, "height");
      gl.enableVertexAttribArray(maLoc[3]);
      gl.vertexAttribPointer(maLoc[3], 1, gl.FLOAT, false,
                             Float32Array.BYTES_PER_ELEMENT, 0);
    }

    // Debug Buffer
    if (DEBUG){
      debugBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, debugBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.camera.positions),
                    gl.STATIC_DRAW);

      xaLoc[0] = gl.getAttribLocation(debugProgram, "debugPosition");

      gl.enableVertexAttribArray(xaLoc[0]);
      gl.vertexAttribPointer(xaLoc[0], 3, gl.FLOAT, false,
                             3 * Float32Array.BYTES_PER_ELEMENT, 0);
    }

    loadStaticBuffer();
    loadBakedBuffer();
    loadDynamicBuffer();

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
    if (DEBUG){
      gl.useProgram(debugProgram);
      gl.uniform1i(xuLoc[3], 1);
    }
  }

  this.render = () => {

    requestAnimationFrame(this.render);

    if (this.ticker.frameReady()){
      this.ticker.frameStart();

      if (this.camera.resized){
        canvas3D.width = this.camera.viewWidth;
        canvas3D.height = this.camera.viewHeight;
        gl.viewport(0, 0, this.camera.viewWidth, this.camera.viewHeight);
        this.camera.resized = false;
      }

      this.scene.update(this.ticker.timeDelta);
      this.sheens.update(this.ticker.timeDelta);
      this.waves.update(this.ticker.fixedTimeDelta);

      // ingest sheens
      let sh = Array.from(
        this.sheens.array, (s,i) => [...s.origin, ...s.angle]).flat();

      let glUpdateUniforms = (uLoc) => {
        gl.uniformMatrix4fv(uLoc[0], false, this.camera.pjMatrix);
        gl.uniformMatrix4fv(uLoc[1], false, this.camera.mvMatrix);
        gl.uniform1f(uLoc[2], this.camera.renderHeight);
        gl.uniform2fv(uLoc[3], new Float32Array(sh));

        gl.uniform1f(uLoc[4], this.scene.nodeness);
        gl.uniform1f(uLoc[5], this.scene.gridness);
        gl.uniform1f(uLoc[6], this.scene.toponess);
      }

      dynData = buildHeightBuffer();

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
      gl.drawArrays(gl.LINES,  this.grid.offset,
                    this.grid.len + this.roads.len + this.nodes.len);

      if (DEBUG){
        gl.useProgram(debugProgram);
        gl.bindBuffer(gl.ARRAY_BUFFER, debugBuffer);

        gl.uniformMatrix4fv(xuLoc[0], false, this.camera.pjMatrix);
        gl.uniformMatrix4fv(xuLoc[1], false, this.camera.mvMatrix);
        gl.uniform1f(xuLoc[2], this.camera.renderHeight);

        gl.bufferSubData(gl.ARRAY_BUFFER, 0,
                         new Float32Array(this.camera.positions));
        gl.bufferData(gl.ARRAY_BUFFER,
                      new Float32Array(this.camera.positions), gl.STATIC_DRAW);

        gl.drawArrays(gl.LINES, this.camera.offset, this.camera.len);
      }

      gl.flush();
      this.ticker.frameEnd();
    }
  }


  this.start = () => {
    this.initBuffers();
    this.render();
  }
}

export default Void;
