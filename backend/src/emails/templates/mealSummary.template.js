const { BRAND } = require("../theme");
const { renderLayout } = require("../layout/baseLayout");
const { renderHeading, renderParagraph, renderMutedNote, renderKeyValueTable } = require("../components");

/**
 * @param {{ summary?: { calories?: number | string, protein?: number | string, carbs?: number | string, fat?: number | string } }} props
 * @returns {{ subject: string, html: string }}
 */
function mealSummaryEmail({ summary } = {}) {
  const n = (v) => (Number.isFinite(Number(v)) ? Math.round(Number(v)) : 0);
  const s = {
    calories: n(summary?.calories),
    protein: n(summary?.protein),
    carbs: n(summary?.carbs),
    fat: n(summary?.fat),
  };
  const rows = [
    { label: "Calories", value: `${s.calories} kcal`, color: BRAND.accent },
    { label: "Protein", value: `${s.protein} g`, color: BRAND.info },
    { label: "Carbs", value: `${s.carbs} g`, color: BRAND.accent2 },
    { label: "Fat", value: `${s.fat} g`, color: BRAND.warning },
  ];
  const body = `
    ${renderHeading("Daily nutrition summary")}
    ${renderParagraph("Here's what you've consumed today. Keep fueling your performance!")}
    ${renderKeyValueTable(rows)}
    ${renderMutedNote("You received this because you logged a meal on Vitalis.")}`;
  return {
    subject: "Your Daily Nutrition Summary — Vitalis",
    html: renderLayout({
      title: "Daily nutrition summary",
      preheader: `${s.calories} kcal logged today.`,
      bodyHtml: body,
    }),
  };
}

module.exports = { mealSummaryEmail };
