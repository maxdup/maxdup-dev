import './style/index.scss';

import nav from './sections/nav/nav';

import glInterface from './js/gl-interface';
import director from './js/director';

import './sections/main/main';
import './sections/trajectory/trajectory';
import './sections/skills/skills';
import './sections/where/where';

let sections = [{
  id: 'main',
  scene: 'main',
  cameraAngleIn:  [0.6,  0.4, 0],
  cameraAngle:    [0.6,  0.4, 0],
  cameraOffsetIn: [-0.5, 0,  -6],
  cameraOffset:   [-0.5, 0,  -6],
}, {
  id: 'trajectory',
  scene: 'mountain',
  cameraAngleIn:  [0.4,  0.8, 0],
  cameraAngle:    [0.3,  0.8, 0],
  cameraOffsetIn: [-1.5, 0,  -6],
  cameraOffset:   [-1.5, 0,  -6],
}, {
  id: 'skills',
  scene: 'network',
  cameraAngleIn:  [0.3, 1.2, 0],
  cameraAngle:    [0.3, 1.2, 0],
  cameraOffsetIn: [1.5, 0,  -6],
  cameraOffset:   [1.5, 0,  -6],
}, {
  id: 'where',
  scene: 'montreal',
  cameraAngleIn:  [0.8, 0.3, 0],
  cameraAngle:    [0.8, 0.3, 0],
  cameraOffsetIn: [-3,  0,  -8],
  cameraOffset:   [-3,  0,  -8],
}]

sections.forEach((c) => {
  c.floater = window.document.querySelector('#' + c.id + ' .floater-container');
  c.floating = window.document.querySelector('#' + c.id + ' .floating-container');
});

nav.loadSections(sections);
director.loadSections(sections);
