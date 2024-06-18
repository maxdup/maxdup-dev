import {
  NO_TRANSITION_SPEED,
  THEME_TRANSITION_SPEED,
  INTERACTIVE_TRANSITION_SPEED,
} from '../constants.js';
import store from "../store";
import glInterface from '../gl-interface.js';


const ICON_SUN = 'mdi-bx-sun';
const ICON_MOON = 'mdi-bx-moon';

function ThemeSelection(){
  this.timeout = null;

  const init = () => {
    this.lightMode = store.preferences.lightMode || false;
    insertThemeSwitcher();
    this.applyTheme(true);
  }

  let insertThemeSwitcher = () => {
    const container = document.createElement('div');
    container.id = 'color-theme';
    document.querySelector('.addons-container').appendChild(container);

    this.button = document.createElement('button');
    this.button.classList.add('mdi', ICON_SUN);
    this.button.setAttribute('aria-label', 'Theme selection');
    this.button.addEventListener('click', this.toggle);
    container.appendChild(this.button);

    this.backdrop = document.createElement('div');
    this.backdrop.id = "earths-curvature";
    document.body.append(this.backdrop);
  }

  this.toggle = () => {
    this.lightMode = !this.lightMode;
    store.savePreference("lightMode", this.lightMode);
    this.applyTheme();
  }

  this.applyTheme = (instant) => {
    if (this.lightMode) {
      this.button.classList.remove(ICON_SUN);
      this.button.classList.add(ICON_MOON);
      document.firstElementChild.classList.add('light-theme');
    } else {
      this.button.classList.remove(ICON_MOON);
      this.button.classList.add(ICON_SUN);
      document.firstElementChild.classList.remove('light-theme');
    }


    if (!instant){
      document.documentElement.style.setProperty(
        '--themed-transition-speed', THEME_TRANSITION_SPEED + 's');
      document.documentElement.style.setProperty(
        '--only-themed-transition-speed', THEME_TRANSITION_SPEED + 's');

      clearTimeout(this.timeout);

      this.timeout = setTimeout(() => {
        document.documentElement.style.setProperty(
          '--only-themed-transition-speed', NO_TRANSITION_SPEED + 's');
        document.documentElement.style.setProperty(
          '--themed-transition-speed', INTERACTIVE_TRANSITION_SPEED + 's');
        this.timeout = null;
      }, THEME_TRANSITION_SPEED * 1000);

      glInterface.exec('setSheens');
    }
  }

  init();
}

export default ThemeSelection;
