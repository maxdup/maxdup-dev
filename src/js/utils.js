export function clamp(x, min, max){
  return Math.min(max, Math.max(x, min));
}
export function linear(x){
  return clamp(x, 0, 1);
}
export function easeOutRound(x){
  x = clamp(x, 0, 1);
  return Math.sqrt(1 - (x - 1) * (x - 1));
}
export function easeInRound(x){
  x = clamp(x, 0, 1);
  return Math.sqrt(1- x * x) * -1 + 1;
}
export function easeInOutRound(x){
  if (x < 0.5){
    return easeInRound(x*2) * 0.5;
  } else {
    return easeOutRound((x-0.5) * 2) * 0.5 + 0.5;
  }
}
export function easeOutInRound(x){
  if (x < 0.5){
    return easeOutRound(x * 2) * 0.5;
  } else {
    return easeInRound((x - 0.5) * 2) * 0.5 + 0.5;
  }
}
export function easeOut(x, steepness) {
  x = clamp(x, 0, 1);
  let p = steepness || 3;
  return 1 - Math.pow(1 - x, p);}
export function easeIn(x, steepness) {
  x = clamp(x, 0, 1);
  let p = steepness || 3;
  return Math.pow(x, 3, p);
}
export function easeInOut(x, steepness){
  let p = steepness || 3;
  if (x < 0.5){
    return easeIn(x*2, p) * 0.5;
  } else {
    return easeOut((x-0.5) * 2, p) * 0.5 + 0.5;
  }
}
export function easeOutIn(x, steepness){
  let p = steepness || 3;
  if (x < 0.5){
    return easeOut(x * 2, p) * 0.5;
  } else {
    return easeIn((x - 0.5) * 2, p) * 0.5 + 0.5
  }
}
export function haste(x, amount){
  return Math.min(x, amount) * 1 / amount;
}
export function delay(x, amount){
  return  (Math.max(x, amount) - amount) /amount;
}
export function HSLStr(hlsArray){
  return `hsl(${hlsArray[0]}deg ${hlsArray[1]}% ${hlsArray[2]}%)`
}

export function smoothingFn(current, target, smoothingFactor){
  // Easing toward a target value over iterations
  let diff = (target - current) / smoothingFactor;
  if (Math.abs(diff) <= 0.000001) {
    return target;
  } else {
    return current + diff;
  }
}

export function deCasteljau(points, t) {
  if (points.length === 1) {
    return points[0];
  }

  const newPoints = [];
  for (let i = 0; i < points.length - 1; i++) {
    let point = [];
    for (let j = 0; j < points[i].length; j++){
      point.push((1 - t) * points[i][j] + t * points[i + 1][j]);
    }
    newPoints.push(point);
  }

  return deCasteljau(newPoints, t);
}

export function sphericalToCartesian(pitch, yaw, roll, distance) {
  // Convert angles from degrees to radians
  const pitchRad = (pitch * Math.PI) / 180;
  const yawRad = (yaw * Math.PI) / 180;
  const rollRad = (roll * Math.PI) / 180;

  // Calculate the x, y, and z coordinates
  const x = distance * Math.cos(yawRad) * Math.cos(pitchRad);
  const y = distance * Math.sin(rollRad) * distance * Math.sin(pitchRad);
  const z = distance * Math.sin(yawRad) * Math.cos(pitchRad);

  return { x, y, z };
}
