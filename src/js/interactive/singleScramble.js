import { MAIN_LOOP_MS } from "../constants.js";
import mainLoop from "../main-loop.js";
import { Scrambler } from "./scrambleUtility.js";

const DELAYED_ITERATIONS = 8;

function SingleScramble(){

  this.baseHeights = [];
  this.targetHeights = [];
  this.baseWidths = [];
  this.targetWidths = [];
  this.targetLineCounts = [];
  this.baseCharCounts = [];
  this.targetCharCounts = [];

  this.sequences = [];

  this.loadHeight = (sequence) => {
    return sequence.element.clientHeight;
  }

  this.loadWidth = (sequence) => {
    return sequence.element.clientWidth;
  }

  this.loadLineHeight = (sequence) => {
    return parseFloat(window.getComputedStyle(sequence.element).lineHeight.replace('px', ''))
  }

  this.loadLineCount = (sequence) => {
    return sequence.targetHeight / sequence.lineHeight;
  }

  this.loadCharCount = (textString) => {
    return textString.length;
  }

  this.getLocString = (sequence) => {
    return sequence.baseString;
  }

  this.setElemText = (sequence) => {
    sequence.element.innerHTML = sequence.targetString;
  }

  this.shuffleElemText = (sequence) => {
    Scrambler.shuffleElem(
      sequence.element, sequence.baseString, sequence.hash, sequence.currIteration,
      sequence.baseString.length, sequence.targetString.length,
      sequence.delayedIterations, sequence.transitionIterations);
  }

  this.freezeParams = (sequence) => {
    return [sequence.baseHeight,
            sequence.baseWidth,
            sequence.targetLineCount]
  }

  this.thawParams = (sequence) => {
    return [sequence.targetHeight, sequence.targetWidth, sequence.transitionTime];
  }

  this.freezeElem = (sequence) => {
    Scrambler.freezeElem(sequence.element, ...this.freezeParams(sequence));
  }

  this.thawElem = (sequence) => {
    Scrambler.thawElem(sequence.element, ...this.thawParams(this.sequence));
  }

  this.unfreezeElem = (sequence) => {
    Scrambler.unfreezeElem(sequence.element);
  }

  this.sequence = (element, delay, duration, targetString) => {

    const hash = element.getAttribute("data-localize-text");
    //const delayedIterations = delay / MAIN_LOOP_MS;
    const totalIterations = duration / MAIN_LOOP_MS;
    const delayedIterations = totalIterations / 2;
    const transitionIterations = totalIterations - delayedIterations;
    const transitionTime = MAIN_LOOP_MS * totalIterations / 1000 + 's';

    const sequence = {
      element,
      duration,
      baseString: element.innerHTML.trim(),
      targetString: targetString || element.innerHTML.trim(),
      currIteration: 0,
      totalIterations,
      hash,
      transitionTime,
      delayedIterations,
      transitionIterations,
    }

    this.sequences.push(sequence);

    this.unfreezeElem(sequence);

    requestAnimationFrame(() => {
      sequence.lineHeight = this.loadLineHeight(sequence);
      sequence.baseHeight = this.loadHeight(sequence);
      sequence.baseWidth = this.loadWidth(sequence);
      sequence.baseCharCount = this.loadCharCount(sequence.baseString);

      this.setElemText(sequence);

      sequence.targetHeight = this.loadHeight(sequence);
      sequence.targetWidth = this.loadWidth(sequence);
      sequence.targetCharCount = this.loadCharCount(sequence.targetString);
      sequence.targetLineCount = this.loadLineCount(sequence);

      this.freezeElem(sequence);

      requestAnimationFrame(() => {
        this.thawElem(sequence);

        if (!this.active) {
          this.active = true;
          mainLoop.kick();
        }
      });
    });
  }

  this.tick = () => {
    this.sequences.forEach((sequence) => {
      if (sequence.currIteration <= sequence.totalIterations) {
        sequence.currIteration++;
        if (sequence.currIteration % 3 == 0) {
          this.shuffleElemText(sequence);
        }
      } else {
        this.setElemText(sequence);
        this.unfreezeElem(sequence);
        delete this.sequences[this.sequences.indexOf(sequence)];

        if (this.sequences.length == 0) {
          this.active = false;
        }
      }
    });
  }
}

export default SingleScramble;
