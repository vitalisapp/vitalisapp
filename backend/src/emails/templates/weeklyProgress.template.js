const { BRAND, appUrl } = require("../theme");
const { renderLayout } = require("../layout/baseLayout");
const { escapeHtml } = require("../utils/escapeHtml");
const {
  renderEyebrow,
  renderHeading,
  renderParagraph,
  renderMutedNote,
  renderKeyValueTable,
  renderButton,
} = require("../components");

/**
 * Section 5 — weekly progress email (Sunday evening, opt-out in Preferences).
 * @param {{ name?: string, stats: { workouts: number, minutes: number, planned?: number|null,
 *   logDays: number, weightChangeKg?: number|null, streak?: number } , interpretation?: string }} props
 * @returns {{ subject: string, html: string, text: string }}
 */
function weeklyProgressEmail({ name, stats, interpretation } = {}) {
  const s = stats || {};
  const first = escapeHtml(String(name || "there").split(/\s+/)[0]);
  const weight = s.weightChangeKg == null
    ? "No weigh-in"
    : `${s.weightChangeKg > 0 ? "+" : ""}${s.weightChangeKg.toFixed(1)} kg`;
  const rows = [
    { label: "Workouts", value: s.planned ? `${s.workouts} of ${s.planned} planned` : String(s.workouts), color: BRAND.accent },
    { label: "Active minutes", value: `${s.minutes} min`, color: BRAND.info },
    { label: "Days with logs", value: `${s.logDays} of 7`, color: BRAND.accent2 },
    { label: "Weight change", value: weight, color: BRAND.warning },
  ];
  const progressUrl = appUrl("/logs");
  const prefsUrl = appUrl("/preferences");
  const note = interpretation ? escapeHtml(interpretation) : "";
  const body = `
    ${renderEyebrow("Your week in review")}
    ${renderHeading(`Time to check your progress, ${first}!`)}
    ${renderParagraph(note || "Here's what you did this week. Small, steady steps add up.")}
    ${renderKeyValueTable(rows)}
    ${renderButton({ href: progressUrl, label: "See my progress" })}
    ${renderMutedNote(`You get this weekly summary because weekly emails are on. <a href="${prefsUrl}">Turn it off in Preferences</a>.`)}`;
  const text = [
    `Time to check your progress, ${String(name || "there").split(/\s+/)[0]}!`,
    interpretation || "",
    `Workouts: ${rows[0].value}`,
    `Active minutes: ${rows[1].value}`,
    `Days with logs: ${rows[2].value}`,
    `Weight change: ${rows[3].value}`,
    `See your progress: ${progressUrl}`,
    `Turn off weekly emails: ${prefsUrl}`,
  ].filter(Boolean).join("\n");
  return {
    subject: "Your week in review — Vitalis",
    html: renderLayout({
      title: "Your week in review",
      preheader: `${s.workouts} workout${s.workouts === 1 ? "" : "s"} and ${s.minutes} active minutes this week.`,
      bodyHtml: body,
    }),
    text,
  };
}

/** Plain-language one-liner about the week (also used in the in-app note). */
function interpretWeek({ workouts, planned, logDays, weightChangeKg, goalType }) {
  const parts = [];
  if (planned) {
    if (workouts >= planned) parts.push(`You completed every planned workout (${workouts}/${planned}). Excellent consistency!`);
    else if (workouts >= Math.ceil(planned / 2)) parts.push(`You did ${workouts} of ${planned} planned workouts. Solid; aim for one more next week.`);
    else parts.push(`You did ${workouts} of ${planned} planned workouts. A lighter, shorter plan might fit your schedule better.`);
  } else if (workouts > 0) {
    parts.push(`You trained ${workouts} time${workouts === 1 ? "" : "s"} this week.`);
  }
  if (logDays >= 5) parts.push("Logging most days gives you the most accurate targets.");
  else if (logDays <= 2) parts.push("Try logging a little more often so your coach can help you better.");
  if (weightChangeKg != null && Math.abs(weightChangeKg) >= 0.2) {
    const down = weightChangeKg < 0;
    const fits = (goalType === "LOSE_WEIGHT" && down) || ((goalType === "GAIN_WEIGHT" || goalType === "BUILD_MUSCLE") && !down);
    parts.push(`Weight ${down ? "down" : "up"} ${Math.abs(weightChangeKg).toFixed(1)} kg${fits ? ", moving toward your goal" : ""}.`);
  }
  return parts.join(" ");
}

module.exports = { weeklyProgressEmail, interpretWeek };
