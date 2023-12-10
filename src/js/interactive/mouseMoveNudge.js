import glInterface from '../gl-interface';
import { deCasteljau, smoothingFn } from '../utils';

function MouseMoveNudge(){
  this.currentX = 0;
  this.currentY = 0;

  this._targetX = 0;
  this._targetY = 0;

  this.smoothing = false;

  let styleElem = document.head.appendChild(document.createElement("style"));

  this.onMove = (x, y) => {
    this._targetX = x;
    this._targetY = y;
    this._checkSmoothing();
  }

  this._checkSmoothing = () => {
    this.smoothing = (this._targetX != this.currentX) ||
      (this._targetY != this.currentY);
  }

  this.tick = () => {
    this.currentX = smoothingFn(this.currentX, this._targetX, 100);
    this.currentY = smoothingFn(this.currentY, this._targetY, 100);

    let camOffsetX = this.currentX / window.innerHeight * 2 -1;
    let camOffsetY = this.currentY / window.innerWidth * 2 -1;

    glInterface.exec('setCamOffset', { yawOffset: camOffsetX,
                                       pitchOffset: camOffsetY });

    const PERCENT_RANGE = 10;
    let bgOffsetX = camOffsetX * PERCENT_RANGE;
    let bgOffsetY = camOffsetY * PERCENT_RANGE;

    styleElem.innerHTML = `
        body:before {
            mask-position: ${bgOffsetX}% ${bgOffsetY}%;
            -webkit-mask-position: ${bgOffsetX}% ${bgOffsetY}%;
        }`
    this._checkSmoothing();
  }

  this.onMove(window.innerWidth / 2, window.innerHeight / 2);
  this.currentX = this._targetX;
  this.currentY = this._targetY;
}

export default MouseMoveNudge;
