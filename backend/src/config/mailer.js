try { require('dotenv').config(); } catch {}
const log = require('../utils/logger');
const nodemailer = require("nodemailer");

function mailConfigured() {
  return Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);
}

if (!mailConfigured()) {
  log.warn(
    "[mailer] EMAIL_USER/EMAIL_PASS not set — outbound email will fail gracefully (logged, not thrown)",
  );
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  ...(process.env.NODE_ENV !== "production" &&
  process.env.MAILER_INSECURE_TLS === "1"
    ? { tls: { rejectUnauthorized: false } }
    : {}),
});

function safeSummary(summary = {}) {
  const n = (v) => (Number.isFinite(Number(v)) ? Math.round(Number(v)) : 0);
  return {
    calories: n(summary.calories),
    protein: n(summary.protein),
    carbs: n(summary.carbs),
    fat: n(summary.fat),
  };
}

function requireMailEnv() {
  if (!mailConfigured()) {
    throw new Error("Email service not configured (EMAIL_USER/EMAIL_PASS)");
  }
  if (!process.env.EMAIL_USER.includes("@")) {
    throw new Error("EMAIL_USER is not a valid email address");
  }
}

// ─── MEAL SUMMARY EMAIL ──────────────────────────────────────────────────────
async function sendMealSummaryEmail(to, summary) {
  requireMailEnv();
  if (!to || !String(to).includes("@"))
    throw new Error("Invalid recipient email");
  const s = safeSummary(summary);
  const mailOptions = {
    from: `"Vitalis" <${process.env.EMAIL_USER}>`,
    to,
    subject: "🥗 Your Daily Nutrition Summary — Vitalis",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;background:#0f0f0f;padding:32px;border-radius:12px;">
        <div style="text-align:center;margin-bottom:24px;">
          <h1 style="color:#a3e635;margin:0;font-size:24px;letter-spacing:2px;">VITALIS</h1>
          <p style="color:#888;font-size:12px;margin:4px 0 0;">PERFORMANCE OS</p>
        </div>

        <h2 style="color:#fff;font-size:18px;margin:0 0 8px;">Daily Nutrition Summary</h2>
        <p style="color:#aaa;font-size:14px;margin:0 0 24px;">
          Here's what you've consumed today. Keep fueling your performance!
        </p>

        <table style="width:100%;border-collapse:collapse;background:#1a1a1a;border-radius:8px;overflow:hidden;">
          <tr style="background:#1f1f1f;">
            <td style="padding:14px 16px;color:#888;font-size:13px;">🔥 Calories</td>
            <td style="padding:14px 16px;color:#a3e635;font-weight:bold;font-size:16px;text-align:right;">
              ${s.calories} kcal
            </td>
          </tr>
          <tr>
            <td style="padding:14px 16px;color:#888;font-size:13px;">💪 Protein</td>
            <td style="padding:14px 16px;color:#60a5fa;font-weight:bold;font-size:16px;text-align:right;">
              ${s.protein}g
            </td>
          </tr>
          <tr style="background:#1f1f1f;">
            <td style="padding:14px 16px;color:#888;font-size:13px;">🍚 Carbs</td>
            <td style="padding:14px 16px;color:#a3e635;font-weight:bold;font-size:16px;text-align:right;">
              ${s.carbs}g
            </td>
          </tr>
          <tr>
            <td style="padding:14px 16px;color:#888;font-size:13px;">🥑 Fat</td>
            <td style="padding:14px 16px;color:#fb923c;font-weight:bold;font-size:16px;text-align:right;">
              ${s.fat}g
            </td>
          </tr>
        </table>

        <p style="color:#555;font-size:11px;text-align:center;margin-top:32px;">
          You received this because you logged a meal on Vitalis.<br/>
          © ${new Date().getFullYear()} Vitalis Performance OS
        </p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
}

function escapeHtml(s) {
  return String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[c],
  );
}

function requireRecipient(to) {
  requireMailEnv();
  if (!to || !String(to).includes("@"))
    throw new Error("Invalid recipient email");
}

