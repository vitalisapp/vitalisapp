#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// Generates the PNG images used by transactional emails.
//
// Email clients (Gmail, Outlook, Apple Mail) block SVG and most inline/base64
// images, so emails reference hosted PNGs instead. They live in
// frontend/public/email/ and are served from FRONTEND_URL/email/<file> (or
// EMAIL_ASSET_BASE_URL when set — see src/emails/theme.js).
//
// Icons are Material Symbols glyphs (same family the app UI uses) drawn on a
// rounded tile in the app's lime-on-forest palette, exported at 2x for retina.
//
//   node scripts/generate-email-assets.js
// ─────────────────────────────────────────────────────────────────────────────

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const OUT_DIR = path.resolve(__dirname, "../../frontend/public/email");
const LOGO_SRC = path.resolve(__dirname, "../../frontend/public/pwa-512x512.png");

const COLORS = {
  tile: "#202a1b", // --bg-elevated
  tileBorder: "#3a4e36", // --border-heavy
  accent: "#c7f464", // --accent
  accentDeep: "#182110", // --text-inverse
};

// Material Symbols (24x24 viewBox) path data.
const GLYPHS = {
  meal: "M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z",
  workout:
    "M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z",
  ai: "M19 9l1.25-2.75L23 5l-2.75-1.25L19 1l-1.25 2.75L15 5l2.75 1.25L19 9zm-7.5.5L9 4 6.5 9.5 1 12l5.5 2.5L9 20l2.5-5.5L17 12l-5.5-2.5zM19 15l-1.25 2.75L15 19l2.75 1.25L19 23l1.25-2.75L23 19l-2.75-1.25L19 15z",
  map: "M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z",
  mail: "M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z",
  bolt: "M11 21h-1l1-7H7.5c-.58 0-.57-.32-.38-.66.19-.34.05-.08.07-.12C8.48 10.94 10.42 7.54 13 3h1l-1 7h3.5c.49 0 .56.33.47.51l-.07.15C12.96 17.55 11 21 11 21z",
  lock: "M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z",
  verified:
    "M23 12l-2.44-2.79.34-3.69-3.61-.82-1.89-3.2L12 2.96 8.6 1.5 6.71 4.69 3.1 5.5l.34 3.7L1 12l2.44 2.79-.34 3.7 3.61.82L8.6 22.5l3.4-1.47 3.4 1.46 1.89-3.19 3.61-.82-.34-3.69L23 12zm-12.91 4.72l-3.8-3.81 1.48-1.48 2.32 2.33 5.85-5.87 1.48 1.48-7.33 7.35z",
};

// Rounded tile + centered glyph. `size` is the exported pixel size (2x).
function tileSvg(glyph, { size = 96, filled = false } = {}) {
  const r = Math.round(size * 0.26);
  const pad = size * 0.25;
  const scale = (size - pad * 2) / 24;
  const bg = filled ? COLORS.accent : COLORS.tile;
  const fg = filled ? COLORS.accentDeep : COLORS.accent;
  const stroke = filled ? "none" : COLORS.tileBorder;
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect x="1" y="1" width="${size - 2}" height="${size - 2}" rx="${r}" fill="${bg}" stroke="${stroke}" stroke-width="2"/>
  <g transform="translate(${pad} ${pad}) scale(${scale})"><path d="${glyph}" fill="${fg}"/></g>
</svg>`);
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  // Brand logo — 2x of the 44px header mark, plus a 2x hero badge (72px).
  await sharp(LOGO_SRC).resize(88, 88).png({ compressionLevel: 9 }).toFile(path.join(OUT_DIR, "logo.png"));
  await sharp(LOGO_SRC).resize(144, 144).png({ compressionLevel: 9 }).toFile(path.join(OUT_DIR, "logo-hero.png"));

  for (const [name, glyph] of Object.entries(GLYPHS)) {
    await sharp(tileSvg(glyph)).png({ compressionLevel: 9 }).toFile(path.join(OUT_DIR, `icon-${name}.png`));
  }
  // Solid-accent variants for primary callouts.
  for (const name of ["mail", "verified", "bolt"]) {
    await sharp(tileSvg(GLYPHS[name], { filled: true }))
      .png({ compressionLevel: 9 })
      .toFile(path.join(OUT_DIR, `icon-${name}-solid.png`));
  }

  console.log(`Email assets written to ${OUT_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
