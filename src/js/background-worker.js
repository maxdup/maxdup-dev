import { CRASH_3D } from './constants.js';
import { agnosticWorker } from './agnostic-worker.js';

self.onmessage = (event) => {
  if (event.data.msg == 'init'){
    try {
      agnosticWorker.init(event.data.canvas3D,
                          event.data.canvas2D);
      if (CRASH_3D){
        throw new Error('WebGL_init_failure');
      }
    } catch (GLError){
      self.postMessage(GLError);
    }
  } else {
    agnosticWorker.run(event.data.msg,
                       event.data.value);
  }
}
