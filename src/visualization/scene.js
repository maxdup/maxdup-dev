function Scene(){
  this.dottedness = 1;
  this.nodeness = 0;
  this.gridness = 0;
  this.fogginess = 0;

  this.targetDottedness = 1;
  this.targetNodeness = 0;
  this.targetGridness = 0;
  this.targetFogginess = 0;

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
    this.dottedness = updated(this.dottedness, this.targetDottedness);
    this.nodeness = updated(this.nodeness, this.targetNodeness);
    this.gridness = updated(this.gridness, this.targetGridness);
    this.fogginess = updated(this.fogginess, this.targetFogginess);
  }

  this.target = (sceneName) => {
    console.log('scene!', sceneName);
    if (sceneName == 'about') {
      this.targetDottedness = 0;
      this.targetNodeness = 0;
      this.targetGridness = 1;
      this.targetFogginess = 1;
    }
    if (sceneName == 'services') {
      this.targetDottedness = 1;
      this.targetNodeness = 0;
      this.targetGridness = 0;
      this.targetFogginess = 0;
    }
    if (sceneName == 'contact') {
      this.targetDottedness = 1;
      this.targetNodeness = 1;
      this.targetGridness = 0;
      this.targetFogginess = 0;
    }
  }
}

export default Scene;
