// Downward "signal sweep" for the trajectory (mountain) scene: a band of light
// that descends from the peaks to the valleys — reading as a wave washing down
// the mountain. Fired by message (from the main thread, the instant the
// trajectory line finishes filling) so it stays in sync with the HTML summit
// pulse. The shader scopes it to the mountain scene via gridness.

// model-space height bounds of the baked terrain, with margin so the band
// starts above every peak and ends below every valley
const TOP = 3.0;
const BOTTOM = -3.5;
const DURATION = 0.9;      // seconds for the band to travel top -> bottom
const PEAK_INTENSITY = 0.8;

function Pulse() {
  this.height = TOP;     // current elevation of the band
  this.intensity = 0;    // 0 when idle

  let t = -1;            // < 0 == idle
  let amp = 1;           // per-trigger intensity scale (big vs soft pulse)

  // scale: 0..1 brightness of this sweep (defaults to full)
  this.trigger = (scale) => { t = 0; amp = scale || 1; };

  this.update = (dt) => {
    if (t < 0) { this.intensity = 0; return; }

    t += dt;
    let p = t / DURATION;          // 0..1 descent
    if (p >= 1) {
      t = -1;
      this.height = TOP;
      this.intensity = 0;
      return;
    }

    this.height = TOP + (BOTTOM - TOP) * p;
    // ease in and out so the band doesn't pop at the extremes
    this.intensity = Math.sin(p * Math.PI) * PEAK_INTENSITY * amp;
  };
}

export default Pulse;
