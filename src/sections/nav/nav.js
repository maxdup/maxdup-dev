import mainLoop from '../../js/main-loop';

function Navigation(){

  this.sections = [];

  this.loadSections = (sections) => {
    this.sections = sections;
    for (let i = 0; i < this.sections.length; i++){
      this.sections[i].elem = document.getElementById(this.sections[i].id);
    }

    let homeElem = document.getElementById('home');
    let navElem = document.getElementsByTagName('nav')[0];
    let linkElems = document.querySelectorAll('nav ul#nav-links a');
    let mainElem = document.getElementById('main');

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

    let onNavOut = function(){
      mainLoop.scrollSection.unlockScene();
    }
    let onNavHrefHover = function(e){
      mainLoop.scrollSection.lockScene(e.target.attributes.scene.value);
    }
    let onNavHrefClick = function(e){
      mainLoop.scrollSection.targetScene(e.target.attributes.scene.value);
      e.target.blur();
    }

    let afterScroll = function(){
      if (mainElem.getBoundingClientRect().bottom <= homeElem.clientHeight) {
        document.body.classList.add('nav-complete');
      } else {
        document.body.classList.remove('nav-complete');
      }
    }

    window.addEventListener('load', function() {
      window.addEventListener('scroll', () => {
        requestAnimationFrame(afterScroll);
      });
      afterScroll()
      onInit();
    });


    navElem.addEventListener('mouseout', onNavOut);
    homeElem.addEventListener('mouseout', onNavOut);

    [...linkElems, homeElem].forEach((elem) => {
      elem.addEventListener('mouseover', onNavHrefHover);
      elem.addEventListener('click', onNavHrefClick);
    });
  }
}

let nav = new Navigation();

export default nav
