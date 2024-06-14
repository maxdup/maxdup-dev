import glInterface from '../../js/gl-interface.js';
import mainLoop from '../../js/main-loop.js';

const initialPosition = {
  x: 0, y: 0, z: 0, sigma2: 100 };
const initialPeakPosition = {
  x: 0, y: 0, z: -50, sigma2: 200 };
const postPeakPosition = {
  x: 0, y: 0, z: -40, sigma2: 200 };


const DELAY = 2000;

let sequence = () => {
  if (glInterface.supports3D){
    glInterface.exec('setInertia', 0.005);
    glInterface.exec('setPositions', initialPosition);
    glInterface.exec('start');
  }

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

  mainLoop.singleScramble.sequence([scramble1], (DELAY+1500)*0.75, (DELAY+1500));
  mainLoop.singleScramble.sequence([scramble2], (DELAY+2000)*0.75, (DELAY+2000));
  mainLoop.singleScramble.sequence([scramble3], (DELAY+5000)*0.75, (DELAY+5000));

  setTimeout(() => {
    scramble1.style.opacity = 1;
    scramble1.style.transform = 'none';
    scramble1.style.animationName = 'aberration-text-large-anim';
  }, DELAY);

  setTimeout(() => {
    scramble2.style.opacity = 1;
    scramble2.style.transform = 'none';
    scramble2.style.animationName = 'aberration-text-large-anim';

    glInterface.supports3D && glInterface.exec(
      'setPositions', initialPeakPosition);
  }, DELAY);

  setTimeout(() => {
    scramble3.style.opacity = 1;
    scramble3.style.transform = 'scale(1)';
    scramble3.style.animationName = 'aberration-text-large-anim';

    glInterface.supports3D && glInterface.exec('setInertia', 0);

  }, DELAY + 3000);

  glInterface.supports3D && setTimeout(() => {
    glInterface.exec('setPositions', postPeakPosition);
  }, DELAY + 3100);

  glInterface.supports3D && setTimeout(() => {
    glInterface.exec('setSheens', {respawn: true});
  }, DELAY + 8000);
}

glInterface.loaded.then(sequence, sequence);

let scramble1, scramble2, scramble3;
function initTextScramble(){
  // funky stuff so the changing line length doesn't affect line alignement
  let content = [...document.querySelectorAll("[main-scramble-sequence]")];

  content.forEach((e) => e.style.opacity = "0");

  [scramble1, scramble2, scramble3] = content;
}

initTextScramble();
