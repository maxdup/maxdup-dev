import glInterface from '../gl-interface';

const ICON_SUN = 'mdi-bx-sun';
const ICON_MOON = 'mdi-bx-moon';

const INTERACTIVE_TRANSITION_SPEED = 0.3;
const NO_TRANSITION_SPEED = 0.0;
const THEME_TRANSITION_SPEED = 1.0;

function ThemeSelection(){
  this.darkMode = true;
  this.timeout = null;

  let insertThemeSwitcher = () => {
    const container = document.createElement("div");
    container.id = "color-theme";
    document.body.appendChild(container);

    this.button = document.createElement("button");
    this.button.classList.add('mdi', ICON_SUN); // or mdi-moon
    this.button.setAttribute('aria-label', "Theme selection");
    this.button.addEventListener("click", this.toggle);
    container.appendChild(this.button);
  }

  let insertThemeBg = () => {
    const themeBg = document.createElement("div");
    themeBg.id = "color-theme-bg";
    document.body.appendChild(themeBg);
  }

  this.toggle = () => {
    this.darkMode = !this.darkMode;
    if (this.darkMode){
      this.button.classList.remove(ICON_MOON);
      this.button.classList.add(ICON_SUN);
      document.firstElementChild.classList.remove('light-theme');
    } else {
      this.button.classList.remove(ICON_SUN);
      this.button.classList.add(ICON_MOON);
      document.firstElementChild.classList.add('light-theme');
    }

    document.documentElement.style.setProperty("--themed-transition-speed", THEME_TRANSITION_SPEED + "s");
    document.documentElement.style.setProperty("--only-themed-transition-speed", THEME_TRANSITION_SPEED + "s");

    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      document.documentElement.style.setProperty("--only-themed-transition-speed", NO_TRANSITION_SPEED + "s");
      document.documentElement.style.setProperty("--themed-transition-speed", INTERACTIVE_TRANSITION_SPEED + "s");
      this.timeout = null;
    }, THEME_TRANSITION_SPEED * 1000)

    glInterface.exec('setSheens');
  }

  insertThemeSwitcher();
  insertThemeBg();
  document.documentElement.style.setProperty("--only-themed-transition-speed", NO_TRANSITION_SPEED + "s");
  document.documentElement.style.setProperty("--themed-transition-speed", INTERACTIVE_TRANSITION_SPEED + "s");
}

let themeSelection = new ThemeSelection();

export default themeSelection;