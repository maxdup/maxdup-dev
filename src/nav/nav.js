let nav = document.getElementsByTagName('nav')[0];
let h1 = document.getElementsByTagName('h1')[0];
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
let onScroll = () => {
  if (main.getBoundingClientRect().bottom <= 1) {
    document.body.classList.add('nav-complete');
  } else {
    document.body.classList.remove('nav-complete');
  }
}
let onResize = () => {
  nav.style.maxWidth = window.innerWidth + 'px';
  h1.style.maxWidth = window.innerWidth + 'px';
}
window.addEventListener('resize', onResize);
window.addEventListener('scroll', onScroll);
onResize();
onScroll();
