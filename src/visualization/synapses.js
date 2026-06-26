import { N, L } from './config.js';

// A small pool of "sparks" that travel along the network edges. Each firing
// picks a random edge, runs from one endpoint to the other, then dies — there
// is no continuity between edges. A short trail follows each spark head.

const MAX_SPARKS = 8;       // concurrent firings
const TRAIL = 4;            // points per spark (head + 3 trailing)
const TRAIL_GAP = 0.05;     // parametric spacing between trail points
const CONN_H_OFFS = 0.075;  // must match connHOffs in main.vert
const SPAWN_RATE = 1.5;     // average new firings per second
const SPEED_MIN = 0.9;      // edge fraction per second
const SPEED_MAX = 2.1;

function Synapses(){

  this.len = MAX_SPARKS * TRAIL;            // max points drawn
  this.count = 0;                           // points to draw this frame
  this.data = new Float32Array(this.len * 4); // [x, height, y, intensity] per point

  let edges = [];   // {aId, bId, ax, ay, bx, by, anc, bnc}
  let sparks = [];  // active firings {ei, t, speed}
  let ready = false;

  let planar = (id) => {
    let gx = Math.floor(id / N);
    let gy = id % N;
    return [L * 0.02 * (-N / 2 + gx), L * 0.02 * (-N / 2 + gy)];
  };

  this.init = (nodes) => {
    let idt = nodes.idTable; // flat [a0, b0, a1, b1, ...]
    for (let e = 0; e < Math.floor(idt.length / 2); e++) {
      let aId = idt[e * 2];
      let bId = idt[e * 2 + 1];
      let a = planar(aId);
      let b = planar(bId);
      edges.push({
        aId, bId,
        ax: a[0], ay: a[1],
        bx: b[0], by: b[1],
        anc: nodes.connections[aId],
        bnc: nodes.connections[bId],
      });
    }
    ready = edges.length > 0;
  };

  // nodeness: current network-scene morph factor; heights: live wave heights
  this.update = (dt, nodeness, heights) => {
    this.count = 0;
    if (!ready || !heights || nodeness <= 0.01) {
      sparks.length = 0; // drop everything when the scene isn't active
      return;
    }

    // spawn a new firing on a random edge
    if (Math.random() < SPAWN_RATE * dt && sparks.length < MAX_SPARKS) {
      sparks.push({
        ei: Math.floor(Math.random() * edges.length),
        t: 0,
        speed: SPEED_MIN + Math.random() * (SPEED_MAX - SPEED_MIN),
      });
    }

    // advance every firing and write its head + trail into the buffer
    let w = 0;
    for (let s = sparks.length - 1; s >= 0; s--) {
      let spark = sparks[s];
      spark.t += spark.speed * dt;
      if (spark.t > 1) { sparks.splice(s, 1); continue; }

      let e = edges[spark.ei];
      let az = heights[e.aId] + CONN_H_OFFS * nodeness * e.anc;
      let bz = heights[e.bId] + CONN_H_OFFS * nodeness * e.bnc;

      for (let k = 0; k < TRAIL; k++) {
        let tk = spark.t - k * TRAIL_GAP;
        if (tk < 0) break;
        // sin envelope = fade in/out along the edge; trail dims with k
        let intensity = Math.sin(Math.PI * tk) * (1 - k / TRAIL);
        if (intensity <= 0) continue;

        let i = w * 4;
        this.data[i]     = e.ax + (e.bx - e.ax) * tk;
        this.data[i + 1] = az + (bz - az) * tk;
        this.data[i + 2] = e.ay + (e.by - e.ay) * tk;
        this.data[i + 3] = intensity;
        w++;
      }
    }
    this.count = w;
  };
}

export default Synapses;
