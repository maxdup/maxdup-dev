import {easeOut, haste, remap, HSLStr} from '../utils'

let aboutElem = document.getElementById('about');
let images = document.querySelectorAll('.img-box');
let titles = document.getElementById('about-titles');

let progress = 0; // 0 ≤ progress ≤ 1
let delay = 0;

const endHSL = [[0, 0, 0],
                [0, 0, 39],
                [0, 0, 70]];

const maxHSL = [[0, 0, 0],
                [125, 20, 33],
                [200, 120, 100]];

const jacHSL = [[0, 0, 0],
                [365, 20, 27],
                [30, 120, 100]];

let getColor = (progress, initHSL, targetHSL) => {
  return HSLStr([remap(progress, initHSL[0], initHSL[0]),
                 remap(progress, initHSL[1], targetHSL[1]),
                 remap(progress, initHSL[2], targetHSL[2])]);
}

let computeProgress = () => {
  progress = 1 - (images[0].getBoundingClientRect().bottom - window.innerHeight + delay) / images[0].clientHeight;
  progress = Math.min(1, Math.max(0, progress));

  let margin = remap(easeOut(progress), 9, -7);
  let opacity = haste(progress, 0.5);

  images[0].style.opacity = opacity;
  images[0].style.marginRight = margin + '%';
  for (let i = 0; i < 3; i++){
    images[0].children[i].style.background = getColor(progress, jacHSL[i], endHSL[i]);
  }

  images[1].style.opacity = opacity;
  images[1].style.marginLeft = margin + '%';
  for (let i = 0; i < 3; i++){
    images[1].children[i].style.background = getColor(progress, maxHSL[i], endHSL[i]);
  }

  titles.style.opacity = Math.floor(progress);
}

let resized = () => {
  delay = 200 - (images[0].clientHeight / window.innerHeight) * 200;
  computeProgress();
}

let scrolled = () => {
  computeProgress();
}

resized();
window.addEventListener('scroll', scrolled);
window.addEventListener('resize', resized);
