const { BRAND, assetUrl } = require("../theme");
const { escapeHtml } = require("../utils/escapeHtml");

/**
 * 40px accent tile holding an emoji. Pure HTML, so it renders even when the
 * client blocks remote images. `emoji` is trusted markup (an HTML entity).
 * @param {string} emoji
 */
function emojiTile(emoji) {
  return `
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 12px;border-collapse:separate;">
            <tr>
              <td width="40" height="40" align="center" valign="middle" bgcolor="${BRAND.accentBg}"
                style="width:40px;height:40px;background:${BRAND.accentBg};border:1px solid ${BRAND.accentBorder};border-radius:12px;text-align:center;vertical-align:middle;font-size:20px;line-height:40px;mso-line-height-rule:exactly;">${emoji}</td>
            </tr>
          </table>`;
}

/**
 * Single feature cell: icon tile, title, description.
 * @param {{ emoji?: string, icon?: string, title: string, description: string }} f
 *   emoji (HTML entity) is used when set; otherwise icon (theme.ICONS key, hosted PNG).
 */
function featureCell(f) {
  const iconHtml = f.emoji
    ? emojiTile(f.emoji)
    : `<img src="${escapeHtml(assetUrl(f.icon))}" width="40" height="40" alt="" style="display:block;width:40px;height:40px;border:0;margin:0 0 12px;"/>`;
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${BRAND.surface}" style="background:${BRAND.surface};border:1px solid ${BRAND.border};border-radius:14px;">
      <tr>
        <td style="padding:16px;">
          ${iconHtml}
          <p style="margin:0 0 4px;font-family:${BRAND.fontDisplay};font-size:14px;font-weight:800;color:${BRAND.textPrimary};">${escapeHtml(f.title)}</p>
          <p style="margin:0;font-family:${BRAND.fontSans};font-size:12px;line-height:1.55;color:${BRAND.textMuted};">${escapeHtml(f.description)}</p>
        </td>
      </tr>
    </table>`;
}

/**
 * Two-column feature grid; stacks to one column on narrow screens.
 * @param {Array<{ emoji?: string, icon?: string, title: string, description: string }>} features
 */
function renderFeatureGrid(features) {
  const rows = [];
  for (let i = 0; i < features.length; i += 2) {
    const [a, b] = [features[i], features[i + 1]];
    rows.push(`
      <tr>
        <td class="vitalis-col" width="50%" style="width:50%;vertical-align:top;padding:0 6px 12px 0;">${featureCell(a)}</td>
        <td class="vitalis-col" width="50%" style="width:50%;vertical-align:top;padding:0 0 12px 6px;">${b ? featureCell(b) : "&nbsp;"}</td>
      </tr>`);
  }
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 12px;">${rows.join("")}</table>`;
}

/**
 * Numbered "next steps" list.
 * @param {Array<{ title: string, description: string }>} steps
 */
function renderSteps(steps) {
  const rows = steps
    .map(
      (s, i) => `
      <tr>
        <td width="40" style="width:40px;vertical-align:top;padding:0 12px 16px 0;">
          <div style="width:28px;height:28px;line-height:28px;border-radius:999px;background:${BRAND.accentBg};border:1px solid ${BRAND.accentBorder};text-align:center;font-family:${BRAND.fontDisplay};font-size:13px;font-weight:800;color:${BRAND.accent};">${i + 1}</div>
        </td>
        <td style="vertical-align:top;padding:0 0 16px;">
          <p style="margin:3px 0 2px;font-family:${BRAND.fontSans};font-size:14px;font-weight:700;color:${BRAND.textPrimary};">${escapeHtml(s.title)}</p>
          <p style="margin:0;font-family:${BRAND.fontSans};font-size:12px;line-height:1.55;color:${BRAND.textMuted};">${escapeHtml(s.description)}</p>
        </td>
      </tr>`,
    )
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 8px;">${rows}</table>`;
}

module.exports = { renderFeatureGrid, renderSteps };
