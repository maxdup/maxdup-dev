function ScrollFloating(sections){

  this.sections = sections;
  this.sectionsOffset

  let nav = document.getElementsByTagName('nav')[0];

  //let scrolling = window.body;
  let scrolling = document.body;

  this.onScroll = () => {

    // TODO: magnetize

    for (let i = 0; i < this.sections.length; i++){

      if (!this.sections[i].floater){
        continue
      }

      let offset = 0;
      let top = this.sections[i].floater.getBoundingClientRect().top - nav.clientHeight;
      let bottom = this.sections[i].floater.getBoundingClientRect().bottom;

      if (top > 0){
        offset = top / scrolling.innerHeight;
      } else {
        offset = Math.min(0, (bottom - scrolling.innerHeight) / scrolling.innerHeight);
      }

      if (this.sections[i].floating){
        this.sections[i].floating.style.top = (offset/-2*100) + "vh";
        this.sections[i].floating.style.opacity = 1 - Math.abs(offset);
      }
    }

  }
  this.onScroll();
}
export default ScrollFloating;
