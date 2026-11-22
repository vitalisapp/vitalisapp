// ─────────────────────────────────────────────────────────────────────────────
// Welcome email — sent once, when a brand-new account is created (email
// signup, SMS signup, or first Google sign-in).
//
// Props:
//   name       display name (escaped here)
//   verifyUrl  optional email-verification link. When present the email doubles
//              as the verification email (one message instead of two).
//   provider   'email' | 'google' | 'sms' — tweaks the "account" line
//   ctaUrl     optional override for the main button (defaults to onboarding)
// ─────────────────────────────────────────────────────────────────────────────

const { BRAND, assetUrl, appUrl } = require("../theme");
const { escapeHtml } = require("../utils/escapeHtml");
const { renderLayout } = require("../layout/baseLayout");
const {
  renderEyebrow,
  renderHeading,
  renderParagraph,
  renderSubheading,
  renderMutedNote,
  renderStrong,
  renderDivider,
  renderButton,
  renderLinkFallback,
  renderIconCallout,
  renderFeatureGrid,
  renderSteps,
} = require("../components");

const FEATURES = [
  { emoji: "&#127869;", title: "AI meal analysis", description: "Snap a photo and get calories and macros in seconds." },
  { emoji: "&#127947;", title: "Camera workouts", description: "Rep counting and form tracking from your camera." },
  { emoji: "&#129302;", title: "Vitalis AI coach", description: "Personal insights built from your own logs." },
  { emoji: "&#128506;", title: "Activity & runs", description: "Map your routes and break down every session." },
];

const STEPS = [
  { title: "Set your goal", description: "Tell us what you're training for so we can tune your plan." },
  { title: "Log your first meal", description: "Scan a plate or search the food database." },
  { title: "Start a workout", description: "Pick a plan or track a free session." },
];

function firstName(name) {
  const n = String(name || "").trim().split(/\s+/)[0];
  return n || "there";
}

/** Hero band: glow background, large logo badge, greeting. */
function renderHero(safeFirst) {
  return `
    <tr>
      <td class="vitalis-pad" style="padding:24px 32px 0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${BRAND.accentBg}"
          style="background:${BRAND.accentBg};background-image:radial-gradient(420px 220px at 85% 0%, rgba(199,244,100,0.22), transparent 70%),radial-gradient(320px 200px at 0% 100%, rgba(103,214,109,0.16), transparent 70%);border:1px solid ${BRAND.accentBorder};border-radius:16px;">
          <tr>
            <td align="center" style="padding:32px 24px 28px;text-align:center;">
              <img src="${escapeHtml(assetUrl("logoHero"))}" width="72" height="72" alt="Vitalis" style="display:block;margin:0 auto 18px;width:72px;height:72px;border:0;border-radius:18px;"/>
              ${renderEyebrow("Welcome aboard")}
              <h1 class="vitalis-h1" style="margin:0 0 10px;font-family:${BRAND.fontDisplay};font-weight:800;font-size:28px;line-height:1.2;letter-spacing:-0.015em;color:${BRAND.textPrimary};">Welcome to Vitalis, ${safeFirst}!</h1>
              <p style="margin:0 auto;max-width:360px;font-family:${BRAND.fontSans};font-size:14px;line-height:1.65;color:${BRAND.textSecondary};">Your account is live. Nutrition, training, and recovery &mdash; all in one performance OS.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>`;
}

/**
 * @param {{ name?: string, verifyUrl?: string | null, provider?: "email" | "google" | "sms", ctaUrl?: string }} props
 * @returns {{ subject: string, html: string, text: string }}
 */
function welcomeEmail({ name, verifyUrl = null, provider = "email", ctaUrl } = {}) {
  const first = firstName(name);
  const safeFirst = escapeHtml(first);
  const startUrl = escapeHtml(ctaUrl || appUrl("/onboarding"));
  const safeVerify = verifyUrl ? escapeHtml(verifyUrl) : null;

  const accountLine =
    provider === "google"
      ? `You signed up with ${renderStrong("Google")}, so your email is already confirmed. Next time, just tap &ldquo;Continue with Google&rdquo;.`
      : provider === "sms"
        ? `Confirm your mobile number with the 6-digit code we texted you to keep account recovery working.`
        : `You're already signed in &mdash; pick up right where you left off on any device with your email and password.`;

  const verifyBlock = safeVerify
    ? renderIconCallout({
        icon: "mailSolid",
        title: "Confirm your email",
        accent: true,
        bodyHtml: "One quick tap keeps password recovery and security alerts working. The link expires in 24 hours.",
        actionHtml: `<p style="margin:12px 0 0;"><a href="${safeVerify}" target="_blank" style="font-family:${BRAND.fontSans};font-size:13px;font-weight:700;letter-spacing:0.04em;color:${BRAND.accent};text-decoration:none;">Verify email &rarr;</a></p>`,
      })
    : "";

  const body = `
    ${verifyBlock}
    ${renderParagraph(accountLine)}
    ${renderButton({ href: startUrl, label: "SET UP MY PLAN", fullWidth: true })}
    ${renderDivider()}
    ${renderSubheading("Everything you need to perform")}
    ${renderFeatureGrid(FEATURES)}
    ${renderSubheading("Your first three moves")}
    ${renderSteps(STEPS)}
    ${safeVerify ? renderLinkFallback(safeVerify) : ""}
    ${renderMutedNote("Fuel your performance. Every rep and every meal counts.")}`;

  const text = [
    `Welcome to Vitalis, ${first}!`,
    "",
    "Your account is live. Nutrition, training, and recovery — all in one performance OS.",
    "",
    ...(verifyUrl ? ["Confirm your email (expires in 24 hours):", verifyUrl, ""] : []),
    `Set up your plan: ${ctaUrl || appUrl("/onboarding")}`,
    "",
    "What you can do:",
    ...FEATURES.map((f) => `- ${f.title}: ${f.description}`),
    "",
    "— The Vitalis team",
  ].join("\n");

  return {
    subject: `Welcome to Vitalis, ${first}!`,
    html: renderLayout({
      title: "Welcome to Vitalis",
      preheader: verifyUrl
        ? "Your account is live — confirm your email and set up your plan."
        : "Your account is live — let's set up your plan.",
      heroHtml: renderHero(safeFirst),
      bodyHtml: body,
      footerNote: `Didn't create a Vitalis account? Ignore this email or <a href="${escapeHtml(appUrl("/forgot-password"))}" target="_blank" style="color:${BRAND.accent};">secure the address</a>.`,
    }),
    text,
  };
}

module.exports = { welcomeEmail };
