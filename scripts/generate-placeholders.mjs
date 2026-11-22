// Generates clearly-marked PLACEHOLDER images for Phase 1.
// Run: node scripts/generate-placeholders.mjs
// Every image carries a "PLACEHOLDER" label so it can never be mistaken for a real photo.
// Replace the files in public/images/placeholders/ (or the paths in src/data/site.ts) with real photos.
import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const outDir = path.join(root, "public", "images", "placeholders");
mkdirSync(outDir, { recursive: true });

function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const palettes = [
  { sky1: "#CFE6F2", sky2: "#EEF6E4", hill: "#9CC56B", ground: "#6E9A3E", leaf: "#2F7D3A", leaf2: "#7BB342" },
  { sky1: "#FDE7B8", sky2: "#FFF6DF", hill: "#B5CF7A", ground: "#8A6B3F", leaf: "#1E5A2C", leaf2: "#5E9E3A" },
  { sky1: "#D8EBD0", sky2: "#F5F7EF", hill: "#7FB069", ground: "#5B7F3A", leaf: "#163F21", leaf2: "#7BB342" },
  { sky1: "#F7D9C4", sky2: "#FFF1E6", hill: "#A7C77C", ground: "#7A5A2E", leaf: "#2F6B3A", leaf2: "#8BC34A" },
];

function tree(x, baseY, size, leaf, leaf2) {
  const trunkH = size * 0.9;
  return `
    <rect x="${x - size * 0.07}" y="${baseY - trunkH}" width="${size * 0.14}" height="${trunkH}" rx="${size * 0.05}" fill="#6B4A2B"/>
    <circle cx="${x}" cy="${baseY - trunkH - size * 0.25}" r="${size * 0.55}" fill="${leaf}"/>
    <circle cx="${x - size * 0.35}" cy="${baseY - trunkH + size * 0.05}" r="${size * 0.38}" fill="${leaf2}"/>
    <circle cx="${x + size * 0.38}" cy="${baseY - trunkH + size * 0.02}" r="${size * 0.4}" fill="${leaf2}"/>`;
}

function sapling(x, baseY, s, leaf) {
  return `
    <path d="M${x} ${baseY} V${baseY - s}" stroke="#6B4A2B" stroke-width="${s * 0.08}" stroke-linecap="round"/>
    <path d="M${x} ${baseY - s * 0.7} C ${x - s * 0.6} ${baseY - s * 1.1}, ${x - s * 0.7} ${baseY - s * 0.5}, ${x} ${baseY - s * 0.55} Z" fill="${leaf}"/>
    <path d="M${x} ${baseY - s * 0.9} C ${x + s * 0.6} ${baseY - s * 1.3}, ${x + s * 0.7} ${baseY - s * 0.7}, ${x} ${baseY - s * 0.75} Z" fill="${leaf}"/>
    <ellipse cx="${x}" cy="${baseY + 4}" rx="${s * 0.45}" ry="${s * 0.1}" fill="#5A3E22" opacity="0.55"/>`;
}

function person(x, baseY, s, color) {
  return `
    <circle cx="${x}" cy="${baseY - s * 1.35}" r="${s * 0.22}" fill="#8D5A3B"/>
    <rect x="${x - s * 0.28}" y="${baseY - s * 1.1}" width="${s * 0.56}" height="${s * 0.75}" rx="${s * 0.2}" fill="${color}"/>
    <rect x="${x - s * 0.22}" y="${baseY - s * 0.4}" width="${s * 0.16}" height="${s * 0.4}" fill="#3A3A3A"/>
    <rect x="${x + s * 0.06}" y="${baseY - s * 0.4}" width="${s * 0.16}" height="${s * 0.4}" fill="#3A3A3A"/>`;
}

function bundles(x, baseY, s) {
  let out = "";
  const colors = ["#E8DCC2", "#D9C9A3", "#F1E8D2", "#CBB98F"];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3 - row; col++) {
      const bx = x + col * s * 1.05 + row * s * 0.52;
      const by = baseY - (row + 1) * s * 0.55;
      out += `<rect x="${bx}" y="${by}" width="${s}" height="${s * 0.5}" rx="6" fill="${colors[(row + col) % 4]}" stroke="#8A7650" stroke-width="3"/>
      <line x1="${bx + s / 2}" y1="${by}" x2="${bx + s / 2}" y2="${by + s * 0.5}" stroke="#8A7650" stroke-width="4"/>`;
    }
  }
  return out;
}

