import {easeOut, haste, remap, HSLStr} from '../utils'

let aboutElem = document.getElementById('about');
let images = document.querySelectorAll('.img-box');
let titles = document.getElementById('about-titles');

let progress = 0; // 0 ≤ progress ≤ 1
let delay = 0;

let updating = false;

let colorStr = (progress, hue) => {
  let cStr = "sepia(" + (100 - progress * 100) + "%) saturate(100%) brightness(100%) hue-rotate("+hue+"deg)";
  return cStr;
}

let computeProgress = () => {
  progress = Math.min(1, Math.max(0, progress));

  let margin = remap(easeOut(progress), 9, -7);
  let opacity = haste(progress, 0.5);

  images[0].style.opacity = opacity;
  images[0].style.marginRight = margin + '%';
  images[0].children[0].style.filter = colorStr(progress, 320);

  images[1].style.opacity = opacity;
  images[1].style.marginLeft = margin + '%';
  images[1].children[0].style.filter = colorStr(progress, 90);

  titles.style.opacity = Math.floor(progress);
  updating = false
}

let resized = () => {
  delay = Math.max(0, (window.innerHeight - aboutElem.clientHeight) / window.innerHeight);
  scrolled();
}

let scrolled = () => {
  progress = 1 - (images[0].getBoundingClientRect().bottom - window.innerHeight) / images[0].clientHeight - delay;
  if (!updating){
    requestAnimationFrame(computeProgress);
    updating = true;
  }
}

window.addEventListener('load', () => {
  resized();
  window.addEventListener('scroll', scrolled);
  window.addEventListener('resize', resized);
});
