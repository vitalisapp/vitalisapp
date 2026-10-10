// Food-category detection, anchor DB, and macro validation/correction.
// Pure guards (keyword lists, plausibility clamps) around AI vision output.
const { devWarn } = require('./log');

// ─── FOOD CATEGORY DETECTION ──────────────────────────────────────────────────

const BREADED_FOOD_KEYWORDS = [
  'fried',
  'breaded',
  'battered',
  'crispy',
  'nugget',
  'tempura',
  'katsu',
  'schnitzel',
  'fish and chips',
  'popcorn chicken',
  'tender',
  'wing',
  'drumstick',
  'karaage',
  'panko',
  'chicken piece',
  'chickenjoy',
  'kwek',
  'fish ball',
  'kikiam',
  'calamares',
];

const ZERO_CARB_ALLOWED = [
  'grilled chicken breast',
  'plain grilled',
  'boiled egg',
  'hard boiled',
  'steamed fish',
  'grilled fish',
  'tuna steak',
  'salmon fillet',
  'beef steak',
  'pork chop grilled',
  'shrimp grilled',
  'bacon',
];

const ZERO_FAT_ALLOWED = [
  'steamed white rice',
  'plain rice',
  'fruit',
  'watermelon',
  'banana',
  'apple',
  'mango',
  'papaya',
  'grapes',
  'black coffee',
];

// Meaty / high-protein foods must never come back with 0g protein.
// Used for the protein floor + absurd-result reject below.
const MEATY_FOOD_KEYWORDS = [
  'burger',
  'cheeseburger',
  'chicken',
  'beef',
  'pork',
  'bacon',
  'steak',
  'meat',
  'fish',
  'tuna',
  'salmon',
  'shrimp',
  'egg',
  'hotdog',
  'hot dog',
  'sausage',
  'ham',
  'turkey',
  'duck',
  'crab',
  'lobster',
  'squid',
  'octopus',
  'mussel',
  'clam',
  'oyster',
  'scallop',
  'tofu',
  'tempeh',
  'seitan',
  'cheese',
  'yogurt',
  'kebab',
  'shawarma',
  'meatball',
  'patty',
  'fillet',
  'drumstick',
  'wing',
  'thigh',
  'breast',
  'lechon',
  'adobo',
  'sisig',
  'tapa',
  'tocino',
  'longganisa',
];

// Main-dish keywords for the absurd-low-calorie reject. A full meal
// photographed as the subject can never plausibly be < 120 kcal.
const MAIN_DISH_KEYWORDS = [
  'burger',
  'cheeseburger',
  'pizza',
  'pasta',
  'spaghetti',
  'rice',
  'chicken',
  'beef',
  'pork',
  'fish',
  'sandwich',
  'noodle',
  'pancit',
  'ramen',
  'steak',
  'chop',
  'fillet',
  'platter',
  'meal',
  'combo',
  'bucket',
  'spaghetti',
  'fries',
  'lasagna',
  'burrito',
  'taco',
  'kebab',
  'curry',
  'stew',
  'soup',
  'salmon',
  'tuna',
  'shrimp',
];

function isMeatyFood(foodName = '') {
  const lower = foodName.toLowerCase();
  return MEATY_FOOD_KEYWORDS.some((kw) => lower.includes(kw));
}

function isMainDish(foodName = '') {
  const lower = foodName.toLowerCase();
  return MAIN_DISH_KEYWORDS.some((kw) => lower.includes(kw));
}

function isBreadedFood(foodName = '') {
  const lower = foodName.toLowerCase();
  return BREADED_FOOD_KEYWORDS.some((kw) => lower.includes(kw));
}

function isZeroCarbAllowed(foodName = '') {
  const lower = foodName.toLowerCase();
  return ZERO_CARB_ALLOWED.some((kw) => lower.includes(kw));
}

function isZeroFatAllowed(foodName = '') {
  const lower = foodName.toLowerCase();
  return ZERO_FAT_ALLOWED.some((kw) => lower.includes(kw));
}

