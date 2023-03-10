import Scrambler from 'scrambling-letters';
let glInterface = null;

const initialPosition = {
  x: 0, y: 0, z: 0, sigma2: 100 };
const initialPeakPosition = {
  x: 0, y: 0, z: -50, sigma2: 200 };
const postPeakPosition = {
  x: 0, y: 0, z: -40, sigma2: 200 };

let sequence = () => {
  const DELAY = 1000;

  Scrambler({
    target: '.stand-in .scramble-stage-1',
    random: [DELAY + 500, DELAY + 1000],
    speed: 75
  });
  Scrambler({
    target: '.stand-in .scramble-stage-2 i, .stand-in .scramble-stage-2 b',
    random: [DELAY + 500, DELAY + 2000],
    speed: 75
  });
  Scrambler({
    target: '.stand-in .scramble-stage-3',
    random: [DELAY + 3000, DELAY + 5000],
    speed: 75,
    afterAll: () => {
      document.querySelector(".stand-in").style.width = '100%';
    }
  });

  glInterface.supports3D && setTimeout(() => {
    glInterface.exec('setSheens', {
      respawn: false,
      sheens: [{ inactive: true,
                 angle: [0,1], },
               { inactive: true,
                 angle: [0,1], },
               { speed: 5 }]
    });
  }, DELAY / 2);

  setTimeout(() => {
    scramble1.style.opacity = 1;
    scramble1.style.transform = 'none';
    scramble1.style.animationName = 'abberation-main';
    scramble2.style.opacity = 1;
    scramble2.style.transform = 'none';
    scramble2.style.animationName = 'abberation-main';

    glInterface.supports3D && glInterface.exec('setPositions', initialPeakPosition);
  }, DELAY);

  setTimeout(() => {
    scramble3.style.opacity = 1;
    scramble3.style.transform = 'scale(1)';
    scramble3.style.animationName = 'abberation-main';

    glInterface.supports3D && glInterface.exec('setInertia', 0);

  }, DELAY + 3000);

  glInterface.supports3D && setTimeout(() => {
    glInterface.exec('setPositions', postPeakPosition);
  }, DELAY + 3100);

  glInterface.supports3D && setTimeout(() => {
    glInterface.exec('setSheens', {respawn: true});
  }, DELAY + 8000);

}

let scramble1, scramble2, scramble3;
function initTextScramble(){
  // funky stuff so the changing line length doesn't affect line alignement
  let content = document.querySelectorAll(".reserved-space")[0];
  let clonetent = content.cloneNode(true);
  content.style.opacity = 0;
  [scramble1, scramble2, scramble3] = [...clonetent.children];
  [...clonetent.children].forEach((sc) => {
    sc.style.opacity = 0;
    sc.style.transform = 'scale(1.4)';
  })
  clonetent.classList.add('stand-in');
  clonetent.setAttribute("aria-hidden", "true");
  document.getElementById("main-content").appendChild(clonetent);
}

let supports3D = true;
let run3D = function(bg){

  window.addEventListener('scroll', () => {
    let scrollProgress = document.documentElement.scrollTop /
        (document.documentElement.scrollHeight - document.documentElement.clientHeight);
    glInterface.exec('setProgress', scrollProgress)
  });

  window.addEventListener('resize', () => {
    glInterface.exec('setSize', {
      width: window.innerWidth,
      height: window.innerHeight
    });
  });

  document.body.classList.add('gl-enabled');
  glInterface.exec('setInertia', 0.005);
  glInterface.exec('setPositions', initialPosition);
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
  glInterface.exec('start');
}

let run2D = function(){
  // cleanup, remove the canvas
  let cs = document.getElementsByTagName('canvas');
  for (let i = 0; i < cs.length; i++){
    cs[i].parentNode.removeChild(cs[i]);
  }
}

initTextScramble();

window.addEventListener('load', async function() {

  glInterface = new GlInterface();
  window.glInterface = glInterface;

  let callback = () => {
    (glInterface.supports3D ? run3D : run2D)();
    sequence();
  }
  glInterface.loaded.then(callback, callback);
});

function GlInterface() {
  this.supports3D = false;
  this.supportsWorker = false;

  this.loaded = new Promise((resolve, reject) => {

    if (window.WebGLRenderingContext){
      const canvas = document.createElement("CANVAS");
      document.body.prepend(canvas);
      this.supports3D = true;

      try {
        const offscreenCanvas = canvas.transferControlToOffscreen();

        this.glWorker = new Worker(new URL('./background-worker.js', import.meta.url));
        this.glWorker.postMessage({msg: 'init', canvas: offscreenCanvas}, [offscreenCanvas]);
        this.supportsWorker = true;
        resolve();
      }
      catch(err) {
        let abort = () => {
          this.supports3D = false;
          this.supportsWorker = false;
          this.glWorker = null;
          reject();
        }
        if (err instanceof TypeError &&
            err.message.startsWith("canvas.transferControlToOffscreen is not a function")) {
          try {
            require.ensure(['./synchronous-worker.js'], (require) => {
              let SyncWorker = require('./synchronous-worker.js').default;
              this.supports3D = true;
              this.supportsWorker = false;
              this.glWorker = new SyncWorker();
              this.glWorker.init(canvas);
              resolve();
            });
          } catch (err) {
            console.error("Background doesn't work because:", err);
            abort();
          }
        } else {
          console.error("Background doesn't work because:", err);
          abort();
        }
      }
    }
  });

  this.exec = (fn, value) => {
    if (this.supportsWorker){
      this.glWorker.postMessage({msg: fn, value: value});
    } else {
      this.glWorker.exec(fn, value);
    }
  }

  return this;
}


function mobileCheck() {
  let check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};
