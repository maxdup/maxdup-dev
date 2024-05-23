import { ENABLE_3D, CRASH_3D, CRASH_WEBWORKER } from './constants.js';

function GlInterface() {
  this.supports3D = undefined;
  this.canvas2D = undefined;
  this.canvas3D = undefined;

  this.fallbackFn = null;
  this.setFallback = (fallbackFn) => {
    this.fallbackFn = fallbackFn;
    if (this.supports3D === false){
      this.fallbackFn && this.fallbackFn();
    }
  }

  this.loadAsyncWorker = async () => {
    if (CRASH_WEBWORKER){
      throw new Error('web_worker_failure');
    }
    const offscreenCanvas3D = this.canvas3D.transferControlToOffscreen();
    const offscreenCanvas2D = this.canvas2D.transferControlToOffscreen();
    this.glWorker = new Worker(
      new URL('./background-worker.js', import.meta.url));
    this.glWorker.addEventListener('message', (event) => {
      this.unload(event.data);
    });
    this.glWorker.postMessage({msg: 'init',
                               canvas3D: offscreenCanvas3D,
                               canvas2D: offscreenCanvas2D,
                              }, [offscreenCanvas3D, offscreenCanvas2D]);
    this.supports3D = true;
  }

  this.loadSyncWorker = async (workerError) => {
    if (!workerError.message.includes('web_worker_failure') &&
        !((workerError instanceof TypeError) &&
          workerError.message.includes("transferControlToOffscreen is not a function"))){
      // unknown/unrecoverable
      throw workerError;
    }
    let SyncWorker = (await import('./synchronous-worker.js')).default;
    this.supports3D = true;
    this.glWorker = new SyncWorker();
    this.glWorker.init(this.canvas3D, this.canvas2D);
    if (CRASH_3D){
      throw new Error('WebGL_init_failure');
    }
  }

  this.unload = (err) => {
    this.supports3D = false;
    this.glWorker = null;
    this.canvas3D = null;
    this.canvas2D = null;
    this.fallbackFn && this.fallbackFn();
  }

  this.loaded = new Promise((resolve, reject) => {
    if (!ENABLE_3D){ reject() }
    window.addEventListener('load', async function() {
      if (window.WebGLRenderingContext){
        this.canvas3D = document.createElement("CANVAS");
        this.canvas2D = document.createElement("CANVAS");
        document.body.prepend(this.canvas3D);
        try {
          await this.loadAsyncWorker();
          resolve();
        } catch(asyncWorkerError) {
          console.warn('async error', asyncWorkerError);
          try {
            await this.loadSyncWorker(asyncWorkerError);
            resolve();
          } catch (syncWorkerError){
            console.warn('sync error', syncWorkerError);
            this.unload(syncWorkerError);
            reject(syncWorkerError);

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
