// Section 6 — food characteristics, category descriptions and goal fit. Pure.
//
// Traits come from two places: the preparation method (fried, grilled,
// steamed…) and the nutrients of one serving (high sodium, high sugar, high
// protein, oily…). Thresholds are per serving and based on WHO daily limits:
//   sodium < 2,000 mg/day, free sugar < 50 g/day (ideally < 25 g).

const LIMITS = Object.freeze({ sodium: 2000, sugar: 50, sugarIdeal: 25 });

const CATEGORIES = Object.freeze({
  fruit: { label: 'Fruit', icon: 'nutrition', description: 'Fresh or dried fruit. Natural sugar with fiber, vitamins and water.' },
  vegetable: { label: 'Vegetables', icon: 'eco', description: 'Low in calories, high in fiber and vitamins. Fill half your plate.' },
  salad: { label: 'Salads', icon: 'eco', description: 'Raw greens and vegetables. The dressing decides most of the calories.' },
  grain: { label: 'Rice & grains', icon: 'rice_bowl', description: 'Main carbohydrate source for energy. Portion size matters most.' },
  bread: { label: 'Bread & bakery', icon: 'bakery_dining', description: 'Baked flour products. Whole-grain options have more fiber.' },
  noodles: { label: 'Noodles & pasta', icon: 'ramen_dining', description: 'Carbohydrate dishes. Sauces and seasoning packets add sodium.' },
  breakfast: { label: 'Breakfast', icon: 'egg_alt', description: 'Morning meals, including Filipino silog plates.' },
  egg: { label: 'Eggs', icon: 'egg', description: 'Affordable complete protein. Boiled has no added fat.' },
  poultry: { label: 'Chicken & poultry', icon: 'kebab_dining', description: 'Lean protein, especially skinless and grilled.' },
  meat: { label: 'Pork & beef', icon: 'kebab_dining', description: 'Protein, iron and zinc. Fatty cuts and frying add a lot of calories.' },
  seafood: { label: 'Fish & seafood', icon: 'set_meal', description: 'Lean protein. Fatty fish like bangus and salmon give omega-3 fats.' },
  plant_protein: { label: 'Beans, tofu & legumes', icon: 'grass', description: 'Plant protein with fiber, like monggo and tofu.' },
  dairy: { label: 'Milk & dairy', icon: 'water_full', description: 'Protein and calcium. Flavored versions add sugar.' },
  nuts: { label: 'Nuts & seeds', icon: 'psychiatry', description: 'Healthy fats, but calorie-dense. A small handful is a serving.' },
  fat: { label: 'Fats & oils', icon: 'opacity', description: 'Pure fat. Small amounts add many calories.' },
  dish: { label: 'Main dishes', icon: 'dinner_dining', description: 'Cooked ulam and mixed dishes. Sauces often carry salt and fat.' },
  soup: { label: 'Soups', icon: 'soup_kitchen', description: 'Filling and hydrating. Broth and seasoning can be high in sodium.' },
  fast_food: { label: 'Fast food', icon: 'lunch_dining', description: 'Convenient but usually high in calories, fat and sodium.' },
  snack: { label: 'Snacks & street food', icon: 'cookie', description: 'Between-meal foods. Many are fried and salty.' },
  dessert: { label: 'Desserts & kakanin', icon: 'icecream', description: 'Sweet treats. Usually high in sugar, so enjoy in small portions.' },
  drink: { label: 'Drinks', icon: 'local_cafe', description: 'Liquid calories count too. Sweetened drinks are mostly sugar.' },
  sweetener: { label: 'Sweeteners', icon: 'water_drop', description: 'Added sugar, even when natural.' },
  supplement: { label: 'Supplements', icon: 'fitness_center', description: 'Convenient protein for active people.' },
});

