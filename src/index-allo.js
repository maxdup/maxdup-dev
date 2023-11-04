import './style/index-allo.scss';

import nav from './sections/nav/nav';

import glInterface from './js/gl-interface';
import director from './js/director';

import './sections/main/main';
import './sections/about/about';
import './sections/services/services';
import './sections/contact/contact';

let sections = [{
  id: 'main',
  scene: 'main',
  cameraAngleIn: [0.6,0.4,0],
  cameraAngle: [0.6,0.4,0],
}, {
  id: 'about',
  scene: 'mountain',
  cameraAngleIn: [0.4,-0.8,0],
  cameraAngle: [0.3,-0.8,0]
}, {
  id: 'services',
  scene: 'network',
  cameraAngleIn: [0.3,0,0],
  cameraAngle: [0.3,0.8,0]
}, {
  id: 'contact',
  scene: 'montreal',
  cameraAngleIn: [0.6,-0.8,0],
  cameraAngle: [0.6,-0.3,0]
}]

sections.forEach((c) => {
  c.floater = window.document.querySelector('#' + c.id);
  c.floating = window.document.querySelector('#' + c.id + ' .floating-container');

  c.cameraAngleOut = [];
  for (let i = 0; i < c.cameraAngle.length; i++){
    c.cameraAngleOut.push(c.cameraAngle[i] + (c.cameraAngle[i] - c.cameraAngleIn[i]));
  }
});

nav.init(sections);
director.loadSections(sections);
