let h1 = document.getElementsByTagName('h1')[0];
let nav = document.getElementsByTagName('nav')[0];
let main = document.getElementById('main');

let windowInnerWidth = null;
let navThreshold = null;

let scrolling, resizing = null;

let onInit = function(){
  document.body.classList.add('js-enabled');
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();

      document.querySelector(this.getAttribute('href')).scrollIntoView({
        behavior: 'smooth'
      });
    });
  });
}

// On Scroll
let onScroll = function(){
  navThreshold = main.getBoundingClientRect().bottom <= h1.clientHeight;
  if (!scrolling) {
    requestAnimationFrame(afterScroll);
    scrolling = true;
  }
}
let afterScroll = function(){
  if (navThreshold) {
    document.body.classList.add('nav-complete');
  } else {
    document.body.classList.remove('nav-complete');
  }
  scrolling = false;
}


// On Resize
let onResize = function(){
  windowInnerWidth = window.innerWidth;
  if (!resizing) {
    requestAnimationFrame(afterResize);
    resizing = true
  }
}

let afterResize = function(){
  nav.style.maxWidth = windowInnerWidth + 'px';
  h1.style.maxWidth = windowInnerWidth + 'px';
  resizing = false;
}

window.addEventListener('load', function() {
  window.addEventListener('resize', onResize);
  window.addEventListener('scroll', onScroll);
  onResize();
  afterResize();
  onScroll();
  afterScroll();
  onInit();
});
