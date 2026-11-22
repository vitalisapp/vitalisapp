const { BRAND } = require("../theme");

// All helpers take pre-escaped / trusted HTML — escape user values at the
// call site with escapeHtml().

/** @param {string} text */
function renderEyebrow(text) {
  return `<p style="margin:0 0 10px;font-family:${BRAND.fontSans};font-size:11px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;color:${BRAND.accent};">${text}</p>`;
}

/** @param {string} html */
function renderHeading(html) {
  return `<h1 class="vitalis-h1" style="margin:0 0 10px;font-family:${BRAND.fontDisplay};font-weight:800;font-size:24px;line-height:1.25;letter-spacing:-0.01em;color:${BRAND.textPrimary};">${html}</h1>`;
}

/** @param {string} html */
function renderSubheading(html) {
  return `<h2 style="margin:0 0 14px;font-family:${BRAND.fontDisplay};font-weight:800;font-size:15px;line-height:1.35;color:${BRAND.textPrimary};">${html}</h2>`;
}

/** @param {string} html */
function renderParagraph(html) {
  return `<p style="margin:0 0 16px;font-family:${BRAND.fontSans};font-size:14px;line-height:1.65;color:${BRAND.textSecondary};">${html}</p>`;
}

/** @param {string} html */
function renderMutedNote(html) {
  return `<p style="margin:0 0 8px;font-family:${BRAND.fontSans};font-size:12px;line-height:1.6;color:${BRAND.textMuted};">${html}</p>`;
}

/** @param {string} html */
function renderStrong(html) {
  return `<strong style="color:${BRAND.textPrimary};">${html}</strong>`;
}

function renderDivider() {
  return `<div style="height:1px;line-height:1px;font-size:1px;background:${BRAND.border};margin:8px 0 24px;">&nbsp;</div>`;
}

module.exports = {
  renderEyebrow,
  renderHeading,
  renderSubheading,
  renderParagraph,
  renderMutedNote,
  renderStrong,
  renderDivider,
};
