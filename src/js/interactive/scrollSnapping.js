import { easeOut } from '../utils';

import createScrollSnap from 'scroll-snap'

function ScrollSnapping(sections){
  this.sections = sections;

  const AUTO_SCROLL_DURATION = 350; // how long the scroll smoothing lasts
  const AUTO_SCROLL_INSTANT = 0.25; // how much scrolling is to be applied instantly

  const stickDiff = window.innerHeight / 10;
  const snapDiff = window.innerHeight / 3.33;

  let autoScrollStartAt;

  let transitionFromY = 0;
  let transitionToY = 0;
  let transitionDiffY = 0;

  let snapping = false;

  this.active = false;
  this.hooksOn = (eventType) => { return eventType == 'wheel' }

  // Event listener for mouse wheel scrolling
  this.onEvent = (event) => {
    event.preventDefault();

    let newNow = performance.now();
    const stuntedScroll = event.deltaY * AUTO_SCROLL_INSTANT;

    let targetY = window.scrollY + event.deltaY

    // leftover from previous wheel events
    if (this.active &&
        Math.sign(event.deltaY) == Math.sign(transitionDiffY)){
      targetY += transitionToY - window.scrollY;
    } else {
      transitionToY = 0;
    }
    transitionToY = targetY;

    const currdiff = Math.abs(window.scrollY - targetY);

    let snapEligible = false;

    this.sections.forEach((section) => {
      const targetDiff = Math.abs(targetY - section.elem.offsetTop);
      const currentDiff = Math.abs(window.scrollY - section.elem.offsetTop);

      if ((targetDiff < stickDiff) ||
          (targetDiff < snapDiff &&
           currentDiff > snapDiff) ||
          (snapping && targetDiff < snapDiff)){
        snapEligible = section.elem.offsetTop;
      }
    });


    let proceedUserTakeOver = () => {
      snapping = false;
      proceedUserEvent();
    }

    let proceedUserEvent = () => {

      autoScrollStartAt = newNow;
      transitionFromY = window.scrollY + stuntedScroll;
      transitionDiffY = targetY - transitionFromY;

      window.scrollBy(0, stuntedScroll);
    }

    let proceedSnappingUpdate = () =>{
      // snap target changed
      targetY = snapEligible;
      console.log('we snapping', transitionToY);

      autoScrollStartAt = newNow;
      transitionFromY = window.scrollY + stuntedScroll;
      transitionDiffY = targetY - transitionFromY;

      window.scrollBy(0, stuntedScroll);
      proceedSnapping();
    }

    let proceedSnapping = () => {
      targetY = snapEligible;
      snapping = true;

      autoScrollStartAt = newNow;
      transitionFromY = window.scrollY;
      transitionDiffY = targetY - transitionFromY;
    }

    if (snapping){
      if (snapEligible === false){
        proceedUserTakeOver();
      } else {
        if (snapEligible !== false &&
            snapEligible != transitionToY){
          proceedSnappingUpdate();
        }
      }
    } else {
      if (snapEligible !== false &&
          snapEligible != window.scrollY){
        proceedSnapping();
      } else {
        proceedUserEvent();
      }
    }

    this.active = true;
  }

  this.tick = () => {
    const elapsedTime = performance.now() - autoScrollStartAt;
    const transitionProgress = Math.min(1, elapsedTime / AUTO_SCROLL_DURATION);

    if (transitionProgress == 1) {
      transitionDiffY = 0;
      this.active = false;
      snapping = false;
      return;
    }
    const targetDistance = easeOut(transitionProgress, 2) * transitionDiffY;
    const alreadyApplied =  window.scrollY - transitionFromY;

    window.scrollBy(0, targetDistance - alreadyApplied);
  }
}

export default ScrollSnapping;
