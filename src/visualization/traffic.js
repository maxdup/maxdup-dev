import { N, L } from './config.js';

// Dots that flow continuously along the road polylines in the topo view.
// roads.js stores the network as ordered segment pairs that chain into
// polylines (segment e's end == segment e+1's start). We rebuild those
// polylines and run dots from one end to the other, riding the topo height.

const MAX_CARS = 28;        // buffer headroom
const TARGET_CARS = 18;     // population we try to maintain
const SPEED_MIN = 0.45;     // world units per second
const SPEED_MAX = 0.9;
const FADE = 0.12;          // path-fraction over which a dot fades in/out

function Traffic(){

  this.len = MAX_CARS;
  this.count = 0;
  this.data = new Float32Array(MAX_CARS * 4); // [x, height, y, intensity]

  let paths = [];   // each: array of segments {a, b, ax, ay, bx, by, atx..bty, len}
  let cars = [];
  let ready = false;

  let planar = (id) => {
    let gx = Math.floor(id / N);
    let gy = id % N;
    return [L * 0.02 * (-N / 2 + gx), L * 0.02 * (-N / 2 + gy)];
  };

  // split the flat segment-pair list into continuous polylines
  let buildPaths = (idTable) => {
    let result = [];
    let cur = [];
    for (let e = 0; e < Math.floor(idTable.length / 2); e++) {
      let a = idTable[e * 2];
      let b = idTable[e * 2 + 1];
      if (cur.length === 0) {
        cur.push(a, b);
      } else if (cur[cur.length - 1] === a) {
        cur.push(b);
      } else {
        result.push(cur);
        cur = [a, b];
      }
    }
    if (cur.length) { result.push(cur); }
    return result;
  };

  this.init = (roads, topo) => {
    buildPaths(roads.idTable).forEach((ids) => {
      let segs = [];
      for (let k = 0; k < ids.length - 1; k++) {
        let a = ids[k];
        let b = ids[k + 1];
        let pa = planar(a);
        let pb = planar(b);
        segs.push({
          a, b,
          ax: pa[0], ay: pa[1],
          bx: pb[0], by: pb[1],
          atx: topo[a * 2], aty: topo[a * 2 + 1],
          btx: topo[b * 2], bty: topo[b * 2 + 1],
          len: Math.max(0.0001, Math.hypot(pb[0] - pa[0], pb[1] - pa[1])),
        });
      }
      if (segs.length) { paths.push(segs); }
    });
    ready = paths.length > 0;
  };

  // reproduce the topo-scene height from main.vert for one endpoint
  let topoHeight = (h, tx, ty, toponess) => {
    let freeze = ty * -0.5 + 1.0;
    let target = Math.max(-0.1, tx - 0.6) * 0.65 * toponess;
    return h + (h * freeze + target - h) * toponess;
  };

  let spawn = () => {
    cars.push({
      segs: paths[Math.floor(Math.random() * paths.length)],
      seg: 0,
      t: 0,
      speed: SPEED_MIN + Math.random() * (SPEED_MAX - SPEED_MIN),
    });
  };

  // toponess: current topo-scene morph factor; heights: live wave heights
  this.update = (dt, toponess, heights) => {
    this.count = 0;
    if (!ready || !heights || toponess <= 0.01) { cars.length = 0; return; }

    if (cars.length < TARGET_CARS) { spawn(); }

    let w = 0;
    for (let c = cars.length - 1; c >= 0; c--) {
      let car = cars[c];
      let segs = car.segs;
      let s = segs[car.seg];

      // advance, normalized by segment length for ~constant world speed
      car.t += (car.speed * dt) / s.len;
      while (car.t >= 1) {
        car.t -= 1;
        car.seg++;
        if (car.seg >= segs.length) { break; }
        s = segs[car.seg];
      }
      if (car.seg >= segs.length) { cars.splice(c, 1); continue; }

      let t = car.t;
      let az = topoHeight(heights[s.a], s.atx, s.aty, toponess);
      let bz = topoHeight(heights[s.b], s.btx, s.bty, toponess);

      // fade in over the first FADE of the path, out over the last FADE
      let progress = (car.seg + t) / segs.length;
      let intensity = Math.min(1, progress / FADE) *
                      Math.min(1, (1 - progress) / FADE);

      let i = w * 4;
      this.data[i]     = s.ax + (s.bx - s.ax) * t;
      this.data[i + 1] = az + (bz - az) * t;
      this.data[i + 2] = s.ay + (s.by - s.ay) * t;
      this.data[i + 3] = intensity;
      w++;
    }
    this.count = w;
  };
}

export default Traffic;
