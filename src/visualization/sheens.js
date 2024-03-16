function remap(val, minVal, maxVal){
  return (maxVal-minVal) * val + minVal;
}

function makeSheen (){
  return {
    inactive: true,
    angle: [0,1],
    origin: [-4,-4],
    speed: 0
  }
}

function sheensToString(){
  // rrrbbbggg
  let sheensStr = Array.from({length: 9}, (_,i) =>
                             SHEEN_COLORS[i%3][Math.floor(i/3)]);
  return sheensStr.join();
}

const SHEEN_COLORS = [[1.0, 0.0, 0.2],
                      [0.2, 0.8, 0.4],
                      [1.0, 1.0, 1.0]];

const SHEENS_STR = sheensToString();

function Sheens(){
  this.str = SHEENS_STR;
  this.array = [makeSheen(), makeSheen(), makeSheen()];
  this.respawn = false;
  this.active = false;
  this.nextWave = null;

  this.set = (cfg) => {
    this.active = true;
    if (cfg?.respawn !== undefined) {
      this.respawn = cfg.respawn;
    }
    let a = remap(Math.random(), 10, 70) / 45 * 2

    this.array.forEach((s) => {
      let delta = remap((Math.random()+1) /2, -1.5, 1.5);
      s.inactive = false;
      s.speed = remap(a/3 + delta, 1.0, 4.0),
      s.angle = [-a+delta*4, 1];
      s.origin = [-4-delta*4, -4-delta*4];
    });

    if (cfg && cfg.sheens){
      for (let i = 0; i < cfg.sheens.length; i++){
        Object.assign(this.array[i], cfg.sheens[i]);
      }
    }
    clearTimeout(this.nextWave);
  }

  this.update = (dt) => {
    if (!this.active){ return }
    this.active = false;
    this.array.forEach((s) => {
      !s.inactive && updateSheen(s, dt);
      this.active = this.active || !s.inactive;
    });
    if (!this.active && this.respawn){
      this.nextWave = setTimeout(
        this.set, 2000 + Math.random() * 3000);
    }
  }

  let updateSheen = (sheen, dt) => {
    let dist = sheen.speed * dt;
    sheen.angle[0] = Math.min(-0.25, sheen.angle[0] + dist/10);
    sheen.origin[0] += dist;
    sheen.origin[1] += dist;
    sheen.inactive = Math.max(sheen.origin[0], sheen.origin[1]) > 4;
  }
}

export default Sheens;
