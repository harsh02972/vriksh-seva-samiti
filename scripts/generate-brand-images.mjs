// Builds the share image and the favicons from public/logo.png.
//   node scripts/generate-brand-images.mjs
// Writes public/og-image.jpg (1200×630, logo on Samiti green) and, in src/app:
// favicon.ico (16/32/48), icon.png (512, rounded white tile), apple-icon.png (180, square).
import { writeFileSync } from "node:fs";
import sharp from "sharp";

// logo.png has a rounded mint frame (thicker on the right); cut it off.
const src = sharp("public/logo.png");
const { width: LW, height: LH } = await src.metadata();
const LOGO = await src.extract({ left: 12, top: 4, width: LW - 12 - 18, height: LH - 8 }).png().toBuffer();
const GREEN = "#1e5a2c";
const DARK = "#14401f";
const LEAF = "#7bb342";

// ---- Open Graph / Twitter image -------------------------------------------------
const W = 1200, H = 630, CARD = 420, CX = 90, CY = (H - CARD) / 2;
const bg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="100%" height="100%" fill="${GREEN}"/>
  <circle cx="1080" cy="60" r="230" fill="${DARK}" opacity="0.55"/>
  <circle cx="60" cy="640" r="190" fill="${DARK}" opacity="0.55"/>
  <rect x="${CX}" y="${CY}" width="${CARD}" height="${CARD}" rx="40" fill="#ffffff"/>
  <g font-family="Arial, Helvetica, sans-serif">
    <text x="590" y="268" font-size="62" font-weight="700" fill="#ffffff">Vriksh Seva Samiti</text>
    <text x="592" y="332" font-size="34" fill="#e3eed6">Sindi (Meghe), Wardha</text>
    <rect x="592" y="368" width="90" height="6" rx="3" fill="${LEAF}"/>
    <text x="592" y="430" font-size="36" font-weight="700" fill="#ffffff">Your Scrap Can Grow a Forest</text>
  </g>
</svg>`);
const logoSize = CARD - 60;
const logo = await sharp(LOGO).resize(logoSize, logoSize, { fit: "contain", background: "#ffffff" }).flatten({ background: "#ffffff" }).toBuffer();
await sharp(bg)
  .composite([{ input: logo, left: CX + 30, top: CY + 30 }])
  .jpeg({ quality: 88, mozjpeg: true })
  .toFile("public/og-image.jpg");

// ---- favicon.ico (PNG-in-ICO, 16/32/48) ------------------------------------------
const sizes = [16, 32, 48];
const pngs = await Promise.all(
  sizes.map((s) => sharp(LOGO).resize(s, s, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 1 } }).flatten({ background: "#ffffff" }).ensureAlpha().png().toBuffer()),
);
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(sizes.length, 4);
let offset = 6 + 16 * sizes.length;
const entries = pngs.map((png, i) => {
  const e = Buffer.alloc(16);
  e.writeUInt8(sizes[i] % 256, 0); e.writeUInt8(sizes[i] % 256, 1);
  e.writeUInt8(0, 2); e.writeUInt8(0, 3); e.writeUInt16LE(1, 4); e.writeUInt16LE(32, 6);
  e.writeUInt32LE(png.length, 8); e.writeUInt32LE(offset, 12);
  offset += png.length;
  return e;
});
writeFileSync("src/app/favicon.ico", Buffer.concat([header, ...entries, ...pngs]));
// ---- icon.png (browser tab / Android) and apple-icon.png (iOS home screen) --------
const tile = (size, radius) =>
  Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="100%" height="100%" rx="${radius}" fill="#ffffff"/></svg>`);
async function icon(size, radius, file) {
  const inner = Math.round(size * 0.86);
  const mark = await sharp(LOGO).resize(inner, inner, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } }).png().toBuffer();
  const pad = Math.round((size - inner) / 2);
  await sharp(tile(size, radius)).composite([{ input: mark, left: pad, top: pad }]).png().toFile(file);
}
await icon(512, 96, "src/app/icon.png");
await icon(180, 0, "src/app/apple-icon.png");

console.log("Wrote public/og-image.jpg and src/app/favicon.ico, icon.png, apple-icon.png");
