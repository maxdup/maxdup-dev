import { sfc32,  easeInExpo } from "../utils.js";

const baseChars =
      "abcdefghijklmnopqrstuvwxyz1234567890-*[](){}/\\\"'?^%#@&!       ";
const baseCharsLength = baseChars.length;

function randomLetter(){
  return baseChars[Math.floor(Math.random() * baseCharsLength)];
}

export class Scrambler {
  static shuffleString = (str, hash, iteration, baseCharCount, targetCharCount, delayedIterations, transitionIterations) => {
    const seed = Number("0x"+hash);
    const rand = sfc32(seed[0], seed[1], seed[2], seed[3]);
    const transitionProgress = Math.max(
      0, iteration - delayedIterations) / transitionIterations;
    const currentCharCount = baseCharCount + Math.ceil(
      transitionProgress * (targetCharCount - baseCharCount));
    const MaskedCharCount = Math.ceil(
      currentCharCount * (0.85 + (0.15 * transitionProgress)));

    str = str || "";
    str = str.padEnd(MaskedCharCount).substring(0, MaskedCharCount);

    const newString = Array.from(str.split(""), (letter, i) => {
      const earlyness = i / str.length;
      const offset = easeInExpo(rand());
      const progressThreshold = (earlyness * 0.65) + (offset * 0.35);
      return transitionProgress < progressThreshold ? randomLetter() : letter;
    }).join('');
    return newString;
  }

  static freezeElem = (elem, baseHeight, baseWidth, targetLineCount) => {
    elem.style.transition = null;
    elem.style.height = baseHeight + 'px';
    elem.style.width = baseWidth + 'px';
    if (targetLineCount < 2){
      elem.style.whiteSpace = "nowrap";
    }
  }

  static thawElem = (elem, targetHeight, targetWidth, transitionTime, useTransition) => {

    if (useTransition){
      elem.style.transition =
        `height ${transitionTime} ease-out, width ${transitionTime} ease-out`;
    }

    elem.style.height = targetHeight + 'px';
    elem.style.width = targetWidth + 'px';
  }

  static unfreezeElem = (elem) => {
    elem.style.height = null;
    elem.style.width = null;
    elem.style.transition = null;
    elem.style.whiteSpace = null;
  }

  static shuffleElem = (elem, targetText, hash, iteration,
                        baseCharCount, targetCharCount,
                        delayedIterations, transitionIterations) => {

      elem.innerHTML = this.shuffleString(targetText, hash, iteration,
                                          baseCharCount, targetCharCount,
                                          delayedIterations, transitionIterations);
  }
}

export class ScrambleLoop {
}
