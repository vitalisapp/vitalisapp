const { BRAND } = require("../theme");
const { escapeHtml } = require("../utils/escapeHtml");
const { renderLayout } = require("../layout/baseLayout");
const {
  renderHeading,
  renderParagraph,
  renderMutedNote,
  renderButton,
  renderPanel,
  renderCode,
} = require("../components");

/**
 * Link-based reset.
 * @param {{ link?: string }} props
 * @returns {{ subject: string, html: string }}
 */
function passwordResetLinkEmail({ link } = {}) {
  const safeLink = escapeHtml(link || "#");
  const body = `
    ${renderHeading("Password reset")}
    ${renderParagraph(`We received a request to reset your password. This link expires in <strong style="color:${BRAND.textPrimary};">1 hour</strong>.`)}
    ${renderButton({ href: safeLink, label: "RESET PASSWORD" })}
    ${renderMutedNote("If you didn't request this, you can safely ignore this email — your password won't change.")}`;
  return {
    subject: "Reset Your Vitalis Password",
    html: renderLayout({
      title: "Reset your password",
      preheader: "Reset your Vitalis password.",
      bodyHtml: body,
    }),
  };
}

/**
 * 6-digit OTP reset.
 * @param {{ name?: string, otp?: string | number }} props
 * @returns {{ subject: string, html: string }}
 */
function passwordResetOtpEmail({ name, otp } = {}) {
  const safeName = escapeHtml(name || "there");
  const body = `
    ${renderHeading("Password reset")}
    ${renderParagraph(`Hey ${safeName}, use the code below to reset your password. It expires in <strong style="color:${BRAND.accent};">10 minutes</strong>.`)}
    ${renderPanel(renderCode(otp), { accent: true })}
    ${renderMutedNote("If you didn't request this, you can safely ignore this email. Never share this code with anyone.")}`;
  return {
    subject: "Your Vitalis Password Reset Code",
    html: renderLayout({
      title: "Your password reset code",
      preheader: `${otp} is your Vitalis password reset code.`,
      bodyHtml: body,
    }),
  };
}

module.exports = { passwordResetLinkEmail, passwordResetOtpEmail };
