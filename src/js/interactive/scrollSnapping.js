import { easeOut } from '../utils';

import createScrollSnap from 'scroll-snap'

function ScrollSnapping(sections){
  this.sections = sections;

  const transitionLength = 350;
  //const transitionLength = 2000;

  let autoScrollInstant = 0.25; // how much scrolling is to be applied instantly
  let autoScrollApplied = 0;
  let autoScrollTargetDistance = 0;

  let autoScrollStartAt;
  let autoScrollEndAt = autoScrollStartAt + transitionLength;
  let autoScrollProgress;

  this.active = false;
  this.hooksOn = (eventType) => { return eventType == 'wheel' }

  // Event listener for mouse wheel scrolling

  this.onEvent = (event) => {
    // scroll only half
    event.preventDefault();
    let stuntedScroll = event.deltaY * autoScrollInstant;
    window.scrollBy(0, stuntedScroll);

    autoScrollApplied = 0;
    autoScrollStartAt = performance.now();
    autoScrollEndAt = autoScrollStartAt + transitionLength;
    if (Math.sign(event.deltaY) != Math.sign(autoScrollTargetDistance)){
      autoScrollTargetDistance = 0;
    }
    autoScrollTargetDistance += event.deltaY - stuntedScroll;

    autoScrollProgress = 0;
    this.active = true;
  }

  this.tick = () => {
    const elapsedTime = performance.now() - autoScrollStartAt;

    autoScrollProgress = Math.min(1, elapsedTime / transitionLength);

    if (autoScrollProgress == 1) {
      autoScrollTargetDistance = 0;
      this.active = false;
      return;
    }

    const easedScrollProgress = easeOut(autoScrollProgress, 2);
    let targetDistance = autoScrollTargetDistance * easedScrollProgress;

    let applyDistance = targetDistance - autoScrollApplied;

    autoScrollApplied += applyDistance;
    window.scrollBy(0, applyDistance);
  }
}

export default ScrollSnapping;
