function clamp(x, min, max){
  return Math.min(max, Math.max(x, min));
}
function linear(x){
  return clamp(x, 0, 1);
}
function easeOutRound(x){
  x = clamp(x, 0, 1);
  return Math.sqrt(1 - (x - 1) * (x - 1));
}
function easeInRound(x){
  x = clamp(x, 0, 1);
  return Math.sqrt(1- x * x) * -1 + 1;
}
function easeInOutRound(x){
  if (x < 0.5){
    return easeInRound(x*2) * 0.5;
  } else {
    return easeOutRound((x-0.5) * 2) * 0.5 + 0.5;
  }
}
function easeOutInRound(x){
  if (x < 0.5){
    return easeOutRound(x * 2) * 0.5;
  } else {
    return easeInRound((x - 0.5) * 2) * 0.5 + 0.5;
  }
}
function easeOut(x, steepness) {
  x = clamp(x, 0, 1);
  let p = steepness || 3;
  return 1 - Math.pow(1 - x, p);}
function easeIn(x, steepness) {
  x = clamp(x, 0, 1);
  let p = steepness || 3;
  return Math.pow(x, 3, p);
}
function easeInOut(x, steepness){
  let p = steepness || 3;
  if (x < 0.5){
    return easeIn(x*2, p) * 0.5;
  } else {
    return easeOut((x-0.5) * 2, p) * 0.5 + 0.5;
  }
}
function easeOutIn(x, steepness){
  let p = steepness || 3;
  if (x < 0.5){
    return easeOut(x * 2, p) * 0.5;
  } else {
    return easeIn((x - 0.5) * 2, p) * 0.5 + 0.5
  }
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

let smoothingFn = (current, target, smoothingFactor) => {
  // Easing toward a target value over iterations
  let diff = (target - current) / smoothingFactor;
  if (Math.abs(diff) <= 0.000001) {
    return target;
  } else {
    return current + diff;
  }
}

function perspectiveMatrix(fovy, aspect, near, far){
  let p = new Array(16).fill(0);
  let f = 1.0 / Math.tan(fovy / 2);
  p[0] = f/aspect;
  p[5] = f;
  p[11] = -1;
  if (far != null && far !== Infinity) {
    let nf = 1 / (near - far);
    p[10] = (far + near) * nf;
    p[14] = 2 * far * near * nf;
  } else {
    p[10] = -1;
    p[14] = -2 * near;
  }
  return p;
}
function identityMatrix(length){
  let ident = new Array(Math.pow(length, 2)).fill(0);
  for (let i = 0; i < length; i++){
    ident[length*i + i] = 1;
  }
  return ident;
}
function matrixTranslate(mat, translation){
  let x = translation[0],
      y = translation[1],
      z = translation[2];
  for (let i = 0; i < 4; i++){
    mat[i+12] = mat[i] * x + mat[i+4] * y + mat[i+8] * z + mat[i+12];
  }
  return mat;
}
function matrixRotate(mat, rad, axis){
  let out = [...mat];
  let x = axis[0],
      y = axis[1],
      z = axis[2];
  let len = Math.hypot(x, y, z);
  if (len < 0.000001){ return; }
  len = 1 / len;

  x *= len;
  y *= len;
  z *= len;

  let s = Math.sin(rad);
  let c = Math.cos(rad);
  let t = 1 - c;

  let rot = new Array(9).fill(0);
  rot[0] = x * x * t + c;
  rot[1] = y * x * t + z * s;
  rot[2] = z * x * t - y * s;

  rot[3] = x * y * t - z * s;
  rot[4] = y * y * t + c;
  rot[5] = z * y * t + x * s;

  rot[6] = x * z * t + y * s;
  rot[7] = y * z * t - x * s;
  rot[8] = z * z * t + c;

  for (let i = 0; i < 3; i++){
    for (let j = 0; j < 4; j++){
      out[i*4 + j] =
        mat[j] * rot[i*3] +
        mat[4+j] * rot[1+i*3] +
        mat[8+j] * rot[2+i*3];
    }
  }
  return out;
}

let deCasteljau = (points, t) => {
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

function sphericalToCartesian(pitch, yaw, roll, distance) {
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


export { easeOut, easeIn, easeInOut, easeOutIn,
         easeOutRound, easeInRound, easeInOutRound, easeOutInRound,
         clamp, haste, delay, remap, HSLStr, smoothingFn,
         identityMatrix, perspectiveMatrix, matrixTranslate, matrixRotate,
         deCasteljau, sphericalToCartesian }
