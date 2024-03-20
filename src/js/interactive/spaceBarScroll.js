
function SpaceBarScroll(sections){
  this.sections = sections;

  this.hooksOn = (eventType) => { return eventType == 'keydown'}

  this.onEvent = (event) => {
    if (event.keyCode === 32){

      const targetSection = this.sections.find((s) => {
        return window.scrollY - s.elem.offsetTop < -1;
      });

      if (targetSection){
        event.preventDefault();
        document.querySelector('#' + targetSection.id).scrollIntoView({
          behavior: 'smooth'
        });
      }
    }
  }
}
export default SpaceBarScroll;
