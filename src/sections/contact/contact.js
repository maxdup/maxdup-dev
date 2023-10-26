import './contact.scss';

let contactInit = false;
let secretE, secretP = null;

secretE = ['info', 'allorithmique', 'com'];
secretP = ['+1', '514', '546', '0054'];

let linkEmail = 'mailto:' + secretE[0] + '@' + secretE[1] + '.' + secretE[2];
let linkPhone = 'tel:+' + secretP.join(' ');

let safetyMetrics = 0;
let assesSafety = () => {
  safetyMetrics++;
  if (safetyMetrics >= 2){
    let phoneLink = document.getElementById('phone-link');
    phoneLink.setAttribute('href', linkPhone);
    phoneLink.setAttribute('pt1', secretP[0]);
    phoneLink.setAttribute('pt2', secretP[1]);
    phoneLink.setAttribute('pt3', secretP[2]);
    phoneLink.setAttribute('pt4', secretP[3]);
    let emailLink = document.getElementById('email-link');
    emailLink.setAttribute('href', linkEmail);
    emailLink.setAttribute('pt1', secretE[0]);
    emailLink.setAttribute('pt2', secretE[1]);
    emailLink.setAttribute('pt3', secretE[2]);
  }
}

let hasScrolled = (event) => {
  if (!event.isTrusted) { return }
  assesSafety();
  window.removeEventListener('scroll', hasScrolled);
}
window.addEventListener('scroll', hasScrolled);

let hasHovered = (event) => {
  if (!event.isTrusted) { return }
  assesSafety();
  window.removeEventListener('mouseover', hasHovered);
}
window.addEventListener('mouseover', hasHovered);

let hasTouched = (event) => {
  if (!event.isTrusted) { return }
  assesSafety();
  window.removeEventListener('touchstart', hasTouched);
}
window.addEventListener('touchstart', hasTouched);
