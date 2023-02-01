import Scene from '../visualization/scene';
import Camera from '../visualization/camera';
import Void from '../visualization/void';
import Waves from '../visualization/waves';
import Grid from '../visualization/grid';
import Nodes from '../visualization/nodes';
import Sheens from '../visualization/sheens';

const MSGS = {
  initialize: 0,
  start: 1,
  setSize: 2,
  setInertia: 3,
  setPositions: 4,
  setSheens: 5,
  setFPS: 6,
  setProgress: 7,
  setScene: 8,
  loseCTX: 9,
}

let scene = new Scene();
let camera = new Camera();
let waves = new Waves();
let grid = new Grid();
let sheens = new Sheens();
let nodes = new Nodes();

let v = new Void(scene, camera, waves, grid, nodes, sheens);

self.onmessage = (ev) => {

  switch(MSGS[ev.data.msg]){
  case MSGS.init:
    v.initWebGL(ev.data.canvas);
    break;
  case MSGS.start:
    v.start();
    break;
  case MSGS.setSize:
    v.setSize(ev.data.value.width, ev.data.value.height);
    break;
  case MSGS.setProgress:
    v.setProgress(ev.data.value)
    break;
  case MSGS.setInertia:
    waves.setInertia(1 - ev.data.value * v.targetFPS / 30);
    break;
  case MSGS.setPositions:
    waves.setPositions(ev.data.value);
    break;
  case MSGS.setSheens:
    sheens.set(ev.data.value);
    break;
  case MSGS.setScene:
    scene.target(ev.data.value.name,
                 ev.data.value.speed);
    break;
  case MSGS.setFPS:
    v.setFPS(ev.data.value);
    break;
  case MSGS.loseCTX:
    v.loseCTX();
    break;
  }
}
