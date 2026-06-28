import glInterface from '../../js/gl-interface.js';

// Progressive enhancement for the trajectory path. The SVG draws its own
// geometry responsively with no JS; here we arm the fill-in reveal, fire it on
// scroll-in, and — the instant the line finishes filling — emit the signal:
// the HTML summit pulse (`.signaling`) and the canvas sweep down the mountain,
// together.

let section = window.document.getElementById('trajectory');

if (section) {
  // `armed` flips the path to its hidden start state — added via JS so the
  // no-JS baseline keeps the path fully drawn.
  section.classList.add('armed');

  let wipe = section.querySelector('.trajectory-wipe');
  let beacon = section.querySelector('.summit-beacon');

  if (wipe) {
    wipe.addEventListener('transitionend', (event) => {
      // only when the fill (scaleX 0 -> 1) completes, not the reverse collapse
      if (event.propertyName === 'transform' &&
          section.classList.contains('drawn')) {
        section.classList.add('signaling'); // starts the summit ring animations
      }
    });
  }

  // Mirror every ring onset to a canvas sweep so the two stay frame-synced:
  // the big ::before ring drives a full sweep, each soft ::after ring (its
  // first start and every loop after) drives a subtler one. Using the CSS
  // animation as the clock keeps them from drifting apart.
  if (beacon) {
    let sweepFor = (event) => {
      let name = event.animationName;
      if (event.pseudoElement === '::before' || name === 'summit-pulse-big') {
        glInterface.exec('signal', 1.0);   // big pulse -> full sweep
      } else if (event.pseudoElement === '::after' ||
                 name === 'summit-pulse-soft') {
        glInterface.exec('signal', 0.45);  // soft pulse -> subtle sweep
      }
    };
    beacon.addEventListener('animationstart', sweepFor);
    beacon.addEventListener('animationiteration', sweepFor);
  }

  let observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        section.classList.add('drawn');
      } else {
        section.classList.remove('drawn', 'signaling');
      }
    });
  }, { threshold: 0.3 });

  observer.observe(section);
}
