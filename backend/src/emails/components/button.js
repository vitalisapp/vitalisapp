const { BRAND } = require("../theme");

/**
 * Bulletproof (table-based) CTA button.
 * @param {{ href: string, label: string, variant?: "primary" | "ghost", fullWidth?: boolean }} props
 *   href/label must already be escaped.
 * @returns {string}
 */
function renderButton({ href, label, variant = "primary", fullWidth = false }) {
  const primary = variant === "primary";
  const bg = primary ? BRAND.accent : "transparent";
  const color = primary ? BRAND.textInverse : BRAND.accent;
  const border = primary ? BRAND.accent : BRAND.accentBorder;
  return `
    <table role="presentation" ${fullWidth ? 'width="100%"' : ""} cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;">
      <tr>
        <td align="center" ${primary ? `bgcolor="${BRAND.accent}"` : ""} style="border-radius:12px;background:${bg};border:1px solid ${border};mso-padding-alt:14px 32px;">
          <a href="${href}" target="_blank" style="display:${fullWidth ? "block" : "inline-block"};padding:14px 32px;font-family:${BRAND.fontSans};font-size:14px;font-weight:700;letter-spacing:0.06em;color:${color};text-decoration:none;border-radius:12px;text-align:center;">${label}</a>
        </td>
      </tr>
    </table>`;
}

/**
 * "Button not working?" fallback with the raw link.
 * @param {string} href already escaped
 */
function renderLinkFallback(href) {
  return `
    <p style="margin:0 0 6px;font-family:${BRAND.fontSans};font-size:12px;line-height:1.6;color:${BRAND.textMuted};">Button not working? Copy this link into your browser:</p>
    <p style="margin:0 0 16px;font-family:${BRAND.fontSans};font-size:12px;line-height:1.6;word-break:break-all;overflow-wrap:anywhere;"><a href="${href}" target="_blank" style="color:${BRAND.accent};text-decoration:underline;word-break:break-all;">${href}</a></p>`;
}

module.exports = { renderButton, renderLinkFallback };
