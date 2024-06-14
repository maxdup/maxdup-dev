import { MAIN_LOOP_MS } from "../constants.js";
import mainLoop from "../main-loop.js";
import { Scrambler } from "./scrambleUtility.js";

function SingleScramble(){

  this.sequences = [];

  const setTargetText = (s/*equence*/, i) => {
    s.elements[i].innerHTML = s.targetStrings[i];
  }

  const setShuffleText = (s/*equence*/, i) => {
    Scrambler.shuffleElem(
      s.elements[i], s.targetStrings[i], s.hashes[i], s.meta.currIteration,
      s.baseStrings[i].length, s.targetStrings[i].length,
      s.meta.delayedIterations, s.meta.transitionIterations);
  }

  const freezeElem = (s/*equence*/, i) => {
    Scrambler.freezeElem(
      s.elements[i], s.baseHeights[i], s.baseWidths[i], s.targetLineCounts[i]);
  }

  const thawElem = (s/*equence*/, i) => {
    Scrambler.thawElem(
      s.elements[i], s.targetHeights[i], s.targetWidths[i], s.meta.transitionTime);
  }

  const unfreezeElem = (s/*equence*/, i) => {
    Scrambler.unfreezeElem(s.elements[i]);
  }

  let makeSequence = (elements, minDuration, maxDuration, baseStringFN, targetStringFN) => {
    baseStringFN = baseStringFN || ((e, _i) => e.innerHTML.trim());
    targetStringFN = targetStringFN || ((e, _i) => e.innerHTML.trim());
    const totalIterations = maxDuration / MAIN_LOOP_MS;
    const delayedIterations = minDuration / MAIN_LOOP_MS;
    const transitionIterations = totalIterations - delayedIterations;
    const transitionTime = MAIN_LOOP_MS * totalIterations / 1000 + 's';

    return {
      length: elements.length,
      elements: elements,
      meta: { currIteration: 0, totalIterations, delayedIterations,
              transitionIterations, transitionTime },
      baseStrings: elements.map(baseStringFN),
      targetStrings: elements.map(targetStringFN),
      hashes: elements.map(e => e.getAttribute("data-localize-text")),
    }
  }

  const loadSequenceBase = (s/*equence*/) => {
    s.baseHeights = s.elements.map((e) => e.clientHeight);
    s.baseWidths = s.elements.map((e) => e.clientWidth);
    s.lineHeights = s.elements.map((e) =>
      parseFloat(window.getComputedStyle(e).lineHeight.replace('px', '')));
  }

  const loadSequenceTarget = (s/*equence*/) => {
    s.targetHeights = s.elements.map((e) => e.clientHeight);
    s.targetWidths = s.elements.map((e) => e.clientWidth);
    s.targetLineCounts = s.elements.map((_e, i) => s.targetHeights[i] / s.lineHeights[i]);
  }

  this.sequence = (elements, minDuration, maxDuration, baseStringFN, targetStringFN) => {

    const sequence = makeSequence(
      elements, minDuration, maxDuration, baseStringFN, targetStringFN);
    this.sequences.push(sequence);
    sequence.elements.forEach((_e, i) => unfreezeElem(sequence, i));
    requestAnimationFrame(() => {
      loadSequenceBase(sequence);
      sequence.elements.forEach((_e, i) => setTargetText(sequence, i));
      loadSequenceTarget(sequence);
      sequence.elements.forEach((_e, i) => freezeElem(sequence, i));

      requestAnimationFrame(() => {
        sequence.elements.forEach((_e, i) => thawElem(sequence, i));

        if (!this.active) {
          this.active = true;
          mainLoop.kick();
        }
      });
    });
  }

  this.tick = () => {
    this.sequences.forEach((sequence) => {
      if (sequence.meta.currIteration <= sequence.meta.totalIterations) {
        sequence.meta.currIteration++;
        if (sequence.meta.currIteration % 3 == 0) {
          sequence.elements.forEach((_e, i) => setShuffleText(sequence, i));
        }
      } else {
        sequence.elements.forEach((_e, i) => setTargetText(sequence, i));
        sequence.elements.forEach((_e, i) => unfreezeElem(sequence, i));
        delete this.sequences[this.sequences.indexOf(sequence)];

        if (this.sequences.length == 0) {
          this.active = false;
        }
      }
    });
  }
}

export default SingleScramble;
