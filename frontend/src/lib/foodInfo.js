// Section 6 — sugar / sodium monitoring against WHO guidance, plus a goal-based
// reading of the day. Pure (unit-tested in tests/unit/foodInfo.test.js).
//   Sodium: under 2,000 mg a day (about 1 teaspoon of salt).
//   Sugar:  under 50 g a day, ideally under 25 g.

export const LIMITS = Object.freeze({ sodium: 2000, sugar: 50, sugarIdeal: 25 });

const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

/** Sum sugar / sodium for the day's entries; tracks how many entries had data. */
export function sugarSodiumTotals(entries = []) {
  let sugar = 0;
  let sodium = 0;
  let known = 0;
  let topSodium = null;
  let topSugar = null;
  for (const e of entries) {
    const hasSugar = e?.sugar != null && e.sugar !== '';
    const hasSodium = e?.sodium != null && e.sodium !== '';
    if (hasSugar || hasSodium) known += 1;
    if (hasSugar) {
      sugar += num(e.sugar);
      if (!topSugar || num(e.sugar) > num(topSugar.sugar)) topSugar = e;
    }
    if (hasSodium) {
      sodium += num(e.sodium);
      if (!topSodium || num(e.sodium) > num(topSodium.sodium)) topSodium = e;
    }
  }
  return {
    sugar: Math.round(sugar * 10) / 10,
    sodium: Math.round(sodium),
    known,
    total: entries.length,
    topSodium: topSodium && num(topSodium.sodium) > 0 ? { name: topSodium.food_name, value: Math.round(num(topSodium.sodium)) } : null,
    topSugar: topSugar && num(topSugar.sugar) > 0 ? { name: topSugar.food_name, value: Math.round(num(topSugar.sugar) * 10) / 10 } : null,
  };
}

function status(value, limit, soft) {
  if (value >= limit) return 'over';
  if (value >= soft) return 'near';
  return 'ok';
}

/** Status + plain-language message for each nutrient. */
export function limitStatus({ sugar = 0, sodium = 0, topSodium = null, topSugar = null } = {}) {
  const sodiumStatus = status(sodium, LIMITS.sodium, LIMITS.sodium * 0.8);
  const sugarStatus = status(sugar, LIMITS.sugar, LIMITS.sugarIdeal);
  const sodiumMsg = {
    ok: 'Within the daily limit.',
    near: `Close to the ${LIMITS.sodium.toLocaleString()} mg limit. Choose low-salt foods for the rest of the day.`,
    over: `Over the daily limit${topSodium ? `. ${topSodium.name} added the most` : ''}. Drink water and skip extra soy sauce, patis or bagoong.`,
  }[sodiumStatus];
  const sugarMsg = {
    ok: `Under the ideal ${LIMITS.sugarIdeal} g.`,
    near: `Above the ideal ${LIMITS.sugarIdeal} g but under ${LIMITS.sugar} g. Go easy on sweet drinks and desserts.`,
    over: `Over ${LIMITS.sugar} g${topSugar ? `. ${topSugar.name} added the most` : ''}. Swap sweet drinks for water.`,
  }[sugarStatus];
  return {
    sodium: { value: sodium, limit: LIMITS.sodium, status: sodiumStatus, pct: Math.min(100, Math.round((sodium / LIMITS.sodium) * 100)), message: sodiumMsg },
    sugar: { value: sugar, limit: LIMITS.sugar, ideal: LIMITS.sugarIdeal, status: sugarStatus, pct: Math.min(100, Math.round((sugar / LIMITS.sugar) * 100)), message: sugarMsg },
  };
}

/** One-line reading of today's intake for the user's goal. */
export function goalIntakeNote({ goalType, calories = 0, calorieGoal = 0, protein = 0, proteinGoal = 0, entries = 0 } = {}) {
  if (!entries) return 'Log a meal to see how today fits your goal.';
  const kcalPct = calorieGoal > 0 ? calories / calorieGoal : 0;
  const proteinLeft = Math.max(0, Math.round(proteinGoal - protein));
  const proteinTip = proteinLeft > 15 ? ` You still need about ${proteinLeft} g protein. Try eggs, chicken, fish or tofu.` : '';
  if (goalType === 'LOSE_WEIGHT') {
    if (kcalPct > 1.05) return `You're over your calorie target for weight loss. A lighter, grilled or steamed dinner will help.${proteinTip}`;
    return `On track for weight loss: ${Math.round(Math.max(0, calorieGoal - calories))} kcal left.${proteinTip}`;
  }
  if (goalType === 'BUILD_MUSCLE') {
    return proteinLeft > 15 ? `For muscle building, protein matters most today.${proteinTip}` : 'Protein target almost reached. Great for muscle recovery!';
  }
  if (goalType === 'GAIN_WEIGHT') {
    if (kcalPct < 0.8) return `To gain weight, you need about ${Math.round(calorieGoal - calories)} more kcal today. Add rice, eggs, nuts or a snack.`;
    return 'Good energy intake for weight gain today.';
  }
  if (kcalPct > 1.1) return 'A bit above your maintenance calories today. Balance it with a lighter meal.';
  return `Balanced so far for maintaining your weight.${proteinTip}`;
}
