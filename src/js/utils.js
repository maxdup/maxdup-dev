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
  return 1 - Math.pow(1 - x, p);
}

export function easeOutExpo(x) {
  return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
}

export function easeInExpo(x) {
  return x === 0 ? 0 : Math.pow(2, 10 * x - 10);
}

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

export function HSLAStr(hlsArray){
  return `hsla(${hlsArray[0]}deg, ${hlsArray[1]}%, ${hlsArray[2]}%, ${hlsArray[3]})`
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

export function sfc32(a, b, c, d) {
  return function() {
    a |= 0; b |= 0; c |= 0; d |= 0;
    let t = (a + b | 0) + d | 0;
    d = d + 1 | 0;
    a = b ^ b >>> 9;
    b = c + (c << 3) | 0;
    c = (c << 21 | c >>> 11);
    c = c + t | 0;
    return (t >>> 0) / 4294967296;
  }
}

export function cyrb128(str) {
    let h1 = 1779033703, h2 = 3144134277,
        h3 = 1013904242, h4 = 2773480762;
    for (let i = 0, k; i < str.length; i++) {
        k = str.charCodeAt(i);
        h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
        h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
        h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
        h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
    }
    h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
    h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
    h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
    h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
    h1 ^= (h2 ^ h3 ^ h4), h2 ^= h1, h3 ^= h1, h4 ^= h1;
    return [h1>>>0, h2>>>0, h3>>>0, h4>>>0];
}

export function mobileCheck() {
  let check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
}
