import './nav.scss';

import glInterface from '../../js/gl-interface';
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

    let setScene = function(sceneName, speed) {
      if (glInterface){
        glInterface.exec('setScene', {
          name: sceneName,
          speed: speed
        });
      }
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
    [...linkElems].forEach((n) => {
      n.addEventListener('mouseover', onNavHrefHover);
      n.addEventListener('click', onNavHrefClick);
    });
  }
}

let nav = new Navigation();

export default nav