function extractPieceCount(foodName = '') {
  const match = foodName.match(/\(?\b(\d+)\s*p(?:cs|ieces?|c)?\b\)?/i);
  return match ? parseInt(match[1]) : null;
}

// ─── ANCHOR DB (canonical per-serving values, mirrors foodAnalysisPrompt) ────
// Used as a plausibility guard: if AI reports < 40% of the anchor-scaled
// expectation the item is rejected (next model tried); if > 250% it is
// pulled back toward the anchor and flagged low_confidence. Within band the
// photo-specific AI estimate is kept untouched.
const ANCHOR_DB = [
  { keys: ['double cheeseburger', 'double burger', 'double patty burger'], unit: 'pc', qty: 1, calories: 750, protein: 44, carbs: 44, fat: 40 },
  { keys: ['cheeseburger', 'burger'], unit: 'pc', qty: 1, calories: 550, protein: 30, carbs: 40, fat: 30 },
  { keys: ['chickenjoy', 'fried chicken'], unit: 'pc', qty: 1, calories: 310, protein: 22, carbs: 16, fat: 18 },
  { keys: ['steamed white rice', 'steamed rice', 'plain rice', 'cooked rice'], unit: 'cup', qty: 1, calories: 206, protein: 4, carbs: 45, fat: 0 },
  { keys: ['fried rice', 'garlic fried rice', 'sinangag'], unit: 'cup', qty: 1, calories: 295, protein: 6, carbs: 43, fat: 10 },
  { keys: ['jolly spaghetti', 'filipino spaghetti', 'sweet spaghetti'], unit: 'serving', qty: 1, calories: 440, protein: 14, carbs: 62, fat: 14 },
  { keys: ['carbonara'], unit: 'serving', qty: 1, calories: 520, protein: 18, carbs: 52, fat: 26 },
  { keys: ['pancit canton'], unit: 'serving', qty: 1, calories: 320, protein: 12, carbs: 48, fat: 8 },
  { keys: ['pancit bihon'], unit: 'serving', qty: 1, calories: 280, protein: 10, carbs: 44, fat: 6 },
  { keys: ['pizza'], unit: 'slice', qty: 1, calories: 270, protein: 11, carbs: 35, fat: 9 },
  { keys: ['fries', 'french fries'], unit: 'serving', qty: 1, calories: 365, protein: 4, carbs: 48, fat: 17 },
  { keys: ['chicken adobo'], unit: 'serving', qty: 1, calories: 320, protein: 28, carbs: 8, fat: 18 },
  { keys: ['sinigang'], unit: 'bowl', qty: 1, calories: 225, protein: 20, carbs: 11, fat: 10 },
  { keys: ['sisig'], unit: 'serving', qty: 1, calories: 480, protein: 28, carbs: 10, fat: 36 },
  { keys: ['lechon kawali'], unit: 'serving', qty: 1, calories: 480, protein: 22, carbs: 8, fat: 40 },
  { keys: ['crispy pata'], unit: 'serving', qty: 1, calories: 650, protein: 38, carbs: 10, fat: 50 },
  { keys: ['tocino'], unit: 'serving', qty: 1, calories: 220, protein: 14, carbs: 14, fat: 12 },
  { keys: ['longganisa'], unit: 'serving', qty: 1, calories: 240, protein: 10, carbs: 10, fat: 18 },
  { keys: ['tapa'], unit: 'serving', qty: 1, calories: 200, protein: 20, carbs: 4, fat: 12 },
  { keys: ['grilled chicken breast'], unit: 'pc', qty: 1, calories: 330, protein: 62, carbs: 0, fat: 7 },
  { keys: ['boiled egg', 'hard boiled egg', 'hard-boiled egg'], unit: 'pc', qty: 1, calories: 78, protein: 6, carbs: 1, fat: 5 },
  { keys: ['scrambled egg'], unit: 'serving', qty: 1, calories: 180, protein: 12, carbs: 2, fat: 14 },
  { keys: ['banana'], unit: 'pc', qty: 1, calories: 105, protein: 1, carbs: 27, fat: 0 },
  { keys: ['pandesal'], unit: 'pc', qty: 1, calories: 150, protein: 4, carbs: 28, fat: 2 },
  { keys: ['peach mango pie'], unit: 'pc', qty: 1, calories: 240, protein: 2, carbs: 36, fat: 10 },
  { keys: ['cola', 'softdrink', 'soft drink', 'soda'], unit: 'serving', qty: 1, calories: 140, protein: 0, carbs: 36, fat: 0 },
  { keys: ['milk tea', 'milktea', 'boba'], unit: 'serving', qty: 1, calories: 380, protein: 4, carbs: 72, fat: 8 },
  // Indian
  { keys: ['chicken biryani', 'biryani'], unit: 'serving', qty: 1, calories: 550, protein: 28, carbs: 58, fat: 20 },
  { keys: ['butter chicken', 'murgh makhani'], unit: 'serving', qty: 1, calories: 480, protein: 30, carbs: 14, fat: 32 },
  { keys: ['masala dosa', 'dosa'], unit: 'pc', qty: 1, calories: 320, protein: 7, carbs: 55, fat: 8 },
  { keys: ['naan', 'garlic naan'], unit: 'pc', qty: 1, calories: 260, protein: 7, carbs: 48, fat: 5 },
  // Middle-Eastern
  { keys: ['chicken shawarma', 'shawarma'], unit: 'serving', qty: 1, calories: 520, protein: 32, carbs: 42, fat: 22 },
  { keys: ['falafel'], unit: 'serving', qty: 1, calories: 380, protein: 12, carbs: 36, fat: 20 },
  { keys: ['hummus'], unit: 'serving', qty: 1, calories: 280, protein: 8, carbs: 20, fat: 18 },
  // Western / fine-dining
  { keys: ['caesar salad', 'chicken caesar'], unit: 'serving', qty: 1, calories: 420, protein: 30, carbs: 14, fat: 28 },
  { keys: ['salmon', 'grilled salmon'], unit: 'serving', qty: 1, calories: 380, protein: 34, carbs: 2, fat: 24 },
  { keys: ['steak', 'ribeye', 'sirloin'], unit: 'serving', qty: 1, calories: 520, protein: 42, carbs: 0, fat: 36 },
  { keys: ['ramen'], unit: 'bowl', qty: 1, calories: 550, protein: 24, carbs: 62, fat: 20 },
  { keys: ['pho'], unit: 'bowl', qty: 1, calories: 450, protein: 28, carbs: 58, fat: 8 },
];

