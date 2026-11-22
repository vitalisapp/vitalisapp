// ─────────────────────────────────────────────────────────────────────────────
// Branded email shell: <html> document, preheader, logo header, card, footer.
//
// Email clients ignore flexbox/grid and often strip <style>, so everything is
// table-based with inline styles; the <style> block only adds niceties
// (web fonts, mobile padding) for clients that keep it.
// ─────────────────────────────────────────────────────────────────────────────

const { BRAND, assetUrl, appUrl } = require("../theme");
const { escapeHtml } = require("../utils/escapeHtml");

/**
 * Logo image + VITALIS wordmark. The image carries alt text so the header
 * still reads correctly when a client blocks remote images.
 * @returns {string}
 */
function renderHeader() {
  return `
    <tr>
      <td class="vitalis-pad" style="padding:28px 32px 0;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="vertical-align:middle;">
              <a href="${escapeHtml(appUrl("/"))}" target="_blank" style="text-decoration:none;">
                <img src="${escapeHtml(assetUrl("logo"))}" width="44" height="44" alt="Vitalis" style="display:block;width:44px;height:44px;border:0;border-radius:12px;outline:none;text-decoration:none;font-family:${BRAND.fontDisplay};font-weight:800;font-size:18px;color:${BRAND.accent};"/>
              </a>
            </td>
            <td style="vertical-align:middle;padding-left:12px;">
              <div style="font-family:${BRAND.fontDisplay};font-weight:800;font-size:17px;letter-spacing:0.18em;color:${BRAND.textPrimary};">VITALIS</div>
              <div style="font-family:${BRAND.fontSans};font-size:10px;letter-spacing:0.22em;color:${BRAND.textMuted};margin-top:2px;">PERFORMANCE OS</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>`;
}

/**
 * @param {{ note?: string }} [props] optional extra line above the copyright
 * @returns {string}
 */
function renderFooter({ note } = {}) {
  return `
    <tr>
      <td class="vitalis-pad" style="padding:24px 32px 32px;">
        <div style="border-top:1px solid ${BRAND.border};padding-top:20px;text-align:center;">
          ${note ? `<p style="margin:0 0 10px;font-family:${BRAND.fontSans};font-size:12px;line-height:1.6;color:${BRAND.textSecondary};">${note}</p>` : ""}
          <p style="margin:0;font-family:${BRAND.fontSans};font-size:11px;line-height:1.6;color:${BRAND.textMuted};">
            You received this email from Vitalis Performance OS.<br/>
            &copy; ${new Date().getFullYear()} Vitalis. All rights reserved.
          </p>
        </div>
      </td>
    </tr>`;
}

/**
 * Wrap body content in the branded shell.
 * @param {{ title?: string, preheader?: string, bodyHtml?: string, heroHtml?: string, footerNote?: string }} props
 *   heroHtml   — optional full-bleed band rendered between header and body
 *   footerNote — optional HTML line shown above the copyright
 * @returns {string}
 */
function renderLayout({ title = "Vitalis", preheader = "", bodyHtml = "", heroHtml = "", footerNote } = {}) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="color-scheme" content="dark"/>
<meta name="supported-color-schemes" content="dark"/>
<title>${escapeHtml(title)}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Manrope:wght@700;800&display=swap');
  body{margin:0;padding:0;background:${BRAND.bg};}
  a{color:${BRAND.accent};}
  img{-ms-interpolation-mode:bicubic;}
  @media (max-width:520px){
    .vitalis-card{border-radius:0 !important;}
    .vitalis-pad{padding-left:20px !important;padding-right:20px !important;}
    .vitalis-col{display:block !important;width:100% !important;padding:0 0 12px !important;}
    .vitalis-h1{font-size:24px !important;}
  }
</style>
</head>
<body style="margin:0;padding:0;background:${BRAND.bg};-webkit-font-smoothing:antialiased;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;font-size:1px;line-height:1px;color:${BRAND.bg};mso-hide:all;">${escapeHtml(preheader)}&#8203;&nbsp;&#8203;&nbsp;&#8203;&nbsp;</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${BRAND.bg}" style="background:${BRAND.bg};padding:32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" class="vitalis-card" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${BRAND.card}" style="max-width:520px;background:${BRAND.card};border:1px solid ${BRAND.border};border-radius:18px;overflow:hidden;">
          ${renderHeader()}
          ${heroHtml}
          <tr>
            <td class="vitalis-pad" style="padding:24px 32px 8px;">
              ${bodyHtml}
            </td>
          </tr>
          ${renderFooter({ note: footerNote })}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

module.exports = { renderLayout, renderHeader, renderFooter };
