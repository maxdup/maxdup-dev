import './nav.scss';
function Navigation(){

  this.sections = [];

  this.init = (sections) => {
    this.sections = sections;
    for (let i = 0; i < this.sections.length; i++){
      this.sections[i].elem = document.getElementById(this.sections[i].id);
    }

    let homeElem = document.getElementById('home');
    let navElem = document.getElementsByTagName('nav')[0];
    let linkElems = document.querySelectorAll('nav ul a');
    let mainElem = document.getElementById('main');

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
      if (navElem !== e.target) return;
      setScene(scrollScene, 0.3);
    }

    let onNavHrefHover = function(e){
      setScene(e.target.attributes.scene.value, 0.3);
    }
    let onNavHrefClick = function(e){
      e.target.blur();
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
      if (mainElem.getBoundingClientRect().bottom <= homeElem.clientHeight) {
        document.body.classList.add('nav-complete');
      } else {
        document.body.classList.remove('nav-complete');
      }
      scrolling = false;
      let scrollTarget = null;
      for (let i = 0; i < sections.length; i++){
        if (sections[i].elem.getBoundingClientRect().bottom > windowInnerHalfHeight){
          scrollTarget = sections[i].scene;
          break;
        }
      }
      setScrollScene(scrollTarget);
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


    navElem.addEventListener('mouseout', onNavOut);
    [...linkElems].forEach((n) => {
      n.addEventListener('mouseover', onNavHrefHover);
      n.addEventListener('click', onNavHrefClick);
    });
  }
}

let nav = new Navigation();

export default nav
