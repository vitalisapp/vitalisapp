// Best-effort security notice to the *old* address after an email change.

const { BRAND } = require("../theme");
const { escapeHtml } = require("../utils/escapeHtml");
const { renderLayout } = require("../layout/baseLayout");
const { renderHeading, renderParagraph, renderPanel } = require("../components");

/**
 * @param {{ newEmail?: string }} props
 * @returns {{ subject: string, html: string }}
 */
function emailChangedNoticeEmail({ newEmail } = {}) {
  const body = `
    ${renderHeading("Your email was changed")}
    ${renderParagraph(`Your Vitalis account email was changed to <strong style="color:${BRAND.textPrimary};">${escapeHtml(newEmail || "")}</strong>.`)}
    ${renderPanel(
      `<p style="margin:0;font-family:${BRAND.fontSans};font-size:13px;line-height:1.6;color:${BRAND.error};">If this wasn't you, reset your password immediately.</p>`,
    )}`;
  return {
    subject: "Your Vitalis email was changed",
    html: renderLayout({
      title: "Your email was changed",
      preheader: "Your Vitalis account email address was changed.",
      bodyHtml: body,
    }),
  };
}

module.exports = { emailChangedNoticeEmail };
