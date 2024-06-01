import { sfc32,  easeInExpo } from "../utils.js";
import { MAIN_LOOP_MS } from "../constants.js";
import mainLoop from "../main-loop.js";

/*
Instant: [data-localize-content, data-localiza-aria, data-localize-phone]
Scramble: [data-localize-text]
*/

const ICON_SUN = 'mdi-bx-sun';
const ICON_MOON = 'mdi-bx-moon';
const SHUFFLE_ITERATIONS = 50;
const DELAYED_ITERATIONS = 8;
const TRANSITION_ITERATIONS = SHUFFLE_ITERATIONS - DELAYED_ITERATIONS;
const TRANSITION_TIME = MAIN_LOOP_MS * SHUFFLE_ITERATIONS / 1000 + 's';

const baseChars =
      "abcdefghijklmnopqrstuvwxyz1234567890-*[](){}/\\\"'?^%#@&!       ";
const baseCharsLength = baseChars.length;

function randomLetter(){
  return baseChars[Math.floor(Math.random() * baseCharsLength)];
}

function shuffleString(str, hash, iteration, baseCharCount, targetCharCount) {
  const seed = Number("0x"+hash);
  const rand = sfc32(seed[0], seed[1], seed[2], seed[3]);
  const shuffleProgress = (iteration / SHUFFLE_ITERATIONS);
  const transitionProgress = Math.max(
    0, iteration - DELAYED_ITERATIONS) / TRANSITION_ITERATIONS;
  const currentCharCount = baseCharCount + Math.ceil(
    transitionProgress * (targetCharCount - baseCharCount));
  const MaskedCharCount = Math.ceil(
    currentCharCount * (0.85 + (0.15 * transitionProgress)));

  str = str || "";
  str = str.padEnd(MaskedCharCount).substring(0, MaskedCharCount);

  return Array.from(str.split(""), (letter, i) => {
    const earlyness = i / str.length;
    const offset = easeInExpo(rand());
    const progressThreshold = (earlyness * 0.65) + (offset * 0.35);
    return transitionProgress < progressThreshold ? randomLetter() : letter;
  }).join('');
}

