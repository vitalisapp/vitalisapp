// ─────────────────────────────────────────────────────────────────────────────
// Email templates — single entry point.
//
//   emails/
//     theme.js            design tokens (mirror frontend/src/index.css) + asset/app URLs
//     utils/escapeHtml.js HTML escaping for user-supplied values
//     layout/             branded shell (header logo, card, footer)
//     components/         reusable blocks (heading, button, panel, feature grid…)
//     templates/          one file per email; each returns { subject, html, text? }
//
// Usage:
//   const emails = require("../emails");
//   const { subject, html, text } = emails.welcomeEmail({ name, verifyUrl });
//
// Sending lives in services/email.service.js; transport in config/mailer.js.
// Image assets: scripts/generate-email-assets.js → frontend/public/email/.
// ─────────────────────────────────────────────────────────────────────────────

const { BRAND, ICONS, assetUrl, appUrl } = require("./theme");
const { escapeHtml } = require("./utils/escapeHtml");
const { renderLayout } = require("./layout/baseLayout");
const components = require("./components");

module.exports = {
  // building blocks
  BRAND,
  ICONS,
  assetUrl,
  appUrl,
  escapeHtml,
  renderLayout,
  ...components,
  // templates
  ...require("./templates/welcome.template"),
  ...require("./templates/verification.template"),
  ...require("./templates/passwordReset.template"),
  ...require("./templates/passwordChanged.template"),
  ...require("./templates/mealSummary.template"),
  ...require("./templates/feedback.template"),
  ...require("./templates/emailChanged.template"),
  ...require("./templates/weeklyProgress.template"),
};
