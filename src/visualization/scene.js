const SCENES = {
  main: 0,
  mountain: 1,
  network: 2,
  montreal: 3,
};

function Scene(){
  this.dottedness = 1;
  this.nodeness = 0;
  this.gridness = 0;
  this.toponess = 0;

  let targetDottedness = 1;
  let targetNodeness = 0;
  let targetGridness = 0;
  let targetToponess = 0;

  let velocity = 0.3; // seconds

  this.update = (dt) => {
    let deltaness = dt / velocity;
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
    this.toponess = updated(this.toponess, targetToponess);
  }

  this.target = (sceneName, speed) => {
    velocity = speed;
    switch(SCENES[sceneName]){
    case SCENES.mountain:
      this.activeScene = sceneName;
      targetDottedness = 1;
      targetNodeness = 0;
      targetGridness = 1;
      targetToponess = 0;
      break
    case SCENES.network:
      this.activeScene = sceneName;
      targetDottedness = 1;
      targetNodeness = 1;
      targetGridness = 0;
      targetToponess = 0;
      break
    case SCENES.montreal:
      this.activeScene = sceneName;
      targetDottedness = 1;
      targetNodeness = 0;
      targetGridness = 0;
      targetToponess = 1;
      break
    case SCENES.main:
      this.activeScene = sceneName;
    default:
      targetDottedness = 1;
      targetNodeness = 0;
      targetGridness = 0;
      targetToponess = 0;
    }
  }
}

export default Scene;
