import { sfc32, easeOutRound, easeInRound, easeIn, easeOut, easeOutExpo, easeInExpo, delay } from "../utils";
import { MAIN_LOOP_MS } from "../constants";
/*
Instant: [data-localize-content, data-localiza-aria, data-localize-phone]
Scramble: [data-localize-text]
*/

const ICON_SUN = 'mdi-bx-sun';
const ICON_MOON = 'mdi-bx-moon';
const SHUFFLE_ITERATIONS = 25;
const TRANSITION_TIME = MAIN_LOOP_MS * SHUFFLE_ITERATIONS / 1000 + 's';

const baseChars = "abcdefghijklmnopqrstuvwxyz1234567890-*[](){}/\\\"'<>?^%#@&!       ";
const baseCharsLength = baseChars.length;

function randomLetter(){
  return baseChars[Math.floor(Math.random() * baseCharsLength)];
}

function shuffleString(str, hash, iteration) {
  const seed = Number("0x"+hash);
  const rand = sfc32(seed[0], seed[1], seed[2], seed[3]);

  str = str || "";

  var array = str.split('');
  var currentIndex = array.length;

  let threshs = [];
  for (let i = 0; i < array.length; i++){
    const earlyness = i / array.length;
    const offset = easeInExpo(rand());
    const threshold = (earlyness + offset) * SHUFFLE_ITERATIONS /2;


  if (threshold > iteration){
      array[i] = randomLetter();
    }
  }

  return array.join('');
}

function LocaleScramble(){
  this.targetId = 0;
  this.targetLocale = LOCALIZED_TARGETS[0];

  this.localizedElementsText = window.document.querySelectorAll("[data-localize-text]");
  this.localizedElementsAria = window.document.querySelectorAll("[data-localize-aria]");
  this.localizedElementsContent = window.document.querySelectorAll("[data-localize-content]");

  this.baseHeights = [];
  this.targetHeights = [];
  this.baseWidths = [];
  this.targetWidths = [];
  this.targetLineCounts = [];

  this.setElemText = (e) => {
    const hash = e.getAttribute("data-localize-text");
    e.innerHTML = LOCALIZED_STRINGS[`${hash}:${this.targetLocale}`];
  }

  this.shuffleElemText = (e, i) => {
    const hash = e.getAttribute("data-localize-text");
    e.innerHTML = shuffleString(LOCALIZED_STRINGS[`${hash}:${this.targetLocale}`], hash, this.iteration);
  }

  this.setElemAria = (e) => {
    const hash = e.getAttribute("data-localize-aria");
    e.setAttribute("aria-label", LOCALIZED_STRINGS[`${hash}:${this.targetLocale}`]);
  }

  this.setElemContent = (e) => {
    const hash = e.getAttribute("data-localize-content");
    e.setAttribute("content", LOCALIZED_STRINGS[`${hash}:${this.targetLocale}`]);
  }

  this.loadHeights = () => {
    return Array.from(this.localizedElementsText).map((e) => e.clientHeight);
  }

  this.loadWidths = () => {
    return Array.from(this.localizedElementsText).map((e) => e.clientWidth);
  }

  this.loadLineHeights = () => {
    return Array.from(this.localizedElementsText).map((e) => {
      return parseFloat(window.getComputedStyle(e).lineHeight.replace('px', ''));
    });
  }

  this.loadLineCounts = () => {
    Array.from(this.lineHeights, (lh,i) => {
      console.log(this.targetHeights[i], lh, this.targetHeights[i] / lh);
      return this.targetHeights[i] / lh})
    return Array.from(this.lineHeights, (lh,i) => this.targetHeights[i] / lh);
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
    elem.style.transition = `height ${TRANSITION_TIME} ease-in, width ${TRANSITION_TIME} ease-in`;
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
    const container = document.createElement('div');
    container.id = 'color-theme';
    document.body.appendChild(container);

    let button = document.createElement('button');
    button.classList.add('mdi', ICON_SUN);
    button.setAttribute('aria-label', 'Theme selection');
    button.addEventListener('click', this.toggle);
    container.appendChild(button);
  }

  this.toggle = () => {
    this.active = true;
    this.iteration = 0;
    this.targetId++;
    this.targetLocale = LOCALIZED_TARGETS[this.targetId % LOCALIZED_TARGETS.length];

    this.localizedElementsText.forEach(this.unfreezeElem);

    this.lineHeights = this.loadLineHeights();
    this.baseHeights = this.loadHeights();
    this.baseWidths = this.loadWidths();

    this.localizedElementsText.forEach(this.setElemText);

    this.targetHeights = this.loadHeights();
    this.targetWidths = this.loadWidths();
    this.targetLineCounts = this.loadLineCounts();

    this.localizedElementsText.forEach(this.freezeElem);
    this.localizedElementsAria.forEach(this.setElemAria);
    this.localizedElementsContent.forEach(this.setElemContent);

    requestAnimationFrame(() =>{
      this.localizedElementsText.forEach(this.thawElem);
    });
  }

  this.tick = () => {
    this.iteration++;
    if (this.iteration == SHUFFLE_ITERATIONS){
      this.active = false;
      this.localizedElementsText.forEach(this.setElemText);
      this.localizedElementsText.forEach(this.unfreezeElem);
    } else {
      this.localizedElementsText.forEach(this.shuffleElemText);
    }
  }

  insertLocaleSwitcher();
}

export default LocaleScramble;