const PREP_METHODS = Object.freeze({
  raw: { label: 'Raw / fresh', description: 'Eaten fresh, with no cooking fat added.' },
  boiled: { label: 'Boiled', description: 'Cooked in water, so no fat is added.' },
  steamed: { label: 'Steamed', description: 'Cooked with steam. One of the lightest methods, with no added fat.' },
  grilled: { label: 'Grilled', description: 'Cooked over heat, letting fat drip off. Little or no oil.' },
  roasted: { label: 'Roasted', description: 'Oven or spit-roasted. Some fat renders out.' },
  baked: { label: 'Baked', description: 'Cooked in an oven. Usually little added oil.' },
  simmered: { label: 'Simmered', description: 'Slow-cooked in liquid such as broth or vinegar.' },
  stewed: { label: 'Stewed / braised', description: 'Slow-cooked in a sauce. Sauces can add fat and salt.' },
  sauteed: { label: 'Sauteed (ginisa)', description: 'Quickly cooked in a little oil with garlic and onion.' },
  stir_fried: { label: 'Stir-fried', description: 'Cooked fast in a hot pan with oil.' },
  pan_fried: { label: 'Pan-fried', description: 'Cooked in a pan with a layer of oil.' },
  fried: { label: 'Fried', description: 'Cooked in hot oil. The food absorbs some of the oil.' },
  deep_fried: { label: 'Deep-fried', description: 'Fully submerged in oil. Absorbs the most fat of any method.' },
  dried: { label: 'Dried', description: 'Water removed, so sugar and calories are concentrated.' },
  fermented: { label: 'Fermented', description: 'Cultured by microbes, which can aid digestion.' },
  frozen: { label: 'Frozen dessert', description: 'Served cold. Usually sweetened.' },
  blended: { label: 'Blended', description: 'Mixed into a smooth paste or drink.' },
  brewed: { label: 'Brewed', description: 'Made by steeping in hot water.' },
  canned: { label: 'Canned', description: 'Preserved in a can. Often salted, so rinse when you can.' },
  processed: { label: 'Processed', description: 'Cured or preserved meat. Usually high in salt.' },
  packaged: { label: 'Packaged', description: 'Ready-made product. Check the label for sugar and sodium.' },
  none: { label: 'Ready to eat', description: 'No cooking needed.' },
});

const FRIED = new Set(['fried', 'deep_fried', 'pan_fried', 'stir_fried']);
const LIGHT_PREP = new Set(['steamed', 'boiled', 'grilled', 'raw', 'baked', 'simmered']);

const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

/**
 * Characteristic tags for one serving.
 * @param {{calories, protein, carbs, fat, sugar?, sodium?, serving_grams?, prep_method?}} f
 * @returns {{key: string, label: string, tone: 'good'|'warn'|'info'}[]}
 */
function foodTraits(f = {}) {
  const kcal = num(f.calories);
  const fat = num(f.fat);
  const protein = num(f.protein);
  const grams = num(f.serving_grams);
  const out = [];
  const add = (key, label, tone) => out.push({ key, label, tone });

  const prep = f.prep_method;
  if (prep === 'deep_fried') add('deep_fried', 'Deep-fried', 'warn');
  else if (FRIED.has(prep)) add('fried', prep === 'stir_fried' ? 'Stir-fried' : 'Fried', 'info');
  else if (prep === 'grilled') add('grilled', 'Grilled', 'good');
  else if (prep === 'steamed') add('steamed', 'Steamed', 'good');
  else if (prep === 'boiled') add('boiled', 'Boiled', 'good');
  else if (prep === 'baked' || prep === 'roasted') add(prep, PREP_METHODS[prep].label, 'info');

  const fatShare = kcal > 0 ? (fat * 9) / kcal : 0;
  const fatPer100 = grams > 0 ? (fat * 100) / grams : null;
  if (fat >= 10 && (fatShare >= 0.5 || (fatPer100 != null && fatPer100 >= 15)) && (FRIED.has(prep) || fatShare >= 0.6)) {
    add('oily', 'Oily', 'warn');
  }
  if (f.sodium != null) {
    if (num(f.sodium) >= 600) add('high_sodium', 'High sodium', 'warn');
    else if (num(f.sodium) <= 140) add('low_sodium', 'Low sodium', 'good');
  }
  if (f.sugar != null && num(f.sugar) >= 15) add('high_sugar', 'High sugar', 'warn');
  if (protein >= 20 || (kcal > 0 && (protein * 4) / kcal >= 0.35 && protein >= 10)) add('high_protein', 'High protein', 'good');
  if (grams > 0 && (kcal * 100) / grams <= 60 && kcal > 0) add('light', 'Light', 'good');
  else if (grams > 0 && (kcal * 100) / grams >= 350) add('calorie_dense', 'Calorie-dense', 'info');
  return out;
}

