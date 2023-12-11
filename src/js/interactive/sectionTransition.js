import glInterface from '../gl-interface';
import { deCasteljau, smoothingFn, easeInOut } from '../utils';

const PEEK_TRANSITION_SPEED = 0.3;
const SCROLL_TRANSITION_SPEED = 0.5;

function SectionTransition(sections){
  this.sections = sections;

  this.currentSceneId = 0;
  this.lockedSceneId = null;

  this.fromSection = null;
  this.toSection = null;

  this.targetProgress = null;
  this.currentProgress = null;

  this.currentTransition = null;

  this.progressFrom = null;
  this.progressTo = null;

  this.smoothing = false;

  let scrollTransitions = [];
  for (let i = 0; i < this.sections.length-1; i++){
    scrollTransitions.push({
      isScrollBased: true,
      fromId: i,
      fromSection: this.sections[i],
      toId: i+1,
      toSection: this.sections[i+1],
    });
  }

  this.sceneIdByName = (sceneName) => {
    let targetScene = this.sections.find((s)=>s.scene == sceneName);
    return this.sections.indexOf(targetScene);
  }

  this.lockScene = (sceneName) => {
    if (sceneName != this.sections[this.currentSceneId].scene){
      this.setScene(sceneName, PEEK_TRANSITION_SPEED);
    }
    this.lockedSceneName = sceneName;
  }

  this.unlockScene = () => {
    if (this.lockedSceneName != this.sections[this.currentSceneId].scene){
      this.setScene(this.sections[this.currentSceneId].scene,
                    PEEK_TRANSITION_SPEED);
    }
    this.lockedSceneName = null;
  }

  this.endClickTransition = () => {
    clearTimeout(this.scrollTimeout);
    this.scrollTimeout = null;
    this.clickTransition = null;
  }

  this.targetScene = (sceneName) => {
    this.clickTransition && this.endClickTransition();

    let ids = [this.sceneIdByName(sceneName), this.currentSceneId];

    if (ids[0] == ids[1]){ return }

    ids = ids.sort((a, b)=> a - b);

    this.clickTransition = {
      isScrollBased: false,
      sceneName: sceneName,
      fromId: ids[0],
      fromSection: this.sections[ids[0]],
      toId: ids[1],
      toSection: this.sections[ids[1]],
    }
  }

  this.setScene = (sceneName, speed) => {
    glInterface.exec('setScene', {
      name: sceneName,
      speed: speed,
    });
  }

  this._checkSmoothing = () => {
    this.smoothing = this.currentProgress != this.targetProgress;
  }

  this._determineScrollTransition = () => {
    let determineCurrentTId = () => {
        for (let i = 0; i < this.sections.length; i++){
          if (this.sections[i].elem.getBoundingClientRect().top > 0){
            return i-1;
          }
        }
        return this.sections.length-2;
      }
      let tid = determineCurrentTId();
      return scrollTransitions[tid];
  }
  this._determineScrollProgress = (transition) => {
    if (!transition){ return -1 };

    let fromPos = transition.fromSection.elem.getBoundingClientRect();
    let toPos = transition.toSection.elem.getBoundingClientRect();

    let fromBound = fromPos.bottom - window.innerHeight / 2;
    let toBound = toPos.top + window.innerHeight / 2;
    let currPos = window.innerHeight / 2;

    let progress = (currPos - fromBound) / (toBound - fromBound)
    return Math.max(0, Math.min(1, progress));
  }

  this.onScroll = () => {

    let activeTransition = this.clickTransition || this._determineScrollTransition();
    this.targetProgress = this._determineScrollProgress(activeTransition);

    if (this.currentTransition != activeTransition){
      if (this.currentTransition!== null){
        this.currentProgress = this.targetProgress;
      }
      this.currentTransition = activeTransition;
    }

    clearTimeout(this.scrollTimeout);
    this.scrollTimeout = setTimeout(this.endClickTransition, 100);

    this._checkSmoothing();
  }

  this.tick = () => {

    this.currentProgress = smoothingFn(this.currentProgress, this.targetProgress, 25);

    if (this.currentTransition){
      let targetSceneId;
      if (this.currentTransition.sceneName){
        targetSceneId = this.sceneIdByName(this.clickTransition.sceneName);
      } else {
        if (this.currentProgress <= 0.5){
          targetSceneId = this.currentTransition.fromId;
        } else {
          targetSceneId = this.currentTransition.toId;
        }
      }

      if (this.currentSceneId != targetSceneId){
        this.currentSceneId = targetSceneId;
        if (!this.lockedSceneName){
          this.setScene(this.sections[this.currentSceneId].scene, SCROLL_TRANSITION_SPEED)
        }
      }


      // Set Cam Angle
      let from = this.currentTransition.fromSection;
      let to = this.currentTransition.toSection;

      let progress = easeInOut(this.currentProgress);

      let camAngle = deCasteljau([from.cameraAngle, from.cameraAngleOut,
                                  to.cameraAngleIn, to.cameraAngle], progress);
      let camOffset = deCasteljau([from.cameraOffset, from.cameraOffsetOut,
                                   to.cameraOffsetIn, to.cameraOffset], progress);

      glInterface.exec('setCamAngle', {
        pitch: camAngle[0],
        yaw: camAngle[1],
        roll: camAngle[2],
        offsetX: camOffset[0],
        offsetY: camOffset[1],
        offsetZ: camOffset[2],
      });
    }

    this._checkSmoothing();
  }
  this.onScroll();
  this.currentProgress = this.targetProgress;

}
export default SectionTransition;
