function easeOut(x) {
  return Math.sqrt(1 - (x = x - 1) * x);
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

export { easeOut, haste, delay, remap, HSLStr }
