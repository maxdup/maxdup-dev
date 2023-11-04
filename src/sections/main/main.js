import './main.scss';

import glInterface from '../../js/gl-interface';

import Scrambler from 'scrambling-letters';

const initialPosition = {
  x: 0, y: 0, z: 0, sigma2: 100 };
const initialPeakPosition = {
  x: 0, y: 0, z: -50, sigma2: 200 };
const postPeakPosition = {
  x: 0, y: 0, z: -40, sigma2: 200 };

let sequence = () => {
  if (glInterface.supports3D){
    glInterface.exec('setInertia', 0.005);
    glInterface.exec('setPositions', initialPosition);
    glInterface.exec('start');
  }

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

glInterface.loaded.then(sequence, sequence);

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

initTextScramble();
