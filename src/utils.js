function easeOut(x) {
  return Math.sqrt(1 - (x - 1) * (x - 1));
}
function easeIn(x) {
  return Math.sqrt(1 - (x = x - 1) * x);
}
function easeInOut(x, steepness){
  let p = steepness || 2;
  let xp = Math.pow(x,p);
  return xp / (xp  + Math.pow(1 - x, p));
}
function haste(x, amount){
  return Math.min(x, amount) * 1 / amount;
}
function delay(x, amount){
  return  (Math.max(x, amount) - amount) /amount;
}
function remap(val, minVal, maxVal){
  return (maxVal-minVal) * val + minVal;
}
function HSLStr(hlsArray){
  return `hsl(${hlsArray[0]}deg ${hlsArray[1]}% ${hlsArray[2]}%)`
}

export { easeOut, easeInOut, haste, delay, remap, HSLStr }
