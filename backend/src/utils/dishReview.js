// Scan-item review: attaches what the result screen needs so the user can
// confirm or correct a dish before saving — the matched reference (per-100 g),
// "Did you mean…" alternatives, and the concrete reasons an item is uncertain.
// Pure, no I/O. Runs after validateAndCorrectMacros.

const { findDish, nutritionFor, referenceOf, lookalikesFor } = require('./filipinoDishes');

// Stable codes; the client maps them to short user-facing text.
const REVIEW_REASONS = [
  'model_unsure',     // the model itself flagged low confidence
  'dish_unclear',     // identity uncertain (dish_confidence: low)
  'portion_unusual',  // weight/kcal implausible for any food or a main dish
  'calories_unusual', // kcal far from the reference dish at this weight
  'macros_incomplete',// missing calories or 0 g protein on a meaty dish
  'macro_mismatch',   // P×4 + C×4 + F×9 disagrees with kcal by > 5 %
];

const MAX_ALTERNATIVES = 3;

function cleanName(value) {
  return String(value || '').replace(/[\u0000-\u001f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 60);
}

function normalizedConfidence(value) {
  const v = String(value || '').toLowerCase();
  return v === 'high' || v === 'medium' || v === 'low' ? v : null;
}

/**
 * @param {object} item validated scan item
 * @param {string[]} reasons reasons collected by the macro checks
 */
function reviewDish(item, reasons = []) {
  const out = { ...item };
  const why = new Set(reasons.filter((r) => REVIEW_REASONS.includes(r)));

  const dish = findDish(item.food_name);
  const dishConfidence = normalizedConfidence(item.dish_confidence);
  if (dishConfidence) out.dish_confidence = dishConfidence;
  else delete out.dish_confidence;
  if (dishConfidence === 'low') why.add('dish_unclear');

  // Calories vs the reference dish at the model's own visible weight. Wide
  // band on purpose: recipes vary a lot; only clear outliers are flagged.
  const grams = Number(item.estimated_weight_g);
  if (dish && Number.isFinite(grams) && grams > 0) {
    const expected = nutritionFor(dish, grams);
    const kcal = Number(item.calories) || 0;
    if (expected && expected.calories > 0 && (kcal < expected.calories * 0.5 || kcal > expected.calories * 2)) {
      why.add('calories_unusual');
    }
  }

  // Alternatives: the model's own suggestions first, then known look-alikes.
  const seen = new Set([String(dish?.name || item.food_name).toLowerCase()]);
  const alternatives = [];
  const push = (alt) => {
    if (!alt || !alt.name || alternatives.length >= MAX_ALTERNATIVES) return;
    const k = alt.name.toLowerCase();
    if (seen.has(k)) return;
    seen.add(k);
    alternatives.push(alt);
  };
  const modelAlts = Array.isArray(item.alternatives) ? item.alternatives : [];
  for (const raw of modelAlts.slice(0, 6)) {
    const name = cleanName(typeof raw === 'string' ? raw : raw?.name);
    if (name.length < 2) continue;
    const match = findDish(name);
    push(match ? referenceOf(match) : { name });
  }
  for (const alt of lookalikesFor(dish, MAX_ALTERNATIVES)) push(alt);

  if (alternatives.length) out.alternatives = alternatives;
  else delete out.alternatives;
  if (dish) out.reference = referenceOf(dish);
  else delete out.reference;

  if (why.size) {
    out.low_confidence = true;
    out.review_reasons = REVIEW_REASONS.filter((r) => why.has(r));
  } else {
    delete out.review_reasons;
    if (!item.low_confidence) delete out.low_confidence;
  }
  return out;
}

module.exports = { reviewDish, REVIEW_REASONS };
