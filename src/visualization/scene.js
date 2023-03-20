const SCENES = {
  main: 0,
  about: 1,
  services: 2,
  contact: 3,
};

function Scene(){
  this.dottedness = 1;
  this.nodeness = 0;
  this.gridness = 0;
  this.mapness = 0;

  let targetDottedness = 1;
  let targetNodeness = 0;
  let targetGridness = 0;
  let targetMapness = 0;

  let velocity = 0.3; // seconds

  this.update = (dt) => {
    let deltaness = dt / velocity / 1000;
    let updated = (val, target) => {
      if (val == target){
        return val;
      } else {
        if (val > target){
          return Math.max(0, val - deltaness);
        } else {
          return Math.min(1, val + deltaness);
        }
      }
    }
    this.dottedness = updated(this.dottedness, targetDottedness);
    this.nodeness = updated(this.nodeness, targetNodeness);
    this.gridness = updated(this.gridness, targetGridness);
    this.mapness = updated(this.mapness, targetMapness);
  }

  this.target = (sceneName, speed) => {
    velocity = speed;
    switch(SCENES[sceneName]){
    case SCENES.about:
      this.activeScene = sceneName;
      targetDottedness = 1;
      targetNodeness = 0;
      targetGridness = 1;
      targetMapness = 0;
      break
    case SCENES.services:
      this.activeScene = sceneName;
      targetDottedness = 1;
      targetNodeness = 1;
      targetGridness = 0;
      targetMapness = 0;
      break
    case SCENES.contact:
      this.activeScene = sceneName;
      targetDottedness = 1;
      targetNodeness = 0;
      targetGridness = 0;
      targetMapness = 1;
      break
    case SCENES.main:
      this.activeScene = sceneName;
    default:
      targetDottedness = 1;
      targetNodeness = 0;
      targetGridness = 0;
      targetMapness = 0;
    }
  }
}

export default Scene;
