function fade(t) {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function lerp(t, a, b) {
  return a + t * (b - a);
}

function grad(hash, x, y) {
  const h = hash & 15;
  const u = h < 8 ? x : y;
  const v = h < 4 ? y : h === 12 || h === 14 ? x : 0;
  return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
}

function seededRandom(seed) {
  let x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

const globalSeed = Date.now();

function generatePermutation(seed) {
  const p = [];
  for (let i = 0; i < 256; i++) {
    p[i] = i;
  }

  for (let i = 255; i > 0; i--) {
    const j = Math.floor(seededRandom(seed + i) * (i + 1));
    [p[i], p[j]] = [p[j], p[i]];
  }

  return p.concat(p);
}

function perlin(x, y, frequency = 1, amplitude = 1) {
  x *= frequency;
  y *= frequency;

  const X = Math.floor(x) & 255;
  const Y = Math.floor(y) & 255;

  const xf = x - Math.floor(x);
  const yf = y - Math.floor(y);

  const u = fade(xf);
  const v = fade(yf);

  const permutation = generatePermutation(globalSeed);
  const p = [...permutation, ...permutation];

  const aa = p[p[X] + Y];
  const ab = p[p[X] + Y + 1];
  const ba = p[p[X + 1] + Y];
  const bb = p[p[X + 1] + Y + 1];

  const x1 = lerp(u, grad(aa, xf, yf), grad(ba, xf - 1, yf));
  const x2 = lerp(u, grad(ab, xf, yf - 1), grad(bb, xf - 1, yf - 1));
  const result = lerp(v, x1, x2);

  return result * amplitude;
}

export default perlin;
