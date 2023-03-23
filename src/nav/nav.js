let home = document.getElementById('home');
let nav = document.getElementsByTagName('nav')[0];
let main = document.getElementById('main');

let about = document.getElementById('about');
let service = document.getElementById('services');
let contact = document.getElementById('contact');

let windowInnerWidth = null;
let windowInnerHalfHeight = null;

let scrolling, resizing = null;

let scrollScene = null;

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

let onNavOut = function(e){
  if (nav !== e.target) return;
  setScene(scrollScene, 0.3);
}

let onNavHover = function(e){
  setScene(e.target.attributes.scene.value, 0.3);
}

// On Scroll
let onScroll = function(){
  if (!scrolling) {
    requestAnimationFrame(afterScroll);
    scrolling = true;
  }
}

let setScene = function(sceneName, speed) {
  if (window.glInterface){
    window.glInterface.exec('setScene', {
      name: sceneName,
      speed: speed
    });
  }
}
let setScrollScene = function(sceneName) {
  if (scrollScene != sceneName){
    scrollScene = sceneName;
    setScene(sceneName, 0.75);
  }
}

let afterScroll = function(){
  if (main.getBoundingClientRect().bottom <= home.clientHeight) {
    document.body.classList.add('nav-complete');
  } else {
    document.body.classList.remove('nav-complete');
  }
  scrolling = false;

  if (contact.getBoundingClientRect().bottom > windowInnerHalfHeight){
    if (service.getBoundingClientRect().bottom > windowInnerHalfHeight){
      if (about.getBoundingClientRect().bottom > windowInnerHalfHeight){
        if (about.getBoundingClientRect().top < windowInnerHalfHeight){
          setScrollScene('about');
        } else {
          setScrollScene();
        }
      } else {
        setScrollScene('services');
      }
    } else {
      setScrollScene('contact');
    }
  }
}


// On Resize
let onResize = function(){
  windowInnerWidth = window.innerWidth;
  windowInnerHalfHeight = window.innerHeight / 2;
  if (!resizing) {
    requestAnimationFrame(afterResize);
    resizing = true
  }
}

let afterResize = function(){
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


nav.addEventListener('mouseout', onNavOut);
[...nav.children].forEach((n) => {
  n.addEventListener('mouseover', onNavHover);
});
