import mainLoop from "../main-loop.js";

const MIN_DURATION = 200;
const MAX_DURATION = 1250;

function LocaleScramble(){
  this.targetLocaleId = 0;
  this.targetLocale = LOCALIZED_TARGETS[this.targetLocaleId];

  this.localizedElementsText =
    window.document.querySelectorAll("[data-localize-text]");
  this.localizedElementsAria =
    window.document.querySelectorAll("[data-localize-aria]");
  this.localizedElementsContent =
    window.document.querySelectorAll("[data-localize-content]");

  let insertLocaleSwitcher = () => {
    const container = document.createElement('ul');
    container.id = 'locale-switch';
    document.querySelector('.addons-container').appendChild(container);

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

  const getLocString = (hash, locale) => {
    return LOCALIZED_STRINGS[`${hash}:${locale}`] || "";
  }

  const baseStringFN = (e, _i) => {
    const hash = e.getAttribute("data-localize-text");
    return getLocString(hash, this.baseLocale);
  }

  const targetStringFN = (e, _i) => {
    const hash = e.getAttribute("data-localize-text");
    return getLocString(hash, this.targetLocale);
  }

  this.setElemAria = (e) => {
    const hash = e.getAttribute("data-localize-aria");
    e.setAttribute("aria-label", getLocString(hash, this.targetLocale));
  }

  this.setElemContent = (e) => {
    const hash = e.getAttribute("data-localize-content");
    e.setAttribute("content", getLocString(hash, this.targetLocale));
  }

  this.applyLocale = () => {
    mainLoop.singleScramble.clearSequences();
    mainLoop.singleScramble.sequence(
      [...this.localizedElementsText], MIN_DURATION, MAX_DURATION,
      baseStringFN, targetStringFN, true);

  }
  insertLocaleSwitcher();
}

export default LocaleScramble;
