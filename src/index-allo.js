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
  cameraOffsetIn: [-0.5, 0, -6],
  cameraOffset: [-0.5, 0, -6],
}, {
  id: 'about',
  scene: 'mountain',
  cameraAngleIn: [0.4,-0.8,0],
  cameraAngle: [0.3,-0.8,0],
  cameraOffsetIn: [-0.5, 0, -6],
  cameraOffset: [-0.5, 0, -6],
}, {
  id: 'services',
  scene: 'network',
  cameraAngleIn: [0.3,0,0],
  cameraAngle: [0.3,0.8,0],
  cameraOffsetIn: [-0.5, 0, -6],
  cameraOffset: [-0.5, 0, -6],
}, {
  id: 'contact',
  scene: 'montreal',
  cameraAngleIn: [0.6,-0.8,0],
  cameraAngle: [0.6,-0.3,0],
  cameraOffsetIn: [-0.5, 0, -6],
  cameraOffset: [-0.5, 0, -6],
}]

sections.forEach((c) => {
  c.floater = window.document.querySelector('#' + c.id);
  c.floating = window.document.querySelector('#' + c.id + ' .floating-container');
});

nav.init(sections);
director.loadSections(sections);
