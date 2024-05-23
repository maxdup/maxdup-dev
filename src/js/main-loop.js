import glInterface from './gl-interface.js';
import { ENABLE_3D, MAIN_LOOP_MS } from './constants.js';
import { mobileCheck } from './utils.js';

import ScrollSections from './interactive/scrollSections.js';
import ScrollFloating from './interactive/scrollFloating.js';
import ScrollSnapping from './interactive/scrollSnapping.js';
import SpaceBarScroll from './interactive/spaceBarScroll.js';
import MouseMoveNudge from './interactive/mouseMoveNudge.js';
import MouseSelection from './interactive/mouseSelection.js';
import ThemeSelection from './interactive/themeSelection.js';
import LocaleScramble from './interactive/localeScramble.js';

function MainLoop(){

  this.sections = [];
  this.interactibles = [];

  this.register = (interactible) => {
    this.interactibles.push(interactible);
  }

  this.active = () => {
    for (let i = 0; i < this.interactibles.length; i++) {
      if (this.interactibles[i].active) { return true }
    }
    return false;
  }

  this.onEvent = (event) => {
    this.interactibles.forEach((interactible) => {
      if (interactible.hooksOn?.(event.type)){
        interactible.onEvent(event);
      }
    });
    this.updateTicking();
  }

  this.kick = () => {
    this.updateTicking();
  };

  this.tick = () => {
    this.interactibles.forEach((interactible) => {
      interactible.active && interactible.tick();
    });
    this.updateTicking();
  }

  this.updateTicking = () => {
    const active = this.active();
    if (active && !this.interval){
      this.interval = setInterval(this.tick.bind(this), MAIN_LOOP_MS);
    } else if (!active && this.interval){
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  this.loadSections = (sections) => {
    sections.forEach((c) => {
      c.cameraAngleOut = [];
      c.cameraOffsetOut = [];
      for (let i = 0; i < c.cameraAngle.length; i++){
        c.cameraAngleOut.push(
          c.cameraAngle[i] + (c.cameraAngle[i] - c.cameraAngleIn[i]));
        c.cameraOffsetOut.push(
          c.cameraOffset[i] + (c.cameraOffset[i] - c.cameraOffsetIn[i]));
      }
    });
    this.sections = sections;
  }

  this.run3D = () => {
    this.scrollSections = new ScrollSections(this.sections);

    // Events
    this.bindEvents();
    let onResize = () => {
      glInterface.exec('setSize', {
        width: window.innerWidth,
        height: window.innerHeight
      });
    }
    window.addEventListener('resize', onResize);

    // Initialize 3D
    document.body.classList.add('gl-enabled');
    onResize();
    this.tick();

    if (navigator.getBattery){
      navigator.getBattery().then(function(result) {
        if (!result.charging){
          glInterface.exec('setFPS', 30);
        }
      });
    }
    glInterface.exec('setFPS', mobileCheck() ? 30 : 60);
  }

  this.run2D = () => {
    // Events
    this.bindEvents();

    // cleanup, remove the canvas
    let cs = document.getElementsByTagName('canvas');
    for (let i = 0; i < cs.length; i++){
      cs[i].parentNode.removeChild(cs[i]);
    }
    document.body.classList.remove('gl-enabled');

    this.tick();
  }

  this.bindEvents = () => {
    if (this.bound) { return; }
    this.register(new MouseMoveNudge());
    this.register(new MouseSelection());
    this.register(new ScrollSnapping(this.sections));
    this.register(new ScrollFloating(this.sections));
    this.register(new SpaceBarScroll(this.sections));
    this.register(new ThemeSelection());
    this.register(new LocaleScramble());
    if (this.scrollSections) {
      this.register(this.scrollSections);
    }
    window.addEventListener(
      'wheel', this.onEvent.bind(this), {passive: false});
    window.addEventListener(
      'scroll', this.onEvent.bind(this));
    window.addEventListener(
      'mousemove', this.onEvent.bind(this));
    window.addEventListener(
      'keydown', this.onEvent.bind(this));
    this.bound = true;
  }
}

let mainLoop = new MainLoop();


let callback = () => {
  (glInterface.supports3D && ENABLE_3D ? mainLoop.run3D : mainLoop.run2D)();
}

glInterface.loaded.then(callback, callback);
glInterface.setFallback(mainLoop.run2D);

export default mainLoop;
