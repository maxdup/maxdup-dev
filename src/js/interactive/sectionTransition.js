import glInterface from '../gl-interface';
import { deCasteljau, smoothingFn, easeInOut } from '../utils';

function SectionTransition(sections){
  this.sections = sections;

  this.currentSceneId = 0;

  this.fromSection = null;
  this.toSection = null;

  this.targetProgress = null;
  this.currentProgress = null;

  this.progressFrom = null;
  this.progressTo = null;

  this.smoothing = false;

  this.target = (section) => {
  }

  this._checkSmoothing = () => {
    this.smoothing = this.currentProgress != this.targetProgress;
  }
  this.onNav = (section) => {

  }
  this.onScroll = () => {
    let offsets = [];

    for (let i = 0; i < this.sections.length; i++){

      if (!this.sections[i].floater){
        offsets.push(-1);
        continue
      }

      let offset = 0;
      if (top > 0){
        let top = this.sections[i].floater.getBoundingClientRect().top;
        offset = top / window.innerHeight;
      } else {
        let bottom = this.sections[i].floater.getBoundingClientRect().bottom;
        offset = bottom / window.innerHeight - 1;
      }

      offsets.push(Math.min(1, Math.max(-1, offset)));

      if (this.sections[i].floating){
        this.sections[i].floating.style.top = (offset/-2*100) + "vh";
        this.sections[i].floating.style.opacity = 1.25 - Math.abs(offset);
      }
    }

    for (let i = 0; i < this.sections.length; i++){
      if (offsets[i] > 0){
        this.targetProgress = i - offsets[i];
        break;
      }
    }

    let targetSceneId = Math.floor(this.targetProgress + 0.5);
    if (this.currentSceneId != targetSceneId){
      this.currentSceneId = targetSceneId;
      glInterface.exec('setScene', {
        name: this.sections[this.currentSceneId].scene,
        speed: 0.5,
      });
    }

    this._checkSmoothing();
  }

  this.tick = () => {
    this.currentProgress = smoothingFn(this.currentProgress, this.targetProgress, 10);
    this.currentSectionId = Math.floor(this.currentProgress);

    let currentFromSection = this.sections[this.currentSectionId];
    let currentToSection = this.sections[this.currentSectionId + 1];

    let from = currentFromSection;
    let to = currentToSection;

    let progress = easeInOut(this.currentProgress % 1);

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
    this._checkSmoothing();
  }

}
export default SectionTransition;
