import Scene from '../visualization/scene';
import Camera from '../visualization/camera';
import Ticker from '../visualization/ticker';
import Void from '../visualization/void';
import Waves from '../visualization/waves';
import Grid from '../visualization/grid';
import Nodes from '../visualization/nodes';
import Roads from '../visualization/roads';
import Sheens from '../visualization/sheens';

const WORKER_MSGS = {
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

function AgnosticWorker(){

  let scene = new Scene();
  let camera = new Camera();
  let ticker = new Ticker(camera);
  let waves = new Waves();
  let grid = new Grid();
  let sheens = new Sheens();
  let nodes = new Nodes();
  let roads = new Roads();

  let v = new Void(scene, camera, ticker, waves, grid, nodes, roads, sheens);

  this.init = (canvas3D, canvas2D) => {
    v.initWebGL(canvas3D);
    v.initTextures(canvas2D);
    v.initShaders();
  }
  this.run = (eventName, value) => {
    switch(WORKER_MSGS[eventName]){
    case WORKER_MSGS.start:
      v.start();
      break;
    case WORKER_MSGS.setSize:
      camera.updateSize(value.width, value.height);
      break;
    case WORKER_MSGS.setProgress:
      v.setProgress(value);
      break;
    case WORKER_MSGS.setCamOffset:
      camera.updateNudge(value.pitchOffset,
                         value.yawOffset);
      break;
    case WORKER_MSGS.setCamAngle:
      camera.updateAngle(value.pitch, value.yaw, value.roll,
                         value.offsetX, value.offsetY, value.offsetZ);
      break;
    case WORKER_MSGS.setInertia:
      waves.setInertia(1 - value * ticker.targetFPS / 30);
      break;
    case WORKER_MSGS.setPositions:
      waves.setPositions(value);
      break;
    case WORKER_MSGS.setSheens:
      sheens.set(value);
      break;
    case WORKER_MSGS.setScene:
      scene.target(value.name,
                   value.speed);
      break;
    case WORKER_MSGS.setFPS:
      ticker.setFPS(value);
      break;
    case WORKER_MSGS.loseCTX:
      v.loseCTX();
      break;
    }
  }
  return this;
}

let agnosticWorker = new AgnosticWorker();

export default agnosticWorker;
