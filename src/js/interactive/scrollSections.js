import glInterface from '../gl-interface.js';
import { deCasteljau, smoothingFn, easeInOut } from '../utils.js';
import { MAIN_LOOP_MS } from '../constants.js';

const SMOOTHING_FACTOR = 150 / MAIN_LOOP_MS;
const PEEK_TRANSITION_SPEED = 0.3; // scene transitions
const SCROLL_TRANSITION_SPEED = 0.75; // scene transitions

const navLinks = window.document.querySelectorAll('nav #nav-links a');


function ScrollSections(sections){
  this.sections = sections;

  this.currentSceneId = null;
  this.lockedSceneId = null;

  this.fromSection = null;
  this.toSection = null;

  this.targetProgress = null;
  this.currentProgress = null;

  this.currentTransition = null;

  this.progressFrom = null;
  this.progressTo = null;

  this.active = false;
  this.hooksOn = (eventType) => {
    return eventType == 'scroll' || eventType == 'wheel'
  }

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
    this.currentTransition = null;
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

    clearTimeout(this.scrollTimeout);
    this.scrollTimeout = setTimeout(this.endClickTransition, 1000);
  }

  this.setScene = (sceneName, speed) => {
    glInterface.exec('setScene', {
      name: sceneName,
      speed: speed,
    });
  }

  this._checkActive = () => {
    this.active = this.currentProgress != this.targetProgress;
  }

  this._useScrollTransition = () => {
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
    if (!transition){ return -1 }

    let fromPos = transition.fromSection.elem.getBoundingClientRect();
    let toPos = transition.toSection.elem.getBoundingClientRect();

    let fromBound = fromPos.bottom - window.innerHeight / 2;
    let toBound = toPos.top + window.innerHeight / 2;
    let currPos = window.innerHeight / 2;

    let progress = (currPos - fromBound) / (toBound - fromBound)
    return Math.max(0, Math.min(1, progress));
  }

  this.onEvent = (e) => {
    switch (e?.type){
    case "wheel":
      this.clickTransition && this.endClickTransition();
      break;
    case "scroll":
    default:
      let activeTransition = this.clickTransition ||
        this._useScrollTransition();
      this.targetProgress = this._determineScrollProgress(activeTransition);

      if (this.currentTransition != activeTransition){
        if (this.currentTransition!== null){
          this.currentProgress = this.targetProgress;
        }
        this.currentTransition = activeTransition;
      }
      break;
    }
    this._checkActive();
  }

  this.tick = () => {

    this.currentProgress = smoothingFn(
      this.currentProgress, this.targetProgress, SMOOTHING_FACTOR);

    if (this.currentTransition){

      // determine target scene
      let targetSceneId;
      if (this.currentTransition.isScrollBased){
        if (this.currentProgress <= 0.5){
          targetSceneId = this.currentTransition.fromId;
        } else {
          targetSceneId = this.currentTransition.toId;
        }
      } else {
        targetSceneId = this.sceneIdByName(this.currentTransition.sceneName);
      }

      // set target scene
      if (this.currentSceneId != targetSceneId){
        this.currentSceneId = targetSceneId;
        const currentSceneName = this.sections[this.currentSceneId].scene;
        navLinks.forEach((navLink) =>{
          if (currentSceneName == navLink.attributes.scene.value){
            navLink.parentElement.classList.add('active');
          } else {
            navLink.parentElement.classList.remove('active');
          }
        });
        if (!this.lockeSceneName){
          this.setScene(currentSceneName, SCROLL_TRANSITION_SPEED)
        }
      }

      // Set Cam Angle
      let from = this.currentTransition.fromSection;
      let to = this.currentTransition.toSection;

      let progress;
      if (this.currentTransition.isScrollBased){
        progress = easeInOut(this.currentProgress);
      } else {
        progress = this._determineScrollProgress(this.currentTransition);
      }
      let camAngle = deCasteljau(
        [from.cameraAngle, from.cameraAngleOut,
         to.cameraAngleIn, to.cameraAngle], progress);
      let camOffset = deCasteljau(
        [from.cameraOffset, from.cameraOffsetOut,
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

    this._checkActive();
  }
  this.onEvent();
  this.currentProgress = this.targetProgress;
}

export default ScrollSections;
