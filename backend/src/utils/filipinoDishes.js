// Filipino dish reference — per-100 g nutrition, typical serving and the dishes
// each one is most often confused with in photos.
//
// SOURCE: the calibration anchors already used in constants/foodAnalysisPrompt.js,
// converted to per-100 g (steamed rice uses the USDA cooked-rice value). These are
// APPROXIMATE home-cooked averages, not lab values. Cross-check and replace with
// the FNRI Philippine Food Composition Table (PhilFCT, https://i.fnri.dost.gov.ph)
// when official numbers are available — this file is the single place to edit.
//
// Used for: (1) sanity-checking AI scan estimates against the visible weight,
// (2) "Did you mean…" alternatives on the scan result, (3) instant, free
// recalculation when a user corrects the dish or weight, (4) the density
// endpoint (reference first, AI only for unknown dishes). Pure, no I/O.

const DISHES = [
  // Adobo family — dark soy-vinegar glaze, garlic, bay leaf
  { key: 'chicken_adobo', name: 'Chicken adobo', aliases: ['chicken adobo', 'adobong manok', 'adobo chicken', 'adobo'], per100: { calories: 160, protein: 14, carbs: 4, fat: 9 }, serving: { label: '1 serving', grams: 200 }, group: 'adobo' },
  { key: 'pork_adobo', name: 'Pork adobo', aliases: ['pork adobo', 'adobong baboy', 'adobo pork'], per100: { calories: 253, protein: 16.7, carbs: 4, fat: 18.7 }, serving: { label: '1 serving', grams: 150 }, group: 'adobo' },

  // Tomato-based stews — red-orange sauce, potato, carrot, bell pepper
  { key: 'caldereta', name: 'Caldereta', aliases: ['caldereta', 'kaldereta', 'beef caldereta', 'goat caldereta'], per100: { calories: 175, protein: 12, carbs: 8, fat: 10 }, serving: { label: '1 serving', grams: 200 }, group: 'tomato_stew' },
  { key: 'mechado', name: 'Mechado', aliases: ['mechado', 'beef mechado'], per100: { calories: 160, protein: 11, carbs: 7, fat: 9 }, serving: { label: '1 serving', grams: 200 }, group: 'tomato_stew' },
  { key: 'menudo', name: 'Pork menudo', aliases: ['menudo', 'pork menudo'], per100: { calories: 150, protein: 10, carbs: 9, fat: 7 }, serving: { label: '1 serving', grams: 200 }, group: 'tomato_stew' },
  { key: 'giniling', name: 'Giniling', aliases: ['giniling', 'pork giniling', 'ground pork'], per100: { calories: 193, protein: 12, carbs: 8, fat: 12 }, serving: { label: '1 serving', grams: 150 }, group: 'tomato_stew' },

  // Peanut stew
  { key: 'kare_kare', name: 'Kare-kare', aliases: ['kare-kare', 'kare kare', 'karekare', 'oxtail kare-kare'], per100: { calories: 168, protein: 12, carbs: 5.6, fat: 10.4 }, serving: { label: '1 serving', grams: 250 }, group: 'peanut_stew' },

  // Clear / sour soups
  { key: 'sinigang_baboy', name: 'Sinigang na baboy', aliases: ['sinigang na baboy', 'pork sinigang', 'sinigang pork', 'sinigang'], per100: { calories: 60, protein: 5.1, carbs: 3.4, fat: 2.6 }, serving: { label: '1 bowl', grams: 350 }, group: 'soup' },
  { key: 'sinigang_salmon', name: 'Sinigang na salmon', aliases: ['sinigang na salmon', 'salmon sinigang', 'sinigang sa miso'], per100: { calories: 69, protein: 6.3, carbs: 2.9, fat: 3.1 }, serving: { label: '1 bowl', grams: 350 }, group: 'soup' },
  { key: 'tinola', name: 'Tinola', aliases: ['tinola', 'chicken tinola', 'tinolang manok'], per100: { calories: 60, protein: 6.7, carbs: 2.7, fat: 2 }, serving: { label: '1 bowl', grams: 300 }, group: 'soup' },
  { key: 'nilaga', name: 'Nilaga', aliases: ['nilaga', 'nilagang baka', 'nilagang baboy', 'beef nilaga'], per100: { calories: 83, protein: 7.3, carbs: 4.7, fat: 3.3 }, serving: { label: '1 bowl', grams: 300 }, group: 'soup' },
  { key: 'bulalo', name: 'Bulalo', aliases: ['bulalo', 'beef bulalo'], per100: { calories: 112, protein: 8.8, carbs: 2.5, fat: 7.5 }, serving: { label: '1 bowl', grams: 400 }, group: 'soup' },

  // Coconut-milk dishes
  { key: 'ginataang_manok', name: 'Ginataang manok', aliases: ['ginataang manok', 'chicken ginataan', 'ginataang chicken'], per100: { calories: 190, protein: 13, carbs: 4, fat: 13 }, serving: { label: '1 serving', grams: 200 }, group: 'coconut' },
  { key: 'bicol_express', name: 'Bicol express', aliases: ['bicol express'], per100: { calories: 227, protein: 10.7, carbs: 6.7, fat: 17.3 }, serving: { label: '1 serving', grams: 150 }, group: 'coconut' },
  { key: 'laing', name: 'Laing', aliases: ['laing'], per100: { calories: 220, protein: 6, carbs: 10, fat: 18 }, serving: { label: '1 serving', grams: 100 }, group: 'coconut' },

  // Crispy / grilled pork
  { key: 'lechon_kawali', name: 'Lechon kawali', aliases: ['lechon kawali'], per100: { calories: 320, protein: 14.7, carbs: 5.3, fat: 26.7 }, serving: { label: '3 pcs', grams: 150 }, group: 'crispy_pork' },
  { key: 'crispy_pata', name: 'Crispy pata', aliases: ['crispy pata'], per100: { calories: 260, protein: 15.2, carbs: 4, fat: 20 }, serving: { label: '1 serving', grams: 250 }, group: 'crispy_pork' },
  { key: 'liempo', name: 'Grilled liempo', aliases: ['liempo', 'inihaw na liempo', 'grilled pork belly'], per100: { calories: 280, protein: 14.7, carbs: 1.3, fat: 24 }, serving: { label: '1 slab', grams: 150 }, group: 'crispy_pork' },
  { key: 'sisig', name: 'Sisig', aliases: ['sisig', 'sizzling sisig', 'pork sisig'], per100: { calories: 240, protein: 14, carbs: 5, fat: 18 }, serving: { label: '1 plate', grams: 200 }, group: 'crispy_pork' },

  // Other mains
  { key: 'dinuguan', name: 'Dinuguan', aliases: ['dinuguan'], per100: { calories: 160, protein: 10, carbs: 4, fat: 11 }, serving: { label: '1 cup', grams: 200 }, group: 'dark_stew' },
  { key: 'binagoongan', name: 'Binagoongang baboy', aliases: ['binagoongang baboy', 'binagoongan'], per100: { calories: 253, protein: 13.3, carbs: 4, fat: 20 }, serving: { label: '1 serving', grams: 150 }, group: 'dark_stew' },
  { key: 'bistek', name: 'Bistek tagalog', aliases: ['bistek', 'bistek tagalog', 'beef steak tagalog'], per100: { calories: 207, protein: 17.3, carbs: 5.3, fat: 12 }, serving: { label: '1 serving', grams: 150 }, group: 'adobo' },
  { key: 'pinakbet', name: 'Pinakbet', aliases: ['pinakbet', 'pakbet'], per100: { calories: 93, protein: 5.3, carbs: 8, fat: 4 }, serving: { label: '1 serving', grams: 150 }, group: 'veg' },
  { key: 'daing_bangus', name: 'Daing na bangus', aliases: ['daing na bangus', 'fried bangus', 'bangus'], per100: { calories: 187, protein: 18.7, carbs: 1.3, fat: 12 }, serving: { label: '1 pc', grams: 150 }, group: 'fish' },
  { key: 'paksiw_isda', name: 'Paksiw na isda', aliases: ['paksiw na isda', 'paksiw'], per100: { calories: 120, protein: 14.7, carbs: 2.7, fat: 5.3 }, serving: { label: '1 serving', grams: 150 }, group: 'fish' },

  // Breakfast (silog) meats
  { key: 'tocino', name: 'Tocino', aliases: ['tocino', 'pork tocino'], per100: { calories: 244, protein: 15.6, carbs: 15.6, fat: 13.3 }, serving: { label: '3 pcs', grams: 90 }, group: 'silog' },
  { key: 'longganisa', name: 'Longganisa', aliases: ['longganisa', 'longaniza'], per100: { calories: 300, protein: 12.5, carbs: 12.5, fat: 22.5 }, serving: { label: '2 pcs', grams: 80 }, group: 'silog' },
  { key: 'tapa', name: 'Beef tapa', aliases: ['tapa', 'beef tapa'], per100: { calories: 200, protein: 20, carbs: 4, fat: 12 }, serving: { label: '1 serving', grams: 100 }, group: 'silog' },

  // Rice, noodles, porridge
  { key: 'steamed_rice', name: 'Steamed white rice', aliases: ['steamed white rice', 'steamed rice', 'white rice', 'plain rice', 'kanin', 'rice'], per100: { calories: 130, protein: 2.7, carbs: 28.2, fat: 0.3 }, serving: { label: '1 cup', grams: 158 }, group: 'rice' },
  { key: 'garlic_rice', name: 'Garlic fried rice', aliases: ['garlic fried rice', 'garlic rice', 'sinangag', 'fried rice'], per100: { calories: 167, protein: 2.8, carbs: 24.4, fat: 5.6 }, serving: { label: '1 cup', grams: 180 }, group: 'rice' },
  { key: 'pancit_canton', name: 'Pancit canton', aliases: ['pancit canton', 'canton'], per100: { calories: 160, protein: 6, carbs: 24, fat: 4 }, serving: { label: '1 serving', grams: 200 }, group: 'noodles' },
  { key: 'pancit_bihon', name: 'Pancit bihon', aliases: ['pancit bihon', 'bihon'], per100: { calories: 140, protein: 5, carbs: 22, fat: 3 }, serving: { label: '1 serving', grams: 200 }, group: 'noodles' },
  { key: 'filipino_spaghetti', name: 'Filipino-style spaghetti', aliases: ['filipino spaghetti', 'sweet spaghetti', 'jolly spaghetti', 'spaghetti filipino'], per100: { calories: 192, protein: 7.2, carbs: 24.8, fat: 6.4 }, serving: { label: '1 serving', grams: 250 }, group: 'noodles' },
  { key: 'lugaw', name: 'Arroz caldo / lugaw', aliases: ['arroz caldo', 'lugaw', 'congee'], per100: { calories: 73, protein: 3.3, carbs: 12.7, fat: 1.3 }, serving: { label: '1 bowl', grams: 300 }, group: 'porridge' },
  { key: 'goto', name: 'Goto', aliases: ['goto'], per100: { calories: 87, protein: 4.7, carbs: 12, fat: 2 }, serving: { label: '1 bowl', grams: 300 }, group: 'porridge' },

  // Countable snacks (per piece weights let the UI scale by count)
  { key: 'lumpia_shanghai', name: 'Lumpia shanghai', aliases: ['lumpia shanghai', 'lumpiang shanghai', 'shanghai'], per100: { calories: 300, protein: 12.5, carbs: 20, fat: 20 }, serving: { label: '1 pc', grams: 20 }, pieceGrams: 20, group: 'snack' },
  { key: 'siomai', name: 'Siomai', aliases: ['siomai', 'shumai'], per100: { calories: 225, protein: 15, carbs: 15, fat: 12.5 }, serving: { label: '1 pc', grams: 20 }, pieceGrams: 20, group: 'snack' },
  { key: 'empanada', name: 'Empanada', aliases: ['empanada'], per100: { calories: 300, protein: 8.9, carbs: 31, fat: 15.6 }, serving: { label: '1 pc', grams: 90 }, pieceGrams: 90, group: 'snack' },
  { key: 'pandesal', name: 'Pandesal', aliases: ['pandesal', 'pan de sal'], per100: { calories: 300, protein: 8, carbs: 56, fat: 4 }, serving: { label: '1 pc', grams: 50 }, pieceGrams: 50, group: 'bread' },
];

