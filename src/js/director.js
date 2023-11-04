import glInterface from './gl-interface';
import { deCasteljau } from './utils';

function Director(){

  this.sections = [];

  this.loadSections = (sections) => {
    this.sections = sections;
  }

  this.run3D = (bg) => {

    let targetProgress = 0;
    let currentProgress = 0;

    var styleElem = document.head.appendChild(document.createElement("style"));


    let targetPositionX = 0;
    let currentPositionX = 0;
    let targetPositionY = 0;
    let currentPositionY = 0;

    let currentSceneId = null;

    let camScrollSmoothing = false;
    let camMouseSmoothing = false;


    // Initialize
    document.body.classList.add('gl-enabled');
    glInterface.exec('setSize', {
      width: window.innerWidth,
      height: window.innerHeight
    });

    if (navigator.getBattery){
      navigator.getBattery().then(function(result) {
        if (!result.charging){
          glInterface.exec('setFPS', 30);
        }
      });
    }

    glInterface.exec('setFPS', mobileCheck() ? 30 : 60);

    // Progression system
    let progression = () => {
      let offsets = [];

      for (let i = 0; i < this.sections.length; i++){

        if (!this.sections[i].floater){
          offsets.push(-1);
          continue
        }

        let offset = 0;
        if (top > 0){
          let top = this.sections[i].floater.getBoundingClientRect().top;
          offset = top / window.innerHeight;
        } else {
          let bottom = this.sections[i].floater.getBoundingClientRect().bottom;
          offset = bottom / window.innerHeight - 1;
        }

        offsets.push(Math.min(1, Math.max(-1, offset)));

        if (this.sections[i].floating){
          this.sections[i].floating.style.top = (offset/-2*100) + "vh";
          this.sections[i].floating.style.opacity = 1.25 - Math.abs(offset);
        }
      }

      for (let i = 0; i < this.sections.length; i++){
        if (offsets[i] > 0){
          targetProgress = i - offsets[i];
          break;
        }
      }

      let targetSceneId = Math.floor(targetProgress + 0.5);

      if (currentSceneId != targetSceneId){
        currentSceneId = targetSceneId;
        glInterface.exec('setScene', {
          name: this.sections[currentSceneId].scene,
          speed: 0.5,
        });
      }
    }
    // Events
    window.addEventListener('scroll', () => {
      progression();
      if (!camScrollSmoothing && !camMouseSmoothing){
        setTimeout(camSmoothingFunction, 10);
      }
    });

    window.addEventListener('mousemove', (event) => {
      targetPositionX = event.x;
      targetPositionY = event.y;
      if (!camScrollSmoothing && !camMouseSmoothing){
        setTimeout(camSmoothingFunction, 10);
      }
    });

    window.addEventListener('resize', () => {
      glInterface.exec('setSize', {
        width: window.innerWidth,
        height: window.innerHeight
      });
    });

    // Background scroll smoothing
    let smoothing = (current, target, smoothingFactor) => {
      let diff = (target - current) / smoothingFactor;
      if (Math.abs(diff) <= 0.000001) {
        return target;
      } else {
        return current + diff;
      }
    }

    let setCamAngle = (from, to, progress) => {
      let camAngle = deCasteljau([from.cameraAngle, from.cameraAngleOut,
                                  to.cameraAngleIn, to.cameraAngle], progress);
      glInterface.exec('setCamAngle', { pitch: camAngle[0],
                                        yaw: camAngle[1],
                                        roll: camAngle[2]});
    }

    let camSmoothingFunction = () => {
      camScrollSmoothing = currentProgress != targetProgress;
      camMouseSmoothing = currentPositionX != targetPositionX ||
        currentPositionY != targetPositionY;

      if (camScrollSmoothing){
        currentProgress = smoothing(currentProgress, targetProgress, 10);
        let currentSectionId = Math.floor(currentProgress);

        let currentFromSection = this.sections[currentSectionId];
        let currentToSection = this.sections[currentSectionId + 1];

        setCamAngle(currentFromSection, currentToSection, currentProgress % 1);
      }

      if (camMouseSmoothing){

        currentPositionX = smoothing(currentPositionX, targetPositionX, 100);
        currentPositionY = smoothing(currentPositionY, targetPositionY, 100);

        let offx = currentPositionX / window.innerHeight * 2 -1;
        let offy = currentPositionY / window.innerWidth * 2 -1;

        glInterface.exec('setCamOffset', { yawOffset: offx,
                                           pitchOffset: offy });

        const percentRange = 10;
        let posx = offx * percentRange;
        let posy = offy * percentRange;

        styleElem.innerHTML = `body.gl-enabled:before {
          mask-position: ${posx}% ${posy}%;
          -webkit-mask-position: ${posx}% ${posy}%;
      }`
      }

      if (camScrollSmoothing || camMouseSmoothing){
        setTimeout(camSmoothingFunction, 10);
      }
    }
  }

  this.run2D = () => {
    // cleanup, remove the canvas
    let cs = document.getElementsByTagName('canvas');
    for (let i = 0; i < cs.length; i++){
      cs[i].parentNode.removeChild(cs[i]);
    }
  }
}

let director = new Director();

let callback = () => {
  (glInterface.supports3D ? director.run3D : director.run2D)();
}

glInterface.loaded.then(callback, callback);

export default director;

function mobileCheck() {
  let check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};
