let aboutElem = document.getElementById('about');
let images = document.querySelectorAll('.img-box');
let titles = document.getElementById('about-titles');


let minY, maxY, mark = 0;

let resize = () => {
  minY = document.body.clientHeight/2;
  maxY = document.body.clientHeight;
  mark = aboutElem.getBoundingClientRect().top + aboutElem.clientHeight/2;
  computeAbout();
}
let scroll = () => {
  mark = aboutElem.getBoundingClientRect().top + aboutElem.clientHeight/2;
  computeAbout();
}
let computeAbout = () => {
  let progress = Math.max(Math.min(mark, maxY), minY);
  progress = (progress - minY) / minY;

  let oEnds = 5;
  let opacity = Math.min(oEnds/10, 1-progress) / oEnds * 10;
  let margin = progress *16 -7;
  images[0].style.opacity = opacity;
  images[0].style.marginRight = margin + '%';
  images[1].style.opacity = opacity;
  images[1].style.marginLeft = margin + '%';

  titles.style.opacity = progress == 0 ? 1 : 0;
  console.log(progress);
}
resize();
window.addEventListener('scroll', scroll);
window.addEventListener('resize', resize);
