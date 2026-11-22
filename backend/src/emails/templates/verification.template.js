// Standalone email-verification message (resend from the banner / check-email
// screen). New signups get the verify link inside the welcome email instead.

const { escapeHtml } = require("../utils/escapeHtml");
const { renderLayout } = require("../layout/baseLayout");
const {
  renderHeading,
  renderParagraph,
  renderMutedNote,
  renderButton,
  renderLinkFallback,
  renderIconCallout,
} = require("../components");

/**
 * @param {{ link?: string }} props
 * @returns {{ subject: string, html: string, text: string }}
 */
function verificationEmail({ link } = {}) {
  const safeLink = escapeHtml(link || "#");
  const body = `
    ${renderHeading("Verify your email")}
    ${renderParagraph("Confirm your email address to keep password recovery and security alerts working on your Vitalis account.")}
    ${renderButton({ href: safeLink, label: "VERIFY EMAIL", fullWidth: true })}
    ${renderIconCallout({
      icon: "lock",
      title: "Link expires in 24 hours",
      bodyHtml: "Only the most recent links work. Request a new one from the app any time.",
    })}
    ${renderLinkFallback(safeLink)}
    ${renderMutedNote("Didn't create a Vitalis account? You can ignore this email.")}`;
  return {
    subject: "Verify your Vitalis email",
    html: renderLayout({
      title: "Verify your email",
      preheader: "Confirm your email address for your Vitalis account.",
      bodyHtml: body,
    }),
    text: `Verify your Vitalis email (expires in 24 hours):\n${link || ""}\n\nDidn't create a Vitalis account? You can ignore this email.`,
  };
}

module.exports = { verificationEmail };