function school(x, baseY, s) {
  return `
    <rect x="${x}" y="${baseY - s}" width="${s * 1.8}" height="${s}" fill="#F3E3C3" stroke="#B88D52" stroke-width="4"/>
    <polygon points="${x - 20},${baseY - s} ${x + s * 0.9},${baseY - s * 1.55} ${x + s * 1.8 + 20},${baseY - s}" fill="#C0533A"/>
    <rect x="${x + s * 0.75}" y="${baseY - s * 0.55}" width="${s * 0.3}" height="${s * 0.55}" fill="#7A4B2A"/>
    <rect x="${x + s * 0.18}" y="${baseY - s * 0.75}" width="${s * 0.3}" height="${s * 0.25}" fill="#9FD3E6"/>
    <rect x="${x + s * 1.3}" y="${baseY - s * 0.75}" width="${s * 0.3}" height="${s * 0.25}" fill="#9FD3E6"/>`;
}

function drops(x, y, s) {
  let out = "";
  for (let i = 0; i < 5; i++) {
    const dx = x + i * s * 0.35;
    const dy = y + (i % 2) * s * 0.3;
    out += `<path d="M${dx} ${dy} C ${dx - s * 0.12} ${dy + s * 0.2}, ${dx - s * 0.12} ${dy + s * 0.32}, ${dx} ${dy + s * 0.32} C ${dx + s * 0.12} ${dy + s * 0.32}, ${dx + s * 0.12} ${dy + s * 0.2}, ${dx} ${dy} Z" fill="#3E9BD6"/>`;
  }
  return out;
}

function scene({ w, h, seed, kind }) {
  const r = rng(seed);
  const p = palettes[seed % palettes.length];
  const horizon = h * (0.58 + r() * 0.08);
  const unit = Math.min(w, h);
  let fg = "";

  if (kind === "grown" || kind === "planting" || kind === "watering") {
    const n = kind === "grown" ? 5 : 3;
    for (let i = 0; i < n; i++) {
      const x = w * (0.12 + (i / (n - 1 || 1)) * 0.76) + (r() - 0.5) * 40;
      fg += tree(x, horizon + 10, unit * (kind === "grown" ? 0.16 + r() * 0.06 : 0.09 + r() * 0.03), p.leaf, p.leaf2);
    }
  }
  if (kind === "planting" || kind === "watering" || kind === "team") {
    for (let i = 0; i < 4; i++) {
      fg += sapling(w * (0.18 + i * 0.2), horizon + unit * 0.22, unit * 0.12, p.leaf2);
    }
  }
  if (kind === "watering") fg += drops(w * 0.38, horizon + unit * 0.02, unit * 0.18);
  if (kind === "scrap") fg += bundles(w * 0.22, horizon + unit * 0.18, unit * 0.18);
  if (kind === "school") {
    fg += school(w * 0.3, horizon + 10, unit * 0.26);
    fg += tree(w * 0.15, horizon + 10, unit * 0.12, p.leaf, p.leaf2);
    fg += tree(w * 0.85, horizon + 10, unit * 0.12, p.leaf, p.leaf2);
  }
  if (kind === "team" || kind === "scrap" || kind === "school") {
    const colors = ["#1E5A2C", "#F2C230", "#C0533A", "#3E7CB1", "#7BB342"];
    const count = kind === "team" ? 5 : 3;
    for (let i = 0; i < count; i++) {
      const px = kind === "scrap" ? w * (0.62 + i * 0.1) : w * (0.2 + i * (0.6 / (count - 1)));
      fg += person(px, horizon + unit * 0.3, unit * 0.16, colors[(i + seed) % colors.length]);
    }
  }

  return fg;
}