/**
 * How one serving fits the user's goal.
 * @returns {{level: 'great'|'ok'|'limit', note: string}}
 */
function goalFit(f = {}, goalType) {
  const traits = new Set(foodTraits(f).map((t) => t.key));
  const kcal = num(f.calories);
  const protein = num(f.protein);
  const proteinShare = kcal > 0 ? (protein * 4) / kcal : 0;
  const sugary = traits.has('high_sugar');
  const salty = traits.has('high_sodium');
  const oily = traits.has('oily') || traits.has('deep_fried');

  if (goalType === 'LOSE_WEIGHT') {
    if (oily || sugary || kcal >= 600) return { level: 'limit', note: oily ? 'Oily and calorie-heavy for weight loss. Choose a grilled or steamed version, or a smaller portion.' : sugary ? 'High in sugar. Fine as an occasional treat, but it adds calories that don\'t keep you full.' : 'A big portion of your daily calories. Consider sharing or a smaller serving.' };
    if (proteinShare >= 0.3 || traits.has('light')) return { level: 'great', note: 'Filling for few calories. A great fit for weight loss.' };
    return { level: 'ok', note: 'Fits a weight-loss plan in a normal portion.' };
  }
  if (goalType === 'BUILD_MUSCLE') {
    if (traits.has('high_protein')) return { level: 'great', note: 'High in protein, which helps build and repair muscle.' };
    if (sugary && protein < 5) return { level: 'limit', note: 'Mostly sugar with little protein. Pair it with a protein food.' };
    return { level: 'ok', note: protein < 10 ? 'Low in protein. Add eggs, chicken, fish or tofu to this meal.' : 'Adds some protein toward your daily target.' };
  }
  if (goalType === 'GAIN_WEIGHT') {
    if (kcal >= 350 && !sugary) return { level: 'great', note: 'Energy-rich. Helps you reach your calorie surplus.' };
    if (sugary) return { level: 'ok', note: 'Adds calories, but prefer energy from rice, eggs, meat and nuts over sugar.' };
    return { level: 'ok', note: 'Fine, but you may need a bigger portion or an extra snack to gain weight.' };
  }
  if (oily && salty) return { level: 'limit', note: 'Oily and salty. Enjoy occasionally to keep your weight and heart healthy.' };
  if (sugary || salty) return { level: 'ok', note: sugary ? 'High in sugar, so keep the portion small.' : 'High in sodium. Balance it with low-salt foods today.' };
  if (LIGHT_PREP.has(f.prep_method) || traits.has('high_protein')) return { level: 'great', note: 'A balanced choice for maintaining your weight.' };
  return { level: 'ok', note: 'Fits a balanced diet in a normal portion.' };
}

/** Daily sugar / sodium status against WHO limits. */
function dailyLimits({ sugar, sodium } = {}) {
  const s = num(sugar);
  const na = num(sodium);
  const status = (v, limit, soft) => (v >= limit ? 'over' : v >= soft ? 'near' : 'ok');
  return {
    sugar: { value: Math.round(s * 10) / 10, limit: LIMITS.sugar, ideal: LIMITS.sugarIdeal, status: status(s, LIMITS.sugar, LIMITS.sugarIdeal) },
    sodium: { value: Math.round(na), limit: LIMITS.sodium, status: status(na, LIMITS.sodium, LIMITS.sodium * 0.8) },
  };
}

/** Catalog row → API shape extras (category + prep descriptions, traits, goal fit). */
function describeFood(row, goalType) {
  const cat = CATEGORIES[row.category] || null;
  const prep = PREP_METHODS[row.prep_method] || null;
  return {
    category: row.category || null,
    category_label: cat?.label || null,
    category_description: cat?.description || null,
    category_icon: cat?.icon || 'restaurant',
    prep_method: row.prep_method || null,
    prep_label: prep?.label || null,
    prep_description: prep?.description || null,
    traits: foodTraits(row),
    goal_fit: goalType ? goalFit(row, goalType) : null,
  };
}

module.exports = { LIMITS, CATEGORIES, PREP_METHODS, foodTraits, goalFit, dailyLimits, describeFood };
