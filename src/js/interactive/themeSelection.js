const ICON_SUN = 'mdi-bx-sun';
const ICON_MOON = 'mdi-bx-moon';

const COLOR_TRANSITION_SPEED = 1.0;

function ThemeSelection(){
  this.darkMode = true;

  let init = () => {
    let container = document.createElement("div");
    container.id = "color-theme";
    document.body.appendChild(container);

    this.button = document.createElement("a");
    this.button.classList.add('mdi', ICON_SUN); // or mdi-moon
    this.button.addEventListener("click", this.toggle);
    container.appendChild(this.button);
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
  }

  init();
}
let themeSelection = new ThemeSelection();

export default themeSelection;