// ─── PASSWORD RESET EMAIL ─────────────────────────────────────────────────────
async function sendPasswordResetEmail(to, resetLink) {
  requireRecipient(to);
  if (!resetLink || typeof resetLink !== "string")
    throw new Error("Invalid reset link");
  const safeLink = escapeHtml(resetLink);
  const mailOptions = {
    from: `"Vitalis" <${process.env.EMAIL_USER}>`,
    to,
    subject: "🔐 Reset Your Vitalis Password",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;background:#0f0f0f;padding:32px;border-radius:12px;">
        <div style="text-align:center;margin-bottom:24px;">
          <h1 style="color:#a3e635;margin:0;font-size:24px;letter-spacing:2px;">VITALIS</h1>
          <p style="color:#888;font-size:12px;margin:4px 0 0;">PERFORMANCE OS</p>
        </div>

        <h2 style="color:#fff;font-size:18px;margin:0 0 8px;">Password Reset Request</h2>
        <p style="color:#aaa;font-size:14px;margin:0 0 24px;">
          We received a request to reset your password. Click the button below to continue.
          This link expires in <strong style="color:#fff;">1 hour</strong>.
        </p>

        <div style="text-align:center;margin:32px 0;">
          <a href="${safeLink}"
             style="background:#a3e635;color:#000;padding:14px 32px;border-radius:8px;
                    text-decoration:none;font-weight:bold;font-size:15px;letter-spacing:1px;">
            RESET PASSWORD
          </a>
        </div>

        <p style="color:#555;font-size:12px;">
          If you didn't request this, you can safely ignore this email.
          Your password will not be changed.
        </p>

        <p style="color:#555;font-size:11px;text-align:center;margin-top:32px;">
          © ${new Date().getFullYear()} Vitalis Performance OS
        </p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
}

// ─── WELCOME EMAIL ────────────────────────────────────────────────────────────
async function sendWelcomeEmail(to, name) {
  requireRecipient(to);
  const mailOptions = {
    from: `"Vitalis" <${process.env.EMAIL_USER}>`,
    to,
    subject: "⚡ Welcome to Vitalis Performance OS",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;background:#0f0f0f;padding:32px;border-radius:12px;">
        <div style="text-align:center;margin-bottom:24px;">
          <h1 style="color:#a3e635;margin:0;font-size:24px;letter-spacing:2px;">VITALIS</h1>
          <p style="color:#888;font-size:12px;margin:4px 0 0;">PERFORMANCE OS</p>
        </div>

        <h2 style="color:#fff;font-size:18px;margin:0 0 8px;">Welcome, ${escapeHtml(name)}! 👋</h2>
        <p style="color:#aaa;font-size:14px;margin:0 0 24px;">
          Your Vitalis account is ready. Start tracking your nutrition, workouts, 
          sleep, and recovery — all in one place.
        </p>

        <div style="background:#1a1a1a;border-radius:8px;padding:20px;margin-bottom:24px;">
          <p style="color:#a3e635;font-weight:bold;margin:0 0 12px;">What you can do:</p>
          <p style="color:#aaa;font-size:13px;margin:6px 0;">🍗 AI-powered meal analysis</p>
          <p style="color:#aaa;font-size:13px;margin:6px 0;">💪 Camera workout tracking</p>
          <p style="color:#aaa;font-size:13px;margin:6px 0;">😴 Sleep & recovery monitoring</p>
          <p style="color:#aaa;font-size:13px;margin:6px 0;">📊 Clinical health insights</p>
          <p style="color:#aaa;font-size:13px;margin:6px 0;">🗺️ Activity map & run analysis</p>
        </div>

        <p style="color:#555;font-size:11px;text-align:center;margin-top:32px;">
          © ${new Date().getFullYear()} Vitalis Performance OS
        </p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
}

// ─── EMAIL VERIFICATION ─────────────────────────────────────────────────────
async function sendVerificationEmail(to, verifyLink) {
  requireRecipient(to);
  if (!verifyLink || typeof verifyLink !== "string")
    throw new Error("Invalid verification link");
  const safeVerifyLink = escapeHtml(verifyLink);
  const mailOptions = {
    from: `"Vitalis" <${process.env.EMAIL_USER}>`,
    to,
    subject: "✓ Verify Your Vitalis Account",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;background:#0f0f0f;padding:32px;border-radius:12px;">
        <div style="text-align:center;margin-bottom:24px;">
          <h1 style="color:#a3e635;margin:0;font-size:24px;letter-spacing:2px;">VITALIS</h1>
          <p style="color:#888;font-size:12px;margin:4px 0 0;">PERFORMANCE OS</p>
        </div>

        <h2 style="color:#fff;font-size:18px;margin:0 0 8px;">Verify your email</h2>
        <p style="color:#aaa;font-size:14px;margin:0 0 24px;">
          Click the button below to activate your Vitalis account.
          This link expires in <strong style="color:#fff;">24 hours</strong>.
        </p>

        <div style="text-align:center;margin:32px 0;">
          <a href="${safeVerifyLink}"
             style="background:#a3e635;color:#000;padding:14px 32px;border-radius:8px;
                    text-decoration:none;font-weight:bold;font-size:15px;letter-spacing:1px;">
            VERIFY EMAIL
          </a>
        </div>

        <p style="color:#555;font-size:12px;">
          If you didn't create this account, you can safely ignore this email.
        </p>

        <p style="color:#555;font-size:11px;text-align:center;margin-top:32px;">
          © ${new Date().getFullYear()} Vitalis Performance OS
        </p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
}

module.exports = {
  transporter,
  getTransporter: () => transporter,
  escapeHtml,
  sendMealSummaryEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendVerificationEmail,
};
