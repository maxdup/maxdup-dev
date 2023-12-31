function SyncWorker(){
  this.agnosticWorker = require('./agnostic-worker').default

  this.init = (canvas) =>{
    this.agnosticWorker.init(canvas);
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
