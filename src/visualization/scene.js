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
  this.fogginess = 0;

  let targetDottedness = 1;
  let targetNodeness = 0;
  let targetGridness = 0;
  let targetFogginess = 0;

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
    this.fogginess = updated(this.fogginess, targetFogginess);
  }

  this.target = (sceneName) => {
    switch(SCENES[sceneName]){
    case SCENES.about:
      targetDottedness = 1;
      targetNodeness = 0;
      targetGridness = 1;
      targetFogginess = 1;
      break
    case SCENES.contact:
      targetDottedness = 1;
      targetNodeness = 1;
      targetGridness = 0;
      targetFogginess = 0;
      break
    case SCENES.services:
    case SCENES.main:
    default:
      targetDottedness = 1;
      targetNodeness = 0;
      targetGridness = 0;
      targetFogginess = 0;
    }
  }
}

export default Scene;
