import './trajectory.scss';

let lines = window.document.querySelectorAll('.graph-node-line')

function graphRotate(){
  lines.forEach((l) => {
    let angle = Math.atan(l.clientWidth / l.clientHeight) * 180 / Math.PI;
    l.style.setProperty('--line-angle', 'rotate(' + angle + 'deg)');
  });
}

window.addEventListener('resize', graphRotate);
graphRotate();



