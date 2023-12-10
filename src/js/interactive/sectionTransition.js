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

  this.target = (section) => {
  }

  this._checkSmoothing = () => {
    this.smoothing = this.currentProgress != this.targetProgress;
  }
  this.onNav = (section) => {
  }
  this.onScroll = () => {
    let determineCurrentTransition = () => {
      let targetTransition = 0;

      let offs = [];
      for (let i = 0; i < this.sections.length; i++){
        let bounds = this.sections[i].elem.getBoundingClientRect();
        if(bounds.bottom - window.innerHeight /2 > window.innerHeight/2){
          targetTransition = i;
          break;
        }
      }
      return scrollTransitions[targetTransition-1];
    }
    let determineCurrentProgress = () => {

      let fromPos = this.currentTransition.fromSection.elem.getBoundingClientRect();
      let toPos = this.currentTransition.toSection.elem.getBoundingClientRect();

      let fromBound = fromPos.bottom - window.innerHeight / 2;
      let toBound = toPos.top + window.innerHeight / 2;
      let currPos = window.innerHeight / 2;

      let progress = (currPos - fromBound) / (toBound - fromBound)
      return Math.max(0, Math.min(1, progress));
    }

    this.currentTransition = determineCurrentTransition();

    if (this.currentTransition){
      this.targetProgress = determineCurrentProgress();
    }

    this._checkSmoothing();
  }

  this.tick = () => {
    this.currentProgress = smoothingFn(this.currentProgress, this.targetProgress, 10);

    if (this.currentTransition){

      // Set Scene Id
      if (this.currentTransition.isScrollBased){
        let targetSceneId;
        if (this.currentProgress <= 0.5){
          targetSceneId = this.currentTransition.fromId;
        } else {
          targetSceneId = this.currentTransition.toId;
        }

        if (this.currentSceneId != targetSceneId){
          this.currentSceneId = targetSceneId;
          glInterface.exec('setScene', {
            name: this.sections[this.currentSceneId].scene,
            speed: 0.5,
          });
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
