

function GlInterface() {
  this.supports3D = false;
  this.supportsWorker = false;

  this.loaded = new Promise((resolve, reject) => {
    window.addEventListener('load', async function() {
      if (window.WebGLRenderingContext){
        const canvas = document.createElement("CANVAS");
        document.body.prepend(canvas);
        this.supports3D = true;

        try {
          const offscreenCanvas = canvas.transferControlToOffscreen();

          this.glWorker = new Worker(new URL('./background-worker.js', import.meta.url));
          this.glWorker.postMessage({msg: 'init', canvas: offscreenCanvas}, [offscreenCanvas]);
          this.supportsWorker = true;
          resolve();
        }
        catch(err) {
          let abort = () => {
            this.supports3D = false;
            this.supportsWorker = false;
            this.glWorker = null;
            reject();
          }
          if (err instanceof TypeError &&
              err.message.includes("transferControlToOffscreen is not a function")) {
            try {
              require.ensure(['./synchronous-worker.js'], (require) => {
                let SyncWorker = require('./synchronous-worker.js').default;
                this.supports3D = true;
                this.supportsWorker = false;
                this.glWorker = new SyncWorker();
                this.glWorker.init(canvas);
                resolve();
              });
            } catch (err) {
              console.error("Background doesn't work because:", err);
              abort();
            }
          } else {
            console.error("Background doesn't work because:", err);
            abort();
          }
        }
      }
    }.bind(this));

  });

  this.exec = (eventName, value) => {
    if (this.supports3D){
      this.glWorker.postMessage({msg: eventName, value: value});
    }
  }

  return this;
}

let glInterface = new GlInterface();

export default glInterface;
