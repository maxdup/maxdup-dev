let h1 = document.getElementsByTagName('h1')[0];
let nav = document.getElementsByTagName('nav')[0];
let main = document.getElementById('main');

document.body.classList.add('js-enabled');
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();

    document.querySelector(this.getAttribute('href')).scrollIntoView({
      behavior: 'smooth'
    });
  });
});
let onScroll = function(){
  if (main.getBoundingClientRect().bottom <= h1.clientHeight) {
    document.body.classList.add('nav-complete');
  } else {
    document.body.classList.remove('nav-complete');
  }
}
let onResize = function(){
  nav.style.maxWidth = window.innerWidth + 'px';
  h1.style.maxWidth = window.innerWidth + 'px';
}

window.addEventListener('load', function() {
  window.addEventListener('resize', onResize);
  window.addEventListener('scroll', onScroll);
  onResize();
  onScroll();
});