function placeholderSvg({ w, h, seed, kind, id, note }) {
  const label = Math.round(Math.min(w, h) * 0.045);
  const sunX = w * (0.7 + (seed % 3) * 0.08);
  const p = palettes[seed % palettes.length];
  const horizon = h * 0.62;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${p.sky1}"/><stop offset="1" stop-color="${p.sky2}"/>
    </linearGradient>
    <pattern id="stripes" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width="20" height="40" fill="#000" opacity="0.04"/>
    </pattern>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#sky)"/>
  <circle cx="${sunX}" cy="${h * 0.2}" r="${Math.min(w, h) * 0.08}" fill="#F2C230" opacity="0.85"/>
  <path d="M0 ${horizon} Q ${w * 0.25} ${horizon - h * 0.12} ${w * 0.5} ${horizon - h * 0.03} T ${w} ${horizon - h * 0.06} V ${h} H 0 Z" fill="${p.hill}"/>
  <rect y="${horizon + h * 0.08}" width="${w}" height="${h}" fill="${p.ground}" opacity="0.55"/>
  ${scene({ w, h, seed, kind })}
  <rect width="${w}" height="${h}" fill="url(#stripes)"/>
  <rect x="12" y="12" width="${w - 24}" height="${h - 24}" fill="none" stroke="#163F21" stroke-width="6" stroke-dasharray="26 16" opacity="0.6"/>
  <rect x="${label}" y="${label}" rx="${label * 0.6}" width="${label * 9.2}" height="${label * 1.9}" fill="#FFF4CC" stroke="#6A5A1E" stroke-width="3"/>
  <text x="${label * 1.6}" y="${label * 2.3}" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="${label}" fill="#4A3712">PLACEHOLDER</text>
  <rect x="0" y="${h - label * 3}" width="${w}" height="${label * 3}" fill="#10301A" opacity="0.82"/>
  <text x="${label}" y="${h - label * 1.15}" font-family="Arial, Helvetica, sans-serif" font-size="${label * 0.9}" fill="#FFFFFF">${id} · ${note}</text>
</svg>`;
}

const images = [
  // Gallery (12)
  { id: "gallery-01", kind: "planting", w: 1600, h: 1200 },
  { id: "gallery-02", kind: "watering", w: 1600, h: 1200 },
  { id: "gallery-03", kind: "scrap", w: 1600, h: 1200 },
  { id: "gallery-04", kind: "school", w: 1200, h: 1600 },
  { id: "gallery-05", kind: "team", w: 1600, h: 1200 },
  { id: "gallery-06", kind: "grown", w: 1600, h: 1200 },
  { id: "gallery-07", kind: "planting", w: 1200, h: 1600 },
  { id: "gallery-08", kind: "scrap", w: 1600, h: 1200 },
  { id: "gallery-09", kind: "watering", w: 1600, h: 1200 },
  { id: "gallery-10", kind: "school", w: 1600, h: 1200 },
  { id: "gallery-11", kind: "grown", w: 1200, h: 1600 },
  { id: "gallery-12", kind: "team", w: 1600, h: 1200 },
  // Plantings showcase (6)
  { id: "planting-01", kind: "planting", w: 1600, h: 1200 },
  { id: "planting-02", kind: "school", w: 1600, h: 1200 },
  { id: "planting-03", kind: "watering", w: 1600, h: 1200 },
  { id: "planting-04", kind: "grown", w: 1600, h: 1200 },
  { id: "planting-05", kind: "team", w: 1600, h: 1200 },
  { id: "planting-06", kind: "planting", w: 1600, h: 1200 },
  // Other
  { id: "video-poster", kind: "team", w: 1600, h: 900, note: "Replace with a frame from the real video" },
  { id: "about-team", kind: "team", w: 1600, h: 1200 },
  { id: "collection-drive", kind: "scrap", w: 1600, h: 1200 },
];

let seed = 7;
for (const img of images) {
  seed += 3;
  const svg = placeholderSvg({ ...img, seed, note: img.note ?? "Replace with real photo" });
  const file = path.join(outDir, `${img.id}.jpg`);
  await sharp(Buffer.from(svg)).jpeg({ quality: 78, mozjpeg: true }).toFile(file);
  console.log("wrote", path.relative(root, file));
}

// Social share image (Open Graph) built from the real logo — not a placeholder photo.
const logoPath = path.join(root, "public", "logo.png");
const logo = await sharp(logoPath).resize(420, 420, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer();
const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <rect width="1200" height="630" fill="#EAF2DE"/>
  <circle cx="1120" cy="80" r="220" fill="#7BB342" opacity="0.18"/>
  <circle cx="60" cy="600" r="180" fill="#1E5A2C" opacity="0.10"/>
  <rect x="80" y="105" width="460" height="420" rx="40" fill="#FFFFFF"/>
  <text x="600" y="270" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="64" fill="#163F21">Vriksh Seva Samiti</text>
  <text x="600" y="340" font-family="Arial, Helvetica, sans-serif" font-size="38" fill="#33443A">Sindi (Meghe), Wardha</text>
  <text x="600" y="420" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="40" fill="#1E5A2C">Your Scrap Can Grow a Forest</text>
</svg>`;
await sharp(Buffer.from(ogSvg))
  .composite([{ input: logo, left: 100, top: 105 }])
  .jpeg({ quality: 85, mozjpeg: true })
  .toFile(path.join(root, "public", "og-image.jpg"));
console.log("wrote public/og-image.jpg");

// App icons from the real logo.
await sharp(logoPath).resize(512, 512, { fit: "contain", background: "#FFFFFF" }).png().toFile(path.join(root, "src", "app", "icon.png"));
await sharp(logoPath).resize(180, 180, { fit: "contain", background: "#FFFFFF" }).png().toFile(path.join(root, "src", "app", "apple-icon.png"));
console.log("wrote src/app/icon.png, src/app/apple-icon.png");
