/*
Instant: [data-localize-content, data-localiza-aria, data-localize-phone]
Scramble: [data-localize-text]
*/

const ICON_SUN = 'mdi-bx-sun';
const ICON_MOON = 'mdi-bx-moon';

function shuffleString(str) {
  str = str || "";
  var array = str.split('');
  var currentIndex = array.length, temporaryValue, randomIndex;

  while (0 !== currentIndex) {

    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array.join('');
}

function LocaleScramble(){
  this.targetId = 0;
  this.targetLocale = LOCALIZED_TARGETS[0];

  this.LocalizedElementsText = window.document.querySelectorAll("[data-localize-text]");
  this.LocalizedElementsAria = window.document.querySelectorAll("[data-localize-aria]");
  this.LocalizedElementsContent = window.document.querySelectorAll("[data-localize-content]");

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
    this.countdown = 50;
    this.targetId++;
    this.targetLocale = LOCALIZED_TARGETS[this.targetId % LOCALIZED_TARGETS.length]
    this.LocalizedElementsText.forEach((e) => {
      const hash = e.getAttribute("data-localize-text");
      e.innerHTML = LOCALIZED_STRINGS[`${hash}:${this.targetLocale}`];
    });
    this.LocalizedElementsAria.forEach((e) => {
      const hash = e.getAttribute("data-localize-aria");
      e.setAttribute("aria-label", LOCALIZED_STRINGS[`${hash}:${this.targetLocale}`]);
    });
    this.LocalizedElementsContent.forEach((e) => {
      const hash = e.getAttribute("data-localize-content");
      e.setAttribute("content", LOCALIZED_STRINGS[`${hash}:${this.targetLocale}`]);
    });
  }

  this.tick = () => {
    this.countdown--;
    if (this.countdown == 0){
      this.active = false;
      this.LocalizedElementsText.forEach((e) => {
        const hash = e.getAttribute("data-localize-text");
        e.innerHTML = LOCALIZED_STRINGS[`${hash}:${this.targetLocale}`];
      });
    } else {
      this.LocalizedElementsText.forEach((e) => {
        const hash = e.getAttribute("data-localize-text");
        e.innerHTML = shuffleString(LOCALIZED_STRINGS[`${hash}:${this.targetLocale}`]);
      });
    }
  }

  insertLocaleSwitcher();
}

export default LocaleScramble;
