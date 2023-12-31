this.agnosticWorker = require('./agnostic-worker').default

self.onmessage = (event) => {
  if (event.data.msg == 'init'){
    this.agnosticWorker.init(event.data.canvas);
  } else {
    this.agnosticWorker.run(event.data.msg,
                            event.data.value);
  }
}
