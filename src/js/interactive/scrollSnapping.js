import { easeOut } from '../utils';

import createScrollSnap from 'scroll-snap'

function ScrollSnapping(sections){
  this.sections = sections;

  const AUTO_SCROLL_DURATION = 350; // how long the scroll smoothing lasts (ms)
  const AUTO_SCROLL_INSTANT = 0.25; // how much scrolling is to be applied instantly

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

    const stickyDiff = window.innerHeight / 8;
    const snappyDiff = window.innerHeight / 3.33;

    const now = performance.now();

    const wheelDirection = Math.sign(event.deltaY);
    const transitionDirection = Math.sign(transitionDiffY)

    const stuntedScrollY = event.deltaY * AUTO_SCROLL_INSTANT;
    let targetScrollY = window.scrollY + event.deltaY


    // leftover from previous wheel events
    if (this.active){
      if (wheelDirection == transitionDirection){
        targetScrollY += transitionToY - window.scrollY;
      }
    }
    transitionToY = targetScrollY;

    let snapTargetY = false;

    const what = [];
    this.sections.forEach((section) => {

      const targetDiff = Math.abs(targetScrollY - section.elem.offsetTop);
      const currentDiff = Math.abs(window.scrollY - section.elem.offsetTop );

      const snapDirection = Math.sign(section.elem.offsetTop - window.scrollY);

      // small range that snaps back to current panel
      const stickyValid = targetDiff < stickyDiff;

      // large range that snaps to upcoming panels
      const snappyValid = snapDirection == wheelDirection &&
            targetDiff < snappyDiff;

      if (snappyValid || stickyValid){
        snapTargetY = section.elem.offsetTop;
      }
    });

    let initTransition = (from, to) => {
      autoScrollStartAt = now;
      transitionFromY = from;
      transitionDiffY = to - transitionFromY;
    }
    let proceedUserTakeOver = () => {
      // snap release to user
      snapping = false;
      initTransition(window.scrollY + stuntedScrollY, targetScrollY);
      window.scrollBy(0, stuntedScrollY);
    }

    let proceedUserEvent = () => {
      // no snap
      initTransition(window.scrollY + stuntedScrollY, targetScrollY);
      window.scrollBy(0, stuntedScrollY);
    }

    let proceedSnappingUpdate = () =>{
      // snap target changed
      snapping = true;
      targetScrollY = snapTargetY;
      initTransition(window.scrollY + stuntedScrollY, targetScrollY);
      window.scrollBy(0, stuntedScrollY);
    }

    let proceedSnapping = () => {
      // new snap
      snapping = true;
      targetScrollY = snapTargetY;
      initTransition(window.scrollY, targetScrollY);
    }

    if (snapping){
      if (snapTargetY === false){
        proceedUserTakeOver();
      } else {
        if (snapTargetY !== false &&
            snapTargetY != transitionToY){
          proceedSnappingUpdate();
        }
      }
    } else {
      if (snapTargetY !== false &&
          snapTargetY != window.scrollY){
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
