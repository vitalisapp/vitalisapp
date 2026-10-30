// Per-100 g nutrition math shared by the food catalog, the AI density
// estimator and gram-based manual entry. Pure functions only — unit tested
// in tests/unit/nutrition.test.js. The frontend mirrors these rules in
// frontend/src/lib/nutrition.js (same rounding, same clamps).
const MAX_KCAL_PER_100G = 900;
const MAX_MACRO_PER_100G = 100;
const MAX_GRAMS = 10000;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function round1(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 10) / 10;
}

function roundKcal(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.round(n);
}

// Empty / 0 / non-numeric means "no weight given" → null (not 0).
function normalizeGrams(value) {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  return clamp(Math.round(n * 10) / 10, 0.1, MAX_GRAMS);
}

// Cache key for AI density estimates: case/punctuation/whitespace insensitive.
function normalizeFoodName(name) {
  return String(name || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);
}

// Catalog rows store per-reference-serving values. Convert to per 100 g so a
// user-entered weight can scale them. Returns null when the serving has no
// trustworthy gram weight.
function per100FromServing(item = {}) {
  const grams = Number(item.serving_grams);
  if (!Number.isFinite(grams) || grams <= 0) return null;
  const factor = 100 / grams;
  return {
    calories: clamp(roundKcal((Number(item.calories) || 0) * factor), 0, MAX_KCAL_PER_100G),
    protein: clamp(round1((Number(item.protein) || 0) * factor), 0, MAX_MACRO_PER_100G),
    carbs: clamp(round1((Number(item.carbs) || 0) * factor), 0, MAX_MACRO_PER_100G),
    fat: clamp(round1((Number(item.fat) || 0) * factor), 0, MAX_MACRO_PER_100G),
  };
}

// Scale a per-100 g density to an actual portion. Null for an empty weight so
// the form can clear stale macro values instead of saving them.
function scaleFromPer100(per100, grams) {
  const g = normalizeGrams(grams);
  if (!g || !per100 || typeof per100 !== "object") return null;
  const factor = g / 100;
  return {
    grams: g,
    calories: Math.max(0, roundKcal((Number(per100.calories) || 0) * factor)),
    protein: Math.max(0, round1((Number(per100.protein) || 0) * factor)),
    carbs: Math.max(0, round1((Number(per100.carbs) || 0) * factor)),
    fat: Math.max(0, round1((Number(per100.fat) || 0) * factor)),
  };
}

// Atwater estimate — used when a user overrides a macro by hand.
function kcalFromMacros({ protein = 0, carbs = 0, fat = 0 } = {}) {
  return Math.max(
    0,
    Math.round((Number(protein) || 0) * 4 + (Number(carbs) || 0) * 4 + (Number(fat) || 0) * 9),
  );
}

// Guard AI output before it can be cached or sent to a client: all four values
// required, non-negative, physically plausible, and not an all-zero row.
// AI models drift on formatting ("14 g", "160 kcal", "1,200", nested
// `per_100g`), so numbers are coerced and common wrappers unwrapped before
// validation — a unit suffix should not fail the whole estimate.
function toNutrientNumber(value) {
  if (typeof value === "number") return value;
  if (typeof value !== "string") return NaN;
  const cleaned = value.replace(/,/g, "").trim();
  if (!cleaned) return NaN;
  const direct = Number(cleaned);
  if (Number.isFinite(direct)) return direct;
  const match = cleaned.match(/-?\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : NaN;
}

const DENSITY_WRAPPERS = [
  "per100",
  "per_100g",
  "per100g",
  "per_100",
  "nutrition",
  "macros",
  "values",
  "data",
];

function unwrapDensity(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return input;
  for (const key of DENSITY_WRAPPERS) {
    const nested = input[key];
    if (nested && typeof nested === "object" && !Array.isArray(nested)) return nested;
  }
  return input;
}

function sanitizeDensity(input) {
  const src = unwrapDensity(input);
  if (!src || typeof src !== "object") return null;

  const calories = toNutrientNumber(src.calories ?? src.kcal ?? src.energy ?? src.energy_kcal);
  const protein = toNutrientNumber(src.protein ?? src.proteins);
  const carbs = toNutrientNumber(src.carbs ?? src.carbohydrates ?? src.carbohydrate);
  const fat = toNutrientNumber(src.fat ?? src.fats);
  if (![calories, protein, carbs, fat].every(Number.isFinite)) return null;

  const density = {
    calories: clamp(roundKcal(calories), 0, MAX_KCAL_PER_100G),
    protein: clamp(round1(protein), 0, MAX_MACRO_PER_100G),
    carbs: clamp(round1(carbs), 0, MAX_MACRO_PER_100G),
    fat: clamp(round1(fat), 0, MAX_MACRO_PER_100G),
  };
  if (density.calories === 0 && density.protein === 0 && density.carbs === 0 && density.fat === 0) {
    return null;
  }
  return density;
}

module.exports = {
  MAX_KCAL_PER_100G,
  MAX_MACRO_PER_100G,
  MAX_GRAMS,
  clamp,
  round1,
  roundKcal,
  normalizeGrams,
  normalizeFoodName,
  per100FromServing,
  scaleFromPer100,
  kcalFromMacros,
  sanitizeDensity,
};
