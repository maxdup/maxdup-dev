function ScrollFloating(sections){

  this.sections = sections;
  this.sectionsOffset

  this.onScroll = () => {

    // TODO: magnetize

    for (let i = 0; i < this.sections.length; i++){

      if (!this.sections[i].floater){
        continue
      }

      let offset = 0;
      let top = this.sections[i].floater.getBoundingClientRect().top;
      let bottom = this.sections[i].floater.getBoundingClientRect().bottom;

      if (top > 0){
        offset = top / window.innerHeight;
      } else {
        offset = Math.min(0, (bottom - window.innerHeight) / window.innerHeight);
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
