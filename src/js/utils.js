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


export { easeOut, easeIn, easeInOut, haste, delay, remap, HSLStr,
         identityMatrix, perspectiveMatrix, matrixTranslate, matrixRotate }
