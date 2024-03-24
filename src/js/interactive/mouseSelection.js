import { HSLStr } from '../utils.js';

import {
  ACCENT1,
  ACCENT2,
} from '../constants';

function MouseSelection(){

  this.active = false;
  this.hooksOn = () => { return false; }
  this.onEvent = () => {}
  this.tick = () => {}

  // ----------------------------
  // Selection Color
  // ----------------------------
  let selectColorToggle = false;
  let applySelectColor = () => {
    let clr = HSLStr(selectColorToggle ? ACCENT2 : ACCENT1);
    document.documentElement.style.setProperty('--select-background', clr);
  }
  let selectionChanged = () => {
    if (window.getSelection().toString() != ''){
      selectColorToggle = !selectColorToggle
      document.removeEventListener('selectionchange', selectionChanged);
    }
  }
  document.addEventListener('selectstart', () => {
    applySelectColor();
    document.addEventListener('selectionchange', selectionChanged);
  });
  applySelectColor();

  document.documentElement.style.setProperty('--select-color', 'black');
}

export default MouseSelection;
