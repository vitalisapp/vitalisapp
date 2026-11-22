// Security alert — the account's password was actually changed (Profile modal
// or the forgot-password flow). Visually distinct from the reset templates:
// amber security band + an event table instead of the green accent panel.

const { BRAND } = require("../theme");
const { escapeHtml } = require("../utils/escapeHtml");
const { renderLayout } = require("../layout/baseLayout");
const {
  renderHeading,
  renderParagraph,
  renderMutedNote,
  renderButton,
  renderKeyValueTable,
  renderSecurityBand,
} = require("../components");

/**
 * @param {{ name?: string, when?: string | Date, resetUrl?: string }} props
 * @returns {{ subject: string, html: string }}
 */
function passwordChangedEmail({ name, when, resetUrl } = {}) {
  const safeName = escapeHtml(name || "there");
  const changedAt = when ? new Date(when) : new Date();
  let dateText = changedAt.toISOString().slice(0, 10);
  let timeText = `${changedAt.toISOString().slice(11, 16)} UTC`;
  try {
    dateText = changedAt.toLocaleDateString("en-US", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    });
    timeText = changedAt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  } catch (_) { /* fall back to ISO strings */ }

  const body = `
    ${renderSecurityBand({ text: "This is an automatic notification about a change to your account." })}
    ${renderHeading(`Password changed, ${safeName}`)}
    ${renderParagraph(`Your Vitalis password was just changed from your <strong style="color:${BRAND.textPrimary};">Profile page</strong>. You stay signed in on that device — every other signed-in device was logged out.`)}
    ${renderKeyValueTable([
      { label: "Changed", value: dateText },
      { label: "Time", value: timeText },
      { label: "This device", value: "Still signed in" },
      { label: "Other devices", value: "Signed out", color: BRAND.warning },
    ])}
    ${resetUrl
      ? renderButton({ href: escapeHtml(`${resetUrl}/reset-password`), label: "NOT YOU? SECURE YOUR ACCOUNT" })
      : ""}
    ${renderMutedNote("If this was you, you're all set — no action needed.")}
    ${renderMutedNote("Never share your password. Vitalis will never ask for it by email, chat, or phone.")}`;
  return {
    subject: "Security alert — your Vitalis password was changed",
    html: renderLayout({
      title: "Your password was changed",
      preheader: "Your Vitalis password was changed. Wasn't you? Secure your account.",
      bodyHtml: body,
    }),
  };
}

module.exports = { passwordChangedEmail };
