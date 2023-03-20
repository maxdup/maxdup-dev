import Scene from '../visualization/scene';
import Camera from '../visualization/camera';
import Void from '../visualization/void';
import Waves from '../visualization/waves';
import Grid from '../visualization/grid';
import Nodes from '../visualization/nodes';
import Roads from '../visualization/roads';
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
let roads = new Roads();

let v = new Void(scene, camera, waves, grid, nodes, roads, sheens);


function SyncWorker(){
  this.init = (canvas) =>{
    v.initWebGL(canvas);
  }
  this.exec = (fn, value) => {
    switch(MSGS[fn]){
    case MSGS.start:
      v.start();
      break;
    case MSGS.setSize:
      v.setSize(value.width, value.height);
      break;
    case MSGS.setProgress:
      v.setProgress(value)
      break;
    case MSGS.setInertia:
      waves.setInertia(1 - value * v.targetFPS / 30);
      break;
    case MSGS.setPositions:
      waves.setPositions(value);
      break;
    case MSGS.setSheens:
      sheens.set(value);
      break;
    case MSGS.setScene:
      scene.target(value.name,
                   value.speed);
      break;
    case MSGS.setFPS:
      v.setFPS(value);
      break;
    case MSGS.loseCTX:
      v.loseCTX();
      break;
    }

    return this
  }
}

export default SyncWorker;
