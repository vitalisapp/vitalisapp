// Internal notification to the Vitalis team (reply-to is the submitter).

const { BRAND } = require("../theme");
const { escapeHtml } = require("../utils/escapeHtml");
const { renderLayout } = require("../layout/baseLayout");
const { renderHeading, renderParagraph, renderKeyValueTable, renderPanel } = require("../components");

/**
 * @param {{ name?: string, email?: string, message?: string }} props
 * @returns {{ subject: string, html: string }}
 */
function feedbackEmail({ name, email, message } = {}) {
  const body = `
    ${renderHeading("New feedback")}
    ${renderParagraph("A user submitted feedback through the Vitalis app.")}
    ${renderKeyValueTable([
      { label: "Name", value: name || "—" },
      { label: "Email", value: email || "—" },
    ])}
    <p style="margin:0 0 8px;font-family:${BRAND.fontSans};font-size:12px;font-weight:600;color:${BRAND.textMuted};text-transform:uppercase;letter-spacing:0.08em;">Message</p>
    ${renderPanel(
      `<div style="font-family:${BRAND.fontSans};font-size:14px;line-height:1.65;color:${BRAND.textPrimary};white-space:pre-wrap;">${escapeHtml(message || "")}</div>`,
    )}`;
  return {
    subject: `New Feedback from ${name || "a user"}`,
    html: renderLayout({
      title: "New feedback",
      preheader: `Feedback from ${name || "a user"}.`,
      bodyHtml: body,
    }),
  };
}

module.exports = { feedbackEmail };
