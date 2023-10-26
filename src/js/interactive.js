// ----------------------------
// Selection Color
// ----------------------------
let selectColorToggle = false;
let applySelectColor = (event) => {
  let clr = HSLStr(selectColorToggle ? accent2 : accent1);
  document.documentElement.style.setProperty('--select-background', clr);
}
let selectionChanged = () => {
  if (window.getSelection().toString() != ''){
    selectColorToggle = !selectColorToggle
    document.removeEventListener('selectionchange', selectionChanged);
  }
}
document.addEventListener('selectstart', (event) => {
  applySelectColor();
  document.addEventListener('selectionchange', selectionChanged);
});
applySelectColor();

// ----------------------------
// Link Color
// ----------------------------
let linkColorToggle = false;
let applyLinkColor = (event) => {
  let clr = HSLStr(linkColorToggle ? accent2 : accent1);
  document.documentElement.style.setProperty('--link-background', clr);
}
let linkHovered = () => {
  linkColorToggle = !linkColorToggle;
  applyLinkColor();
}
let links = document.getElementsByTagName('a');
[...links].forEach((l) => {
  l.addEventListener('mouseover', linkHovered);
});
linkHovered();

document.documentElement.style.setProperty('--highlight-color', 'white');
