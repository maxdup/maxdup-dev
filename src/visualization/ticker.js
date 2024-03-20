function Ticker(camera){

  // -------------------------------------------
  // monitor and regulate framerate by adjusting
  // render quality (resolution and framerate)
  // -------------------------------------------

  this.camera = camera;

  this.targetFPS = 60;

  let minQuality = false;
  let maxQuality = false;
  let qualityIncreaseCount = 0;

  let frameTiming = Date.now();  // milliseconds
  let frameInterval =  0;  // milliseconds

  let frameCount = 0;
  let frameAvg = null; // milliseconds

  let currentFrameStartAt = Date.now();  // milliseconds
  let currentFrameDelta = 0; // milliseconds

  this.timeDelta = 0; // seconds
  this.fixedTimeDelta = 0; // seconds

  this.frameReady = () => {
    currentFrameStartAt = Date.now(); // datetime
    currentFrameDelta = currentFrameStartAt - frameTiming;
    return currentFrameDelta > frameInterval;
  }

  this.frameStart = () => {
    frameTiming = currentFrameStartAt - (currentFrameDelta % frameInterval);
    this.timeDelta = currentFrameDelta / 1000;
  }

  this.frameEnd = () => {
    let deltaT = Date.now() - currentFrameStartAt;
    frameAvg = frameAvg || deltaT;
    frameCount++;
    frameAvg += (deltaT - frameAvg) / frameCount;
    this.evalFrameTime();
  }

  this.evalFrameTime = () => {
    // We make it harder to increase quality than it is to decrease.
    // This avoids flip-flopping, furthermore, you are capped on the
    // number of increases.
    if (frameCount < this.targetFPS * 3){
      return;
    }
    if (frameAvg * 2 > 1 / this.targetFPS * 1000 &&
	!minQuality){
      this.decreaseRenderQuality();
      maxQuality = false;
    }
    if (frameAvg * 6 < 1 / this.targetFPS * 1000 &&
	!maxQuality && qualityIncreaseCount < 6){
      qualityIncreaseCount++;
      this.increaseRenderQuality();
      minQuality = false;
    }
  }

  this.decreaseRenderQuality = () => {
    frameCount = 0;
    frameAvg = null;
    if (this.targetFPS == 60){
      this.setFPS(30);
      return;
    }
    if (this.camera.renderScale == 1) {
      this.camera.updateRenderScale(0.5);
      return;
    }
    if (this.camera.renderScale == 0.75) {
      this.camera.updateRenderScale(0.5);
      return;
    }
    minQuality = true;
  }

  this.increaseRenderQuality = () => {
    frameCount = 0;
    frameAvg = null;
    if (this.camera.renderScale == 0.5){
      this.camera.updateRenderScale(0.75);
      return;
    }
    if (this.camera.renderScale == 0.75){
      this.camera.updateRenderScale(1.0);
      return;
    }
    if (this.camera.renderScale == 1 &&
        this.targetFPS == 30){
      this.setFPS(60);
    }
    maxQuality = true;
  }

  this.setFPS = (fps) => {
    if (fps == this.targetFPS){ return }
    this.targetFPS = fps;
    _onFPSChanged();
  }

  let _onFPSChanged = () => {
    frameInterval =  1000 / this.targetFPS;
    this.fixedTimeDelta = 0.10 / (this.targetFPS / 30)  /3 *2;
  }

  _onFPSChanged();
}
export default Ticker;
