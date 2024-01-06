import { HSLStr } from '../utils.js';

let accent1 = [146, 50, 72];
let accent2 = [0, 70, 78];

function MouseSelection(){

  this.active = false;
  this.hooksOn = (eventType) => { return false; }
  this.onEvent = () => {}
  this.tick = () => {}

  // ----------------------------
  // Selection Color
  // ----------------------------
  let selectColorToggle = false;
  let applySelectColor = (event) => {
    let clr = HSLStr(selectColorToggle ? accent2 : accent1);
    document.documentElement.style.setProperty('--select-background', clr);
  }
  let selectionChanged = () => {
    if (window.getSelection().toString() != ''){
      selectColorToggle = !selectColorToggle
      document.removeEventListener('selectionchange', selectionChanged);
    }
  }
  document.addEventListener('selectstart', (event) => {
    applySelectColor();
    document.addEventListener('selectionchange', selectionChanged);
  });
  applySelectColor();

  document.documentElement.style.setProperty('--highlight-color', 'black');
}

export default MouseSelection;
