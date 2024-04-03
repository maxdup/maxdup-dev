/*
Instant: [data-localize-content, data-localiza-aria, data-localize-phone]
Scramble: [data-localize-text]
*/

const ICON_SUN = 'mdi-bx-sun';
const ICON_MOON = 'mdi-bx-moon';

function LocaleScramble(){
  setTimeout(() =>{
    console.log('localScramble', LOCALIZED_STRINGS, LOCALIZED_TARGETS);
    this.targetId = 0;
    this.targetLocale = LOCALIZED_TARGETS[0];
    this.LocalizedElements = window.document.querySelectorAll("[data-localize-text]");
    console.log(this.LocalizedElements);
  }, 2000);


  let insertLocaleSwitcher = () => {
    const container = document.createElement('div');
    container.id = 'color-theme';
    document.body.appendChild(container);

    this.button = document.createElement('button');
    this.button.classList.add('mdi', ICON_SUN);
    this.button.setAttribute('aria-label', 'Theme selection');
    this.button.addEventListener('click', this.toggle);
    container.appendChild(this.button);
  }

  this.toggle = () => {
    this.targetId++;
    this.targetLocale = LOCALIZED_TARGETS[this.targetId % LOCALIZED_TARGETS.length]
    this.LocalizedElements.forEach((e) => {
      const hash = e.getAttribute("data-localize-text");
      e.innerHTML = LOCALIZED_STRINGS[`${hash}:${this.targetLocale}`]
    });
  }

  insertLocaleSwitcher();
}

export default LocaleScramble;

