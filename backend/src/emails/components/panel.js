const { BRAND, assetUrl } = require("../theme");
const { escapeHtml } = require("../utils/escapeHtml");

/**
 * Highlighted panel (OTP code, info callouts).
 * @param {string} innerHtml
 * @param {{ accent?: boolean }} [opts]
 */
function renderPanel(innerHtml, { accent = false } = {}) {
  const bg = accent ? BRAND.accentBg : BRAND.surface;
  const bd = accent ? BRAND.accentBorder : BRAND.border;
  return `<div style="background:${bg};border:1px solid ${bd};border-radius:14px;padding:20px;margin:0 0 24px;">${innerHtml}</div>`;
}

/**
 * Icon + title + body callout row.
 * @param {{ icon: string, title: string, bodyHtml: string, accent?: boolean, actionHtml?: string }} props
 *   icon — key from theme.ICONS; title is escaped here, bodyHtml/actionHtml are trusted.
 */
function renderIconCallout({ icon, title, bodyHtml, accent = false, actionHtml = "" }) {
  const inner = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td width="48" style="vertical-align:top;width:48px;padding-right:14px;">
          <img src="${escapeHtml(assetUrl(icon))}" width="40" height="40" alt="" style="display:block;width:40px;height:40px;border:0;"/>
        </td>
        <td style="vertical-align:top;">
          <p style="margin:2px 0 4px;font-family:${BRAND.fontDisplay};font-size:15px;font-weight:800;color:${BRAND.textPrimary};">${escapeHtml(title)}</p>
          <p style="margin:0;font-family:${BRAND.fontSans};font-size:13px;line-height:1.6;color:${BRAND.textSecondary};">${bodyHtml}</p>
          ${actionHtml}
        </td>
      </tr>
    </table>`;
  return renderPanel(inner, { accent });
}

/**
 * Big monospace-ish one-time code.
 * @param {unknown} code
 */
function renderCode(code) {
  return `
    <div style="text-align:center;">
      <div style="font-family:${BRAND.fontDisplay};font-size:40px;font-weight:800;letter-spacing:0.32em;color:${BRAND.accent};padding-left:0.32em;">${escapeHtml(code)}</div>
    </div>`;
}

/**
 * Amber security band shown above security notices.
 * @param {{ label?: string, text: string }} props
 */
function renderSecurityBand({ label = "SECURITY ALERT", text }) {
  return `
    <div style="background:rgba(253,230,138,0.10);border:1px solid rgba(253,230,138,0.35);border-left:3px solid ${BRAND.warning};border-radius:10px;padding:12px 16px;margin:0 0 20px;">
      <p style="margin:0;font-family:${BRAND.fontSans};font-size:10px;font-weight:700;letter-spacing:0.24em;color:${BRAND.warning};">${escapeHtml(label)}</p>
      <p style="margin:4px 0 0;font-family:${BRAND.fontSans};font-size:12px;line-height:1.55;color:${BRAND.textSecondary};">${text}</p>
    </div>`;
}

module.exports = { renderPanel, renderIconCallout, renderCode, renderSecurityBand };
