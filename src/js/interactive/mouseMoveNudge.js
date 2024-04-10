import glInterface from '../gl-interface';
import { smoothingFn } from '../utils';
import { MAIN_LOOP_MS } from '../constants';

const SMOOTHING_FACTOR = 250 / MAIN_LOOP_MS;


function MouseMoveNudge(){
  this.currentX = 0;
  this.currentY = 0;

  this._targetX = 0;
  this._targetY = 0;

  this.active = false;
  this.hooksOn = (eventType) => { return eventType == 'mousemove' }

  let styleElem = document.head.appendChild(document.createElement("style"));

  styleElem.innerHTML = `
    body:before {
        mask-position: var(--bg-offset-x) var(--bg-offset-y);
        -webkit-mask-position: var(--bg-offset-x) var(--bg-offset-y);
    }`

  this.onEvent = (event) => {
    this._targetX = event.x;
    this._targetY = event.y;
    this._checkActive();
  }

  this._checkActive = () => {
    this.active = (this._targetX != this.currentX) ||
      (this._targetY != this.currentY);
  }

  this.tick = () => {
    this.currentX = smoothingFn(this.currentX, this._targetX, SMOOTHING_FACTOR);
    this.currentY = smoothingFn(this.currentY, this._targetY, SMOOTHING_FACTOR);

    // camOffset
    let camOffsetX = this.currentX / window.innerHeight * 2 -1;
    let camOffsetY = this.currentY / window.innerWidth * 2 -1;

    glInterface.exec('setCamOffset', { yawOffset: camOffsetX,
                                       pitchOffset: camOffsetY });

    // bgOffset
    const PERCENT_RANGE = 10;
    let bgOffsetX = camOffsetX * PERCENT_RANGE;
    let bgOffsetY = camOffsetY * PERCENT_RANGE;

    document.documentElement.style.setProperty(
      "--bg-offset-x", bgOffsetX + "%");
    document.documentElement.style.setProperty(
      "--bg-offset-y", bgOffsetY + "%");

    this._checkActive();
  }

  this.onEvent({x: window.innerWidth / 2,
                y: window.innerHeight / 2});
  this.currentX = this._targetX;
  this.currentY = this._targetY;
}

export default MouseMoveNudge;