// Parse "2 pcs" / "0.5 cup" / "250g" / "3 slices" / "1 bowl" from serving text.
function parseServingQuantity(serving = '') {
  const s = String(serving || '').toLowerCase();
  const m = s.match(/(\d+(?:\.\d+)?)\s*(cups?|pcs?|pieces?|g(?:rams?)?|kg|slices?|bowls?|servings?|plates?|bottles?|cans?|glasses?|sachets?)/);
  if (!m) return null;
  let qty = parseFloat(m[1]);
  let unit = m[2];
  if (unit.startsWith('kg')) { qty *= 1000; unit = 'g'; }
  else if (unit.startsWith('cup')) unit = 'cup';
  else if (unit[0] === 'p' || unit.startsWith('piece')) unit = 'pc';
  else if (unit.startsWith('slic')) unit = 'slice';
  else if (unit.startsWith('bowl')) unit = 'bowl';
  else if (unit.startsWith('serv') || unit.startsWith('plate')) unit = 'serving';
  else if (unit === 'g' || unit.startsWith('gram')) unit = 'g';
  else return { qty, unit: 'other' };
  return { qty, unit };
}

function anchorExpected(foodName = '', serving = '') {
  const lower = String(foodName || '').toLowerCase();
  const anchor = ANCHOR_DB.find((a) => a.keys.some((k) => lower.includes(k)));
  if (!anchor) return null;
  const parsed = parseServingQuantity(serving);
  // Scale when serving unit matches anchor unit (2 pcs burger = 2x).
  if (parsed && parsed.unit === anchor.unit && parsed.qty > 0 && parsed.qty <= 12) {
    const scale = parsed.qty / anchor.qty;
    return {
      calories: anchor.calories * scale,
      protein: anchor.protein * scale,
      carbs: anchor.carbs * scale,
      fat: anchor.fat * scale,
      scaled: true,
    };
  }
  return { ...anchor, scaled: false };
}

