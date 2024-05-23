import { CRASH_3D } from './constants.js';
import { agnosticWorker } from './agnostic-worker.js';

function SyncWorker(){

  this.init = (canvas3D, canvas2D) =>{
    agnosticWorker.init(canvas3D, canvas2D);
    if (CRASH_3D){
      throw new Error('WebGL_init_failure');
    }
  }
  this.postMessage = (event) => {
    agnosticWorker.run(event.msg, event.value);
  }
  this.exec = (eventName, value) => {
    agnosticWorker.run(eventName, value);
  }
  return this
}

export default SyncWorker;