// Photo look-alikes, most-confused first. Only listed dishes are suggested.
const LOOKALIKES = {
  chicken_adobo: ['pork_adobo', 'bistek', 'ginataang_manok'],
  pork_adobo: ['chicken_adobo', 'binagoongan', 'bistek'],
  caldereta: ['menudo', 'mechado', 'giniling'],
  mechado: ['caldereta', 'menudo'],
  menudo: ['caldereta', 'giniling', 'mechado'],
  giniling: ['menudo', 'caldereta'],
  kare_kare: ['caldereta', 'ginataang_manok'],
  sinigang_baboy: ['sinigang_salmon', 'nilaga', 'tinola'],
  sinigang_salmon: ['sinigang_baboy', 'paksiw_isda'],
  tinola: ['nilaga', 'sinigang_baboy'],
  nilaga: ['bulalo', 'tinola', 'sinigang_baboy'],
  bulalo: ['nilaga'],
  ginataang_manok: ['bicol_express', 'chicken_adobo'],
  bicol_express: ['ginataang_manok', 'laing'],
  laing: ['bicol_express'],
  lechon_kawali: ['liempo', 'crispy_pata', 'sisig'],
  crispy_pata: ['lechon_kawali'],
  liempo: ['lechon_kawali'],
  sisig: ['lechon_kawali', 'giniling'],
  dinuguan: ['binagoongan', 'pork_adobo'],
  binagoongan: ['pork_adobo', 'dinuguan'],
  bistek: ['chicken_adobo', 'pork_adobo'],
  steamed_rice: ['garlic_rice'],
  garlic_rice: ['steamed_rice'],
  pancit_canton: ['pancit_bihon'],
  pancit_bihon: ['pancit_canton'],
  lugaw: ['goto'],
  goto: ['lugaw'],
  lumpia_shanghai: ['empanada'],
  tocino: ['longganisa', 'tapa'],
  longganisa: ['tocino'],
  tapa: ['tocino', 'bistek'],
};

