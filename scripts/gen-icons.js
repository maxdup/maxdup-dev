// Generates the minimal PWA icon set into deploy/ from the SVG sources in
// src/images/. These outputs are gitignored and (re)built automatically as a
// prebuild step; run `node scripts/gen-icons.js` to regenerate by hand.
// Pure JS toolchain (sharp + png-to-ico) so no system ImageMagick is required.
const sharp = require("sharp");
const pngToIco = require("png-to-ico").default;
const fs = require("fs");
const path = require("path");

const SRC = path.join(__dirname, "..", "src", "images");
const OUT = path.join(__dirname, "..", "deploy");
const markSvg = path.join(SRC, "icon.svg"); // light mark, transparent
const maskSvg = path.join(SRC, "icon-maskable.svg"); // baked dark bg + padded mark

// Render the light mark centered on an opaque #000 tile with `pad` margin.
async function tileBuffer(size, pad) {
  const inner = Math.round(size * (1 - 2 * pad));
  const margin = Math.round((size - inner) / 2);
  const mark = await sharp(markSvg, { density: 512 })
    .resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background: "#000" } })
    .composite([{ input: mark, top: margin, left: margin }])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

async function tile(out, size, pad) {
  fs.writeFileSync(path.join(OUT, out), await tileBuffer(size, pad));
}

async function generateIcons() {
  await tile("apple-touch-icon.png", 180, 0.1);
  await tile("icon-192.png", 192, 0.1);
  await tile("icon-512.png", 512, 0.1);

  // Maskable: source already has the dark bg + safe-zone padding baked in.
  await sharp(maskSvg, { density: 512 })
    .resize(512, 512)
    .png({ compressionLevel: 9 })
    .toFile(path.join(OUT, "icon-maskable-512.png"));

  // favicon.ico: multi-res (16/32/48) universal fallback, encoded in pure JS.
  const icoSizes = await Promise.all([16, 32, 48].map((s) => tileBuffer(s, 0.06)));
  fs.writeFileSync(path.join(OUT, "favicon.ico"), await pngToIco(icoSizes));
}

module.exports = generateIcons;

if (require.main === module) {
  generateIcons()
    .then(() => console.log("icons generated in deploy/"))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
