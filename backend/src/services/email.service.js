// ─────────────────────────────────────────────────────────────────────────────
// Email service — outbound message logic.
// Transport lives in config/mailer.js, markup in src/emails/ (one file per template).
// Controllers call these functions; they never build HTML themselves.
// ─────────────────────────────────────────────────────────────────────────────

const {
  getTransporter,
  mailConfigured,
  fromAddress,
  fromHeader,
} = require("../config/mailer");
const templates = require("../emails");

const { escapeHtml } = templates;

function requireMailEnv() {
  if (!mailConfigured()) {
    throw new Error(
      "Email service not configured. Set BREVO_API_KEY and MAIL_FROM, or SMTP credentials.",
    );
  }
}

function requireRecipient(to) {
  requireMailEnv();
  if (!to || !String(to).includes("@")) {
    throw new Error("Invalid recipient email");
  }
}

async function deliver(to, { subject, html, text }, extra = {}) {
  requireRecipient(to);
  return getTransporter().sendMail({
    from: fromHeader(),
    to,
    subject,
    html,
    ...(text ? { text } : {}),
    ...extra,
  });
}

// ─── PUBLIC SEND HELPERS ─────────────────────────────────────────────────────

// Section 5 — weekly progress email (opt-out via reminder_prefs.email_weekly).
async function sendWeeklyProgressEmail(to, props) {
  return deliver(to, templates.weeklyProgressEmail(props));
}

async function sendMealSummaryEmail(to, summary) {
  return deliver(to, templates.mealSummaryEmail({ summary }));
}

async function sendPasswordResetEmail(to, resetLink) {
  if (!resetLink || typeof resetLink !== "string") {
    throw new Error("Invalid reset link");
  }
  return deliver(to, templates.passwordResetLinkEmail({ link: resetLink }));
}

async function sendPasswordResetOtpEmail(to, name, otp) {
  if (!otp || typeof otp !== "string") {
    throw new Error("Invalid reset code");
  }
  return deliver(to, templates.passwordResetOtpEmail({ name, otp }));
}

// Security alert after a successful password change (Profile modal). Distinct
// design + copy from the reset emails — this one confirms, not resets.
async function sendPasswordChangedEmail(to, name, resetUrl, when) {
  return deliver(to, templates.passwordChangedEmail({ name, resetUrl, when }));
}

// Sent once per new account. Options are passed straight to the template:
//   verifyUrl — include the email-verification CTA (email signups)
//   provider  — 'email' | 'google' | 'sms'
/**
 * @param {string} to
 * @param {string} name
 * @param {{ verifyUrl?: string | null, provider?: "email" | "google" | "sms", ctaUrl?: string }} [options]
 */
async function sendWelcomeEmail(to, name, options = {}) {
  return deliver(to, templates.welcomeEmail({ name, ...options }));
}

async function sendVerificationEmail(to, verifyLink) {
  if (!verifyLink || typeof verifyLink !== "string") {
    throw new Error("Invalid verification link");
  }
  return deliver(to, templates.verificationEmail({ link: verifyLink }));
}

// Internal feedback notification. `replyTo` routes replies to the submitter.
/**
 * @param {{ name?: string, email?: string, message?: string }} props
 * @returns {Promise<unknown>}
 */
async function sendFeedbackEmail({ name, email, message } = {}) {
  requireMailEnv();
  const recipient =
    process.env.RECEIVER_EMAIL || process.env.FEEDBACK_EMAIL || fromAddress();
  if (!recipient) throw new Error("No feedback recipient configured");
  return getTransporter().sendMail({
    from: fromHeader(),
    replyTo: email || undefined,
    to: recipient,
    ...templates.feedbackEmail({ name, email, message }),
  });
}

// Best-effort security notice to the *old* address after an email change.
async function sendEmailChangedNotice(to, newEmail) {
  return deliver(to, templates.emailChangedNoticeEmail({ newEmail }));
}

module.exports = {
  sendWeeklyProgressEmail,
  escapeHtml,
  requireMailEnv,
  requireRecipient,
  sendMealSummaryEmail,
  sendPasswordResetEmail,
  sendPasswordResetOtpEmail,
  sendPasswordChangedEmail,
  sendWelcomeEmail,
  sendVerificationEmail,
  sendFeedbackEmail,
  sendEmailChangedNotice,
};
