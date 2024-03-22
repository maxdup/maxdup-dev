import { ENABLE_3D, CRASH_3D } from './constants';

function GlInterface() {
  this.supports3D = undefined;

  this.fallbackFn = null;
  this.setFallback = (fallbackFn) => {
    this.fallbackFn = fallbackFn;
    if (this.supports3D === false){
      this.fallbackFn && this.fallbackFn();
    }
  }

  this.disengage = (err) => {
    this.supports3D = false;
    this.glWorker = null;
    this.fallbackFn && this.fallbackFn();
  }

  this.loaded = new Promise((resolve, reject) => {
    if (!ENABLE_3D){ reject() }
    window.addEventListener('load', async function() {
      if (window.WebGLRenderingContext){
        const canvas3D = document.createElement("CANVAS");
        const canvas2D = document.createElement("CANVAS");
        document.body.prepend(canvas3D);
        try {
          const offscreenCanvas3D = canvas3D.transferControlToOffscreen();
          const offscreenCanvas2D = canvas2D.transferControlToOffscreen();
          this.glWorker = new Worker(
            new URL('./background-worker.js', import.meta.url));
          this.glWorker.addEventListener('message', (event) => {
            this.disengage(event.data);
          });
          this.glWorker.postMessage({msg: 'init',
                                     canvas3D: offscreenCanvas3D,
                                     canvas2D: offscreenCanvas2D,
                                    }, [offscreenCanvas3D, offscreenCanvas2D]);
          this.supports3D = true;
          resolve();
        }
        catch(workerError) {
          let abort = (err) => {
            this.disengage(err);
            reject(err);
          }
          if (workerError instanceof TypeError &&
              workerError.message.includes(
                "transferControlToOffscreen is not a function")) {
            try {
              require.ensure(['./synchronous-worker.js'], (require) => {
                let SyncWorker = require('./synchronous-worker.js').default;
                this.supports3D = true;
                this.glWorker = new SyncWorker();
                this.glWorker.init(canvas3D, canvas2D);
                if (CRASH_3D){
                  throw new Error('WebGL_init_failure');
                }
                resolve();
              });
            } catch (GLError) {
              abort(GLError);
            }
          } else {
            abort(workerError);
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
