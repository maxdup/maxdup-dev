function SyncWorker(){
  this.agnosticWorker = require('./agnostic-worker').default

  this.init = (canvas3D, canvas2D) =>{
    this.agnosticWorker.init(canvas3D, canvas2D);
    if (CRASH_3D){
      throw new Error('WebGL_init_failure');
    }
  }
  this.postMessage = (event) => {
    this.agnosticWorker.run(event.msg, event.value);
  }
  this.exec = (eventName, value) => {
    this.agnosticWorker.run(eventName, value);
  }
  return this
}

export default SyncWorker;
