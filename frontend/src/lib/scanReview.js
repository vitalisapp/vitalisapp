// Confirm / correct a photo-scan item before saving (Revision #2).
// Pure helpers — unit tested in tests/unit/scanReview.test.js.
//
// The scan response (backend utils/dishReview.js) may carry per item:
//   grams            visible weight the AI estimated
//   reference        { name, per100, serving } matched dish (Filipino table)
//   alternatives     [{ name, per100? }] "Did you mean…"
//   review_reasons   codes explaining low_confidence
import { normalizeGrams, scaleFromPer100, round1, roundKcal } from './nutrition.js';

export const REASON_TEXT = {
  model_unsure: 'The AI was unsure about this item',
  dish_unclear: 'Dish may be something else — check the name',
  portion_unusual: 'Portion size looks unusual — check the weight',
  calories_unusual: 'Calories look unusual for this dish and weight',
  macros_incomplete: 'Some nutrients are missing — check the values',
  macro_mismatch: 'Calories and macros don’t fully add up (common for mixed dishes)',
};

// Informational only: the user cannot verify it from the photo, so it never
// triggers the "review before saving" prompt.
const INFO_ONLY = new Set(['macro_mismatch']);

export function reviewReasons(item) {
  const codes = Array.isArray(item?.review_reasons)
    ? item.review_reasons.filter((code) => REASON_TEXT[code])
    : [];
  // Older/cached results: flagged without a reason.
  if (!codes.length && item?.low_confidence) return ['model_unsure'];
  return codes;
}

/** True when a selected AI item should be checked before it is saved. */
export function needsReview(item) {
  if (!item || !item.selected || item.custom || item.reviewed) return false;
  return reviewReasons(item).some((code) => !INFO_ONLY.has(code));
}

export function itemsNeedingReview(items = []) {
  return items.filter(needsReview);
}

const FAT_PARTS = ['saturated_fat', 'trans_fat', 'polyunsaturated_fat', 'monounsaturated_fat'];

/**
 * Per-100 g density for the item's CURRENT dish: the matched reference when
 * there is one, else derived from the item's own values and weight.
 */
export function densityOf(item) {
  if (item?.reference?.per100) return item.reference.per100;
  const g = normalizeGrams(item?.grams);
  if (!g) return null;
  const f = 100 / g;
  return {
    calories: (Number(item.calories) || 0) * f,
    protein: (Number(item.protein) || 0) * f,
    carbs: (Number(item.carbs) || 0) * f,
    fat: (Number(item.fat) || 0) * f,
  };
}

function scaleParts(item, ratio, keys) {
  const out = {};
  for (const key of keys) {
    if (item[key] == null) continue;
    out[key] = key === 'sodium'
      ? Math.max(0, Math.round((Number(item[key]) || 0) * ratio))
      : Math.max(0, round1((Number(item[key]) || 0) * ratio));
  }
  return out;
}

/**
 * New values when the user changes the weight of the same dish. Returns null
 * when the weight is unusable or no density can be established.
 */
export function recalcForGrams(item, grams) {
  const g = normalizeGrams(grams);
  const per100 = densityOf(item);
  if (!g || !per100) return null;
  const scaled = scaleFromPer100(per100, g);
  const oldG = normalizeGrams(item.grams);
  const ratio = oldG ? g / oldG : null;
  return {
    ...scaled,
    ...(ratio ? scaleParts(item, ratio, [...FAT_PARTS, 'sugar', 'sodium']) : {}),
  };
}

/**
 * New values when the user picks a different dish (an alternative or a typed
 * name estimated by the server). Weight stays what the user sees; the fat
 * breakdown follows the new total fat; sugar/sodium become unknown unless the
 * new density provides them (old values belonged to the other dish).
 */
export function applyDish(item, dish, grams) {
  if (!dish?.per100) return null;
  const g = normalizeGrams(grams) || normalizeGrams(item?.grams) || normalizeGrams(dish.serving?.grams);
  if (!g) return null;
  const scaled = scaleFromPer100(dish.per100, g);
  const oldFat = Number(item?.fat) || 0;
  const fatRatio = oldFat > 0 ? scaled.fat / oldFat : 0;
  return {
    food_name: String(dish.name).slice(0, 150),
    reference: { name: dish.name, per100: dish.per100, ...(dish.serving ? { serving: dish.serving } : {}) },
    ...scaled,
    ...Object.fromEntries(FAT_PARTS.map((k) => [k, Math.max(0, round1((Number(item?.[k]) || 0) * fatRatio))])),
    sugar: scaled.sugar ?? null,
    sodium: scaled.sodium ?? null,
  };
}

/** Atwater kcal for an edited set of macros (shown while typing). */
export function kcalFor({ protein, carbs, fat }) {
  return Math.max(0, roundKcal((Number(protein) || 0) * 4 + (Number(carbs) || 0) * 4 + (Number(fat) || 0) * 9));
}