// ─── MACRO VALIDATION & CORRECTION ───────────────────────────────────────────

function validateAndCorrectMacros(parsed) {
  let { calories, protein, carbs, fat, food_name = '' } = parsed;
  let saturated_fat = Math.max(0, Number(parsed.saturated_fat ?? 0));
  let trans_fat = Math.max(0, Number(parsed.trans_fat ?? 0));
  let polyunsaturated_fat = Math.max(
    0,
    Number(parsed.polyunsaturated_fat ?? 0),
  );
  let monounsaturated_fat = Math.max(
    0,
    Number(parsed.monounsaturated_fat ?? 0),
  );

  // Clamp negatives
  protein = Math.max(0, Math.round(Number(protein) || 0));
  carbs = Math.max(0, Math.round(Number(carbs) || 0));
  fat = Math.max(0, Math.round(Number(fat) || 0));
  calories = Math.max(1, Math.round(Number(calories) || 0));
  // Clamp fats to 1 decimal
  saturated_fat = Math.round(saturated_fat * 10) / 10;
  trans_fat = Math.round(trans_fat * 10) / 10;
  polyunsaturated_fat = Math.round(polyunsaturated_fat * 10) / 10;
  monounsaturated_fat = Math.round(monounsaturated_fat * 10) / 10;
  const sumFats =
    saturated_fat + trans_fat + polyunsaturated_fat + monounsaturated_fat;
  if (sumFats > fat + 0.5) {
    const scale = fat / Math.max(sumFats, 1);
    saturated_fat = Math.round(saturated_fat * scale * 10) / 10;
    trans_fat = Math.round(trans_fat * scale * 10) / 10;
    polyunsaturated_fat = Math.round(polyunsaturated_fat * scale * 10) / 10;
    monounsaturated_fat = Math.round(monounsaturated_fat * scale * 10) / 10;
  }

  // Enforce carbs for breaded/starchy/sweet foods
  if (carbs === 0 && !isZeroCarbAllowed(food_name)) {
    devWarn(`[VITALIS IMAGE] Zero carb correction for "${food_name}"`);
    carbs = Math.max(5, Math.round((calories * 0.1) / 4));
  }

  // Enforce fat for fried/oily foods
  if (fat === 0 && !isZeroFatAllowed(food_name)) {
    devWarn(`[VITALIS IMAGE] Zero fat correction for "${food_name}"`);
    fat = Math.max(3, Math.round((calories * 0.08) / 9));
  }

  // Protein floor for meaty / high-protein foods — 0g protein for a
  // burger, chicken, egg, cheese etc. is never plausible (e.g. the
  // "Double Cheeseburger 47 kcal P0" case). Inject a minimum derived
  // from stated calories and flag low confidence.
  let low_confidence = false;
  if (protein === 0 && isMeatyFood(food_name)) {
    protein = Math.max(8, Math.round((calories * 0.15) / 4));
    low_confidence = true;
    devWarn(`[VITALIS IMAGE] Zero protein correction for "${food_name}" → ${protein}g (low confidence)`);
  }

  // Protein cap for fried chicken by piece count
  if (isBreadedFood(food_name)) {
    const pieceCount = extractPieceCount(food_name);
    if (pieceCount) {
      const maxProtein = pieceCount * 25;
      if (protein > maxProtein) {
        devWarn(
          `[VITALIS IMAGE] Protein cap: ${protein}g → ${maxProtein}g for ${pieceCount} pieces`,
        );
        protein = maxProtein;
      }
    }

    // Minimum carbs for breaded foods
    if (carbs < 10) {
      carbs = Math.max(15, Math.round((calories * 0.12) / 4));
    }
  }

  // Always recalculate calories from macros — macros are source of truth
  const macroCalories = protein * 4 + carbs * 4 + fat * 9;

  if (macroCalories > 0) {
    const diff = Math.abs(macroCalories - calories) / Math.max(calories, 1);
    if (diff > 0.05) {
      devWarn(
        `[VITALIS IMAGE] Calorie mismatch: stated=${calories}, macro-derived=${macroCalories} — using macro-derived`,
      );
      calories = macroCalories;
    }
  }

  // Sanity cap: single dishes rarely exceed 2500 kcal
  if (calories > 2500) {
    devWarn(`[VITALIS IMAGE] Calorie cap: ${calories} → 2500`);
    const scale = 2500 / calories;
    calories = 2500;
    protein = Math.round(protein * scale);
    carbs = Math.round(carbs * scale);
    fat = Math.round(fat * scale);
  }

  // Serving is free text from AI — cap length so it fits the DB column
  const serving =
    typeof parsed.serving === 'string'
      ? parsed.serving.trim().slice(0, 100)
      : '';

  // Absurd-result reject: a photographed main dish can never plausibly be
  // < 120 kcal with < 30g total macros (e.g. "Double Cheeseburger 47 kcal").
  // Return null so normalizeItems drops the item and analyzeFoodImage tries
  // the next model instead of showing a nonsense number.
  const totalMacros = protein + carbs + fat;
  if (isMainDish(food_name) && calories < 120 && totalMacros < 30) {
    devWarn(`[VITALIS IMAGE] Absurd result rejected for "${food_name}": ${calories} kcal P${protein}/C${carbs}/F${fat} — trying next model`);
    return null;
  }

  // Weight plausibility: when the model supplies estimated_weight_g,
  // kcal/g must be physically possible (0.05–9.5 covers lettuce → oil).
  // Outside that band the estimate is hallucinated → retry next model.
  const estW = Number(parsed.estimated_weight_g);
  if (estW > 0 && Number.isFinite(estW)) {
    const perGram = calories / estW;
    if (perGram < 0.05 || perGram > 9.5) {
      devWarn(`[VITALIS IMAGE] Weight implausible for "${food_name}": ${calories} kcal / ${estW}g = ${perGram.toFixed(2)}/g — trying next model`);
      return null;
    }
  }
  // Anchor plausibility guard: compare against the canonical per-serving
  // values (scaled when the serving parses, e.g. "2 pcs"). < 40% of anchor
  // means the model missed most of the food → reject (retry next model).
  // > 250% means hallucinated abundance → pull back to 1.5x anchor + flag.
  // Inside the band the photo-specific estimate is kept untouched.
  const expected = anchorExpected(food_name, serving);
  if (expected && expected.calories > 0) {
    if (calories < expected.calories * 0.4) {
      devWarn(`[VITALIS IMAGE] Anchor reject for "${food_name}": ${calories} kcal vs anchor ${Math.round(expected.calories)} — trying next model`);
      return null;
    }
    if (calories > expected.calories * 2.5) {
      const scale = (expected.calories * 1.5) / calories;
      calories = Math.round(expected.calories * 1.5);
      protein = Math.round(protein * scale);
      carbs = Math.round(carbs * scale);
      fat = Math.round(fat * scale);
      low_confidence = true;
      devWarn(`[VITALIS IMAGE] Anchor cap for "${food_name}" → ${calories} kcal (low confidence)`);
    }
  }

  return {
    ...parsed,
    serving,
    calories,
    protein,
    carbs,
    fat,
    saturated_fat,
    trans_fat,
    polyunsaturated_fat,
    monounsaturated_fat,
    ...(low_confidence ? { low_confidence: true } : {}),
  };
}

module.exports = {
  isMeatyFood,
  isMainDish,
  isBreadedFood,
  isZeroCarbAllowed,
  isZeroFatAllowed,
  extractPieceCount,
  parseServingQuantity,
  anchorExpected,
  validateAndCorrectMacros,
};
