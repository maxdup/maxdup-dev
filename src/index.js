import './style/index.scss';

import nav from './sections/nav/nav';

import './sections/main/main';
import './sections/trajectory/trajectory';
import './sections/skills/skills';
import './sections/where/where';

nav.init([{ id: 'main',
            scene: 'main' },
          { id: 'trajectory',
            scene: 'mountain' },
          { id: 'skills',
            scene: 'network' },
          { id: 'where',
            scene: 'montreal' }]);

let containers = window.document.querySelectorAll('.container');
let floaters = [];

containers.forEach((c) => {
  let floater = c.querySelector('.floating-container');
  if (floater){
    floaters.push({
      container: c,
      floater: floater
    });
  }
});

window.addEventListener('scroll', () => {
  floaters.forEach((f) => {
    let top = f.container.getBoundingClientRect().top;
    let offset = 0;
    if (top > 0){
      offset = Math.min(top, window.innerHeight) / window.innerHeight;
    } else {
      offset = Math.max(-1, (1-(top + window.innerHeight) / window.innerHeight) * -1);
    }
    f.floater.style.top = (offset/-2*100) + "vh";
    f.floater.style.opacity = 1.25 - Math.abs(offset);
  });
});


