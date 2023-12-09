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
  setCamOffset: 10,
  setCamAngle: 11,
}

let scene = new Scene();
let camera = new Camera();
let waves = new Waves();
let grid = new Grid();
let sheens = new Sheens();
let nodes = new Nodes();
let roads = new Roads();

let v = new Void(scene, camera, waves, grid, nodes, roads, sheens);

function AgnosticWorker(){

  this.init = (canvas) => {
    v.initWebGL(canvas);
  }
  this.run = (eventName, value) => {
    switch(MSGS[eventName]){
    case MSGS.start:
      v.start();
      break;
    case MSGS.setSize:
      v.setSize(value.width, value.height);
      break;
    case MSGS.setProgress:
      v.setProgress(value);
      break;
    case MSGS.setCamOffset:
      camera.updateNudge(value.pitchOffset,
                         value.yawOffset);
      break;
    case MSGS.setCamAngle:
      camera.updateAngle(value.pitch, value.yaw, value.roll,
                         value.offsetX, value.offsetY, value.offsetZ);
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
  }
  return this;
}

let agnosticWorker = new AgnosticWorker();

export default agnosticWorker;