function LocaleScramble(){
  this.targetId = 0;
  this.targetLocale = LOCALIZED_TARGETS[0];

  this.localizedElementsText =
    window.document.querySelectorAll("[data-localize-text]");
  this.localizedElementsAria =
    window.document.querySelectorAll("[data-localize-aria]");
  this.localizedElementsContent =
    window.document.querySelectorAll("[data-localize-content]");

  this.baseHeights = [];
  this.targetHeights = [];
  this.baseWidths = [];
  this.targetWidths = [];
  this.targetLineCounts = [];
  this.baseCharCounts = [];
  this.targetCharCounts = [];

  this.setElemText = (e) => {
    const hash = e.getAttribute("data-localize-text");
    e.innerHTML = this.getLocString(hash, this.targetLocale);
  }

  this.shuffleElemText = (e, i) => {
    const hash = e.getAttribute("data-localize-text");
    e.innerHTML = shuffleString(
      this.getLocString(hash, this.targetLocale), hash, this.iteration,
      this.baseCharCounts[i], this.targetCharCounts[i]);
  }

  this.setElemAria = (e) => {
    const hash = e.getAttribute("data-localize-aria");
    e.setAttribute("aria-label", this.getLocString(hash, this.targetLocale));
  }

  this.setElemContent = (e) => {
    const hash = e.getAttribute("data-localize-content");
    e.setAttribute("content", this.getLocString(hash, this.targetLocale));
  }

  this.loadHeights = () => {
    return Array.from(this.localizedElementsText).map((e) => e.clientHeight);
  }

  this.loadWidths = () => {
    return Array.from(this.localizedElementsText).map((e) => e.clientWidth);
  }

  this.loadLineHeights = () => {
    return Array.from(this.localizedElementsText).map((e) =>
      parseFloat(window.getComputedStyle(e).lineHeight.replace('px', ''))
    );
  }

  this.loadLineCounts = () => {
    return Array.from(this.lineHeights, (lh,i) => this.targetHeights[i] / lh);
  }

  this.loadCharCounts = (locale) => {
    return Array.from(this.localizedElementsText).map((e) => {
      const hash = e.getAttribute("data-localize-text");
      return this.getLocString(hash, locale).length;
    });
  }

  this.getLocString = (hash, locale) => {
    return LOCALIZED_STRINGS[`${hash}:${locale}`] || "";
  }

  this.freezeElem = (elem, index) => {
    elem.style.transition = null;
    elem.style.height = `${this.baseHeights[index]}px`;
    elem.style.width = `${this.baseWidths[index]}px`;
    if (this.targetLineCounts[index] < 2){
      elem.style.whiteSpace = "nowrap";
    }
  }

  this.thawElem = (elem, index) => {
    elem.style.transition =
      `height ${TRANSITION_TIME} ease-out, width ${TRANSITION_TIME} ease-out`;
    elem.style.height = `${this.targetHeights[index]}px`;
    elem.style.width = `${this.targetWidths[index]}px`;
  }

  this.unfreezeElem = (elem, index) => {
    elem.style.height = null;
    elem.style.width = null;
    elem.style.transition = null;
    elem.style.whiteSpace = null;
  }

  let insertLocaleSwitcher = () => {
    const container = document.createElement('ul');
    container.id = 'locale-switch';
    document.body.appendChild(container);

    const frBtn = document.createElement('button');
    frBtn.innerHTML = 'Fr';
    frBtn.setAttribute('aria-label', 'Locale selection');
    frBtn.addEventListener('click', () => this.setTargetLocale('fr-CA'));
    const frLi = document.createElement('li');
    frLi.appendChild(frBtn);
    container.appendChild(frLi);

    const enBtn = document.createElement('button');
    enBtn.innerHTML = 'En';
    enBtn.setAttribute('aria-label', 'Locale selection');
    enBtn.addEventListener('click', () => this.setTargetLocale('en-US'));
    const enLi = document.createElement('li');
    enLi.appendChild(enBtn);
    container.appendChild(enLi);
  }

  this.setTargetLocale = (locale) => {
    this.baseLocale = this.targetLocale;
    this.targetLocale = locale;
    this.applyLocale();

  }

  this.toggleLocale = () => {
    this.baseLocale = LOCALIZED_TARGETS[this.targetId];
    this.targetId = (this.targetId + 1) % LOCALIZED_TARGETS.length;
    this.targetLocale = LOCALIZED_TARGETS[this.targetId];
    this.applyLocale();
  }

  this.applyLocale = () => {
    this.active = true;
    this.iteration = 0;
    this.delayedIteration = 0;

    // cleanup
    this.localizedElementsText.forEach(this.unfreezeElem);

    requestAnimationFrame(() =>{
      // initial
      this.lineHeights = this.loadLineHeights();
      this.baseHeights = this.loadHeights();
      this.baseWidths = this.loadWidths();
      this.baseCharCounts = this.loadCharCounts(this.baseLocale);

      // target
      this.localizedElementsText.forEach(this.setElemText);

      this.targetHeights = this.loadHeights();
      this.targetWidths = this.loadWidths();
      this.targetLineCounts = this.loadLineCounts();
      this.targetCharCounts = this.loadCharCounts(this.targetLocale);

      // start sequence
      this.localizedElementsText.forEach(this.freezeElem);
      this.localizedElementsAria.forEach(this.setElemAria);
      this.localizedElementsContent.forEach(this.setElemContent);

      requestAnimationFrame(() =>{
        this.localizedElementsText.forEach(this.thawElem);
        mainLoop.kick();
      });
    });
  }

  this.tick = () => {
    this.iteration++;
    if (this.iteration <= SHUFFLE_ITERATIONS){
      if (this.iteration % 3 == 0) {
        this.delayedIteration = Math.max(
          0, this.iteration - DELAYED_ITERATIONS);
        this.localizedElementsText.forEach(this.shuffleElemText);
      }
    } else {
      this.active = false;
      this.iteration = 0;
      this.delayedIteration = 0;
      this.localizedElementsText.forEach(this.setElemText);
      this.localizedElementsText.forEach(this.unfreezeElem);
    }
  }

  insertLocaleSwitcher();
}

export default LocaleScramble;
