import agnosticWorker from '../main/agnostic-worker';

self.onmessage = (event) => {
  if (event.data.msg == 'init'){
    agnosticWorker.init(event.data.canvas);
  } else {
    agnosticWorker.run(event.data.msg,
                       event.data.value);
  }
}
