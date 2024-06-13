import { MAIN_LOOP_MS } from "../constants.js";
import mainLoop from "../main-loop.js";
import { Scrambler } from "./scrambleUtility.js";

const SHUFFLE_ITERATIONS = 50;
const DELAYED_ITERATIONS = 8;
const TRANSITION_ITERATIONS = SHUFFLE_ITERATIONS - DELAYED_ITERATIONS;
const TRANSITION_TIME = MAIN_LOOP_MS * SHUFFLE_ITERATIONS / 1000 + 's';

function LocaleScramble(){
  this.targetLocaleId = 0;
  this.targetLocale = LOCALIZED_TARGETS[this.targetLocaleId];

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

  this.setElemText = (e, i) => {
    const hash = e.getAttribute("data-localize-text");
    e.innerHTML = this.getLocString(hash, this.targetLocale);
  }

  this.shuffleElemText = (e, i) => {    const hash = e.getAttribute("data-localize-text");

    Scrambler.shuffleElem(
      e, this.getLocString(hash, this.targetLocale), hash, this.iteration,
      this.baseCharCounts[i], this.targetCharCounts[i],
      DELAYED_ITERATIONS, TRANSITION_ITERATIONS);
  }

  this.setElemAria = (e) => {
    const hash = e.getAttribute("data-localize-aria");
    e.setAttribute("aria-label", this.getLocString(hash, this.targetLocale));
  }

  this.setElemContent = (e) => {
    const hash = e.getAttribute("data-localize-content");
    e.setAttribute("content", this.getLocString(hash, this.targetLocale));
  }

  this.freezeParams = (index) => {
    return [this.baseHeights[index],
            this.baseWidths[index],
            this.targetLineCounts[index]]
  }

  this.thawParams = (index) => {
    return [this.targetHeights[index], this.targetWidths[index], TRANSITION_TIME]
  }

  this.freezeElem = (elem, index) => {
    Scrambler.freezeElem(elem, ...this.freezeParams(index));
  }

  this.thawElem = (elem, index) => {
    Scrambler.thawElem(elem, ...this.thawParams(index));
  }

  this.unfreezeElem = (elem) => {
    Scrambler.unfreezeElem(elem);
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
    this.baseLocale = LOCALIZED_TARGETS[this.targetLocaleId];
    this.targetLocaleId = (this.targetLocaleId + 1) % LOCALIZED_TARGETS.length;
    this.targetLocale = LOCALIZED_TARGETS[this.targetLocaleId];
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