const BY_KEY = new Map(DISHES.map((d) => [d.key, d]));

// Longest alias first so "sinigang na salmon" beats "sinigang" and
// "garlic fried rice" beats "rice".
const ALIAS_INDEX = DISHES
  .flatMap((d) => d.aliases.map((alias) => ({ alias: normalize(alias), dish: d })))
  .sort((a, b) => b.alias.length - a.alias.length);

function normalize(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/\([^)]*\)/g, ' ')        // "(3 pcs)", "(~200g)"
    .replace(/[^a-z\s-]/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Best reference match for a free-text food name, or null. */
function findDish(foodName) {
  const n = ` ${normalize(foodName)} `;
  if (n.trim().length < 3) return null;
  const hit = ALIAS_INDEX.find(({ alias }) => n.includes(` ${alias.replace(/-/g, ' ')} `));
  return hit ? hit.dish : null;
}

function round1(v) {
  return Math.round(v * 10) / 10;
}

/** Nutrition for `grams` of a reference dish. */
function nutritionFor(dish, grams) {
  const g = Number(grams);
  if (!dish || !Number.isFinite(g) || g <= 0) return null;
  const f = g / 100;
  return {
    calories: Math.round(dish.per100.calories * f),
    protein: round1(dish.per100.protein * f),
    carbs: round1(dish.per100.carbs * f),
    fat: round1(dish.per100.fat * f),
  };
}

/** Public, client-safe shape of a dish (name + per-100 g + typical serving). */
function referenceOf(dish) {
  if (!dish) return null;
  return {
    name: dish.name,
    per100: { ...dish.per100 },
    serving: { ...dish.serving },
    ...(dish.pieceGrams ? { pieceGrams: dish.pieceGrams } : {}),
  };
}

/** "Did you mean…" list for a dish (reference shapes), excluding itself. */
function lookalikesFor(dish, limit = 3) {
  if (!dish) return [];
  return (LOOKALIKES[dish.key] || [])
    .map((k) => BY_KEY.get(k))
    .filter(Boolean)
    .slice(0, limit)
    .map(referenceOf);
}

module.exports = {
  DISHES,
  LOOKALIKES,
  normalize,
  findDish,
  nutritionFor,
  referenceOf,
  lookalikesFor,
};
