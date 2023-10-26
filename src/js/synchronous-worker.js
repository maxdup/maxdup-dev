import agnosticWorker from './agnostic-worker';

function SyncWorker(){
  this.init = (canvas) =>{
    agnosticWorker.init(canvas);
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
