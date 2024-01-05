this.agnosticWorker = require('./agnostic-worker').default

self.onmessage = (event) => {
  if (event.data.msg == 'init'){
    this.agnosticWorker.init(event.data.canvas3D,
                             event.data.canvas2D);
  } else {
    this.agnosticWorker.run(event.data.msg,
                            event.data.value);
  }
}
