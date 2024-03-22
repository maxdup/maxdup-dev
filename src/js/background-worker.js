const CRASH_3D = require('./constants').CRASH_3D;

this.agnosticWorker = require('./agnostic-worker').default

self.onmessage = (event) => {
  if (event.data.msg == 'init'){
    try {
      this.agnosticWorker.init(event.data.canvas3D,
                               event.data.canvas2D);
      if (CRASH_3D){
        throw new Error('WebGL_init_failure');
      }
    } catch (GLError){
      self.postMessage(GLError);
    }
  } else {
    this.agnosticWorker.run(event.data.msg,
                            event.data.value);
  }
}
