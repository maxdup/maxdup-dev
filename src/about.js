let aboutElem = document.getElementById('about');
let images = document.querySelectorAll('.img-box');
let titles = document.getElementById('about-titles');

let minY, maxY, mark, distTopToBot = 0;
let progress = 0; // 0 ≤ progress ≤ 1

let resized = () => {
  minY = document.documentElement.clientHeight/2;
  maxY = document.documentElement.clientHeight;
  scrolled();
}

let scrolled = () => {
  mark = aboutElem.getBoundingClientRect().top + aboutElem.clientHeight/2;
  distTopToBot = Math.floor(document.documentElement.getBoundingClientRect().bottom);
  computeProgress();
}

function easeOut(x) {
  return Math.sqrt(1 - (x = x - 1) * x);
}
function haste(x, amount){
  return Math.min(x, amount) * 1 / amount;
}
function delay(x, amount){
  return  (Math.max(x, amount) - amount) /amount;
}
function remap(val, minVal, maxVal){
  return (maxVal-minVal) * val + minVal;
}

const endHSL = [[0, 0, 0],
                [0, 0, 39],
                [0, 0, 70]];

const maxHSL = [[0, 0, 0],
                [200, 52, 25],
                [269, 100, 87]];

const jacHSL = [[0, 0, 0],
                [278, 25, 30],
                [0, 75, 60]];

let getColor = (progress, initHSL, targetHSL) => {
  let hsl = [remap(progress, initHSL[0], initHSL[0]),
             remap(progress, initHSL[1], targetHSL[1]),
             remap(progress, initHSL[2], targetHSL[2])];
  return `hsl(${hsl[0]}deg ${hsl[1]}% ${hsl[2]}%)`;
}

let computeProgress = () => {
  // progress toward about being in the middle of the screen
  let mProgress = Math.max(Math.min(mark, maxY), minY);
  mProgress = 1 - (mProgress - minY) / minY;
  // progress toward hitting the end of the page
  let eProgress = distTopToBot - Math.max(mark, maxY);
  eProgress =  1 - eProgress / (distTopToBot - mark);
  // whichever progress is ahead
  let progress = Math.min(Math.max(mProgress, eProgress), 1);


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
resized();
window.addEventListener('scroll', scrolled);
window.addEventListener('resize', resized);
