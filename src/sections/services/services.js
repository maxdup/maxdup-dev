import './services.scss';

import {remap} from "../../js/utils";

let services = document.querySelectorAll('#services .img-bg');
let progress = new Array(services.length);
let updating = false;

let computeProgress = () => {
  services.forEach((s, i) => {
    let distmid = 0;
    if (progress[i] >= 0.5){
      distmid = Math.max(0.5, progress[i] - 0.20);
    } else {
      distmid = Math.min(0.5, progress[i] + 0.20);
    }

    let distX = Math.abs(remap(distmid, -5, 5));
    let distY = remap(distmid, -15, 15);

    s.style.bottom = remap(distmid, 40, -40) + 'px';
    s.style.right = -Math.abs(remap(distmid, 40, -40)) + 'px';
    s.style.filter = `drop-shadow(${distX}px ${distY}px 0px #ff2222)
                      drop-shadow(${distX}px ${distY/2}px 0px #22ff22)`;
  });

  updating = false;
}

let scrolled = () => {
  services.forEach((s, i) => {
    let rect = s.getBoundingClientRect();
    progress[i] = rect.top / (window.innerHeight - rect.height);
  });

  if (!updating){
    requestAnimationFrame(computeProgress);
    updating = true;
  }
}

window.addEventListener('load', () => {
  scrolled();
  window.addEventListener('scroll', scrolled);
  window.addEventListener('resize', scrolled);
});
