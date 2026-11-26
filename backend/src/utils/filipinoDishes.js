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

  // Grilled / roasted (ihaw-ihaw)
  { key: 'chicken_inasal', name: 'Chicken inasal', aliases: ['chicken inasal', 'inasal', 'inasal na manok', 'mang inasal'], per100: { calories: 189, protein: 24, carbs: 2.2, fat: 10 }, serving: { label: '1 pc', grams: 180 }, group: 'grilled_chicken' },
  { key: 'lechon_manok', name: 'Lechon manok', aliases: ['lechon manok', 'roast chicken', 'rotisserie chicken'], per100: { calories: 215, protein: 25, carbs: 0, fat: 12.5 }, serving: { label: '1/4 chicken', grams: 200 }, group: 'grilled_chicken' },
  { key: 'lechon', name: 'Lechon', aliases: ['lechon', 'lechon baboy', 'roast pig', 'litson'], per100: { calories: 330, protein: 18, carbs: 0, fat: 28 }, serving: { label: '1 serving', grams: 150 }, group: 'crispy_pork' },
  { key: 'pork_bbq', name: 'Pork BBQ', aliases: ['pork bbq', 'pork barbecue', 'bbq stick', 'pork barbeque', 'inihaw na baboy'], per100: { calories: 250, protein: 18, carbs: 10, fat: 15 }, serving: { label: '1 stick', grams: 50 }, pieceGrams: 50, group: 'skewer' },
  { key: 'isaw', name: 'Isaw', aliases: ['isaw', 'chicken isaw', 'isaw ng manok', 'pork isaw'], per100: { calories: 200, protein: 13, carbs: 10, fat: 10 }, serving: { label: '1 stick', grams: 30 }, pieceGrams: 30, group: 'skewer' },

  // Fish & seafood
  { key: 'tilapia', name: 'Pritong tilapia', aliases: ['pritong tilapia', 'fried tilapia', 'tilapia'], per100: { calories: 190, protein: 22, carbs: 2, fat: 10 }, serving: { label: '1 pc', grams: 150 }, pieceGrams: 150, group: 'fish' },
  { key: 'galunggong', name: 'Pritong galunggong', aliases: ['pritong galunggong', 'fried galunggong', 'galunggong'], per100: { calories: 210, protein: 24, carbs: 0, fat: 12.5 }, serving: { label: '1 pc', grams: 80 }, pieceGrams: 80, group: 'fish' },
  { key: 'tuyo', name: 'Tuyo', aliases: ['tuyo', 'dried fish', 'daing'], per100: { calories: 300, protein: 50, carbs: 0, fat: 10 }, serving: { label: '1 pc', grams: 15 }, pieceGrams: 15, group: 'fish' },
  { key: 'tinapa', name: 'Tinapa', aliases: ['tinapa', 'smoked fish'], per100: { calories: 220, protein: 28, carbs: 0, fat: 12 }, serving: { label: '1 pc', grams: 60 }, pieceGrams: 60, group: 'fish' },
  { key: 'inihaw_bangus', name: 'Inihaw na bangus', aliases: ['inihaw na bangus', 'grilled bangus', 'grilled milkfish'], per100: { calories: 160, protein: 20, carbs: 0, fat: 8.5 }, serving: { label: '1 serving', grams: 200 }, group: 'fish' },
  { key: 'adobong_pusit', name: 'Adobong pusit', aliases: ['adobong pusit', 'squid adobo', 'pusit'], per100: { calories: 140, protein: 14.7, carbs: 5.3, fat: 6.7 }, serving: { label: '1 serving', grams: 150 }, group: 'seafood' },
  { key: 'calamares', name: 'Calamares', aliases: ['calamares', 'fried squid rings'], per100: { calories: 270, protein: 13, carbs: 20, fat: 15 }, serving: { label: '1 serving', grams: 100 }, group: 'seafood' },
  { key: 'kinilaw', name: 'Kinilaw', aliases: ['kinilaw', 'kilawin', 'kinilaw na isda'], per100: { calories: 100, protein: 18, carbs: 3, fat: 1.5 }, serving: { label: '1 serving', grams: 150 }, group: 'seafood' },

  // Vegetables & egg dishes
  { key: 'tortang_talong', name: 'Tortang talong', aliases: ['tortang talong', 'eggplant omelette', 'torta talong'], per100: { calories: 130, protein: 6, carbs: 6, fat: 9 }, serving: { label: '1 pc', grams: 150 }, pieceGrams: 150, group: 'veg' },
  { key: 'monggo', name: 'Ginisang monggo', aliases: ['ginisang monggo', 'monggo', 'mongo', 'mung bean stew', 'munggo'], per100: { calories: 90, protein: 6, carbs: 12, fat: 2.5 }, serving: { label: '1 cup', grams: 200 }, group: 'veg' },
  { key: 'chop_suey', name: 'Chop suey', aliases: ['chop suey', 'chopsuey'], per100: { calories: 70, protein: 4, carbs: 6, fat: 3.5 }, serving: { label: '1 serving', grams: 200 }, group: 'veg' },
  { key: 'ginataang_kalabasa', name: 'Ginataang kalabasa at sitaw', aliases: ['ginataang kalabasa', 'ginataang kalabasa at sitaw', 'squash in coconut milk'], per100: { calories: 110, protein: 3, carbs: 9, fat: 7 }, serving: { label: '1 serving', grams: 200 }, group: 'coconut' },
  { key: 'adobong_kangkong', name: 'Adobong kangkong', aliases: ['adobong kangkong', 'kangkong'], per100: { calories: 70, protein: 3, carbs: 5, fat: 4.5 }, serving: { label: '1 serving', grams: 150 }, group: 'veg' },
  { key: 'fried_egg', name: 'Pritong itlog', aliases: ['pritong itlog', 'fried egg', 'sunny side up', 'itlog'], per100: { calories: 196, protein: 13.6, carbs: 0.9, fat: 15 }, serving: { label: '1 pc', grams: 46 }, pieceGrams: 46, group: 'egg' },
  { key: 'boiled_egg', name: 'Nilagang itlog', aliases: ['nilagang itlog', 'boiled egg', 'hard boiled egg'], per100: { calories: 155, protein: 13, carbs: 1.1, fat: 11 }, serving: { label: '1 pc', grams: 50 }, pieceGrams: 50, group: 'egg' },

  // Breakfast / processed meats
  { key: 'embutido', name: 'Embutido', aliases: ['embutido'], per100: { calories: 230, protein: 13, carbs: 8, fat: 16 }, serving: { label: '2 slices', grams: 100 }, group: 'silog' },
  { key: 'corned_beef', name: 'Corned beef', aliases: ['corned beef', 'ginisang corned beef'], per100: { calories: 210, protein: 18, carbs: 3, fat: 14 }, serving: { label: '1 serving', grams: 100 }, group: 'silog' },
  { key: 'luncheon_meat', name: 'Luncheon meat', aliases: ['luncheon meat', 'spam', 'fried spam'], per100: { calories: 300, protein: 12, carbs: 4, fat: 26 }, serving: { label: '2 slices', grams: 60 }, group: 'silog' },
  { key: 'hotdog', name: 'Filipino hotdog', aliases: ['hotdog', 'hot dog', 'red hotdog', 'filipino hotdog'], per100: { calories: 290, protein: 10, carbs: 6, fat: 25 }, serving: { label: '1 pc', grams: 45 }, pieceGrams: 45, group: 'silog' },

  // Noodles & soups
  { key: 'palabok', name: 'Pancit palabok', aliases: ['pancit palabok', 'palabok', 'palabok fiesta'], per100: { calories: 160, protein: 6, carbs: 23, fat: 5 }, serving: { label: '1 serving', grams: 250 }, group: 'noodles' },
  { key: 'pancit_malabon', name: 'Pancit malabon', aliases: ['pancit malabon', 'malabon'], per100: { calories: 170, protein: 8, carbs: 22, fat: 6 }, serving: { label: '1 serving', grams: 250 }, group: 'noodles' },
  { key: 'instant_canton', name: 'Instant pancit canton', aliases: ['instant pancit canton', 'lucky me pancit canton', 'lucky me canton', 'instant canton'], per100: { calories: 253, protein: 4.7, carbs: 33, fat: 14 }, serving: { label: '1 pack', grams: 150 }, group: 'noodles' },
  { key: 'instant_noodle_soup', name: 'Instant noodle soup', aliases: ['instant noodle soup', 'instant noodles', 'instant mami', 'lucky me'], per100: { calories: 71, protein: 1.4, carbs: 9.4, fat: 3 }, serving: { label: '1 bowl', grams: 350 }, group: 'noodle_soup' },
  { key: 'sotanghon', name: 'Sotanghon soup', aliases: ['sotanghon', 'sotanghon soup', 'chicken sotanghon'], per100: { calories: 70, protein: 4, carbs: 10, fat: 1.5 }, serving: { label: '1 bowl', grams: 300 }, group: 'noodle_soup' },
  { key: 'batchoy', name: 'La Paz batchoy', aliases: ['batchoy', 'la paz batchoy'], per100: { calories: 90, protein: 6, carbs: 9, fat: 3.5 }, serving: { label: '1 bowl', grams: 400 }, group: 'noodle_soup' },
  { key: 'mami', name: 'Mami', aliases: ['mami', 'beef mami', 'chicken mami'], per100: { calories: 91, protein: 5.1, carbs: 10.9, fat: 2.3 }, serving: { label: '1 bowl', grams: 350 }, group: 'noodle_soup' },
  { key: 'lomi', name: 'Lomi', aliases: ['lomi', 'pancit lomi'], per100: { calories: 109, protein: 4.6, carbs: 13.7, fat: 3.4 }, serving: { label: '1 bowl', grams: 350 }, group: 'noodle_soup' },
  { key: 'sopas', name: 'Sopas', aliases: ['sopas', 'chicken macaroni soup', 'macaroni soup'], per100: { calories: 75, protein: 4, carbs: 9, fat: 2.5 }, serving: { label: '1 bowl', grams: 300 }, group: 'noodle_soup' },
  { key: 'champorado', name: 'Champorado', aliases: ['champorado', 'chocolate porridge'], per100: { calories: 130, protein: 3, carbs: 25, fat: 2.4 }, serving: { label: '1 bowl', grams: 250 }, group: 'porridge' },

  // Street food & merienda
  { key: 'fishball', name: 'Fish ball', aliases: ['fish ball', 'fishball', 'fish balls', 'fishballs'], per100: { calories: 173, protein: 8, carbs: 24, fat: 5.3 }, serving: { label: '1 pc', grams: 15 }, pieceGrams: 15, group: 'street' },
  { key: 'kikiam', name: 'Kikiam', aliases: ['kikiam', 'quekiam'], per100: { calories: 233, protein: 10, carbs: 23, fat: 10 }, serving: { label: '1 pc', grams: 20 }, pieceGrams: 20, group: 'street' },
  { key: 'kwek_kwek', name: 'Kwek-kwek', aliases: ['kwek-kwek', 'kwek kwek', 'kwekkwek'], per100: { calories: 222, protein: 9, carbs: 20, fat: 11 }, serving: { label: '1 pc', grams: 30 }, pieceGrams: 30, group: 'street' },
  { key: 'tokneneng', name: 'Tokneneng', aliases: ['tokneneng', 'tukneneng'], per100: { calories: 233, protein: 10, carbs: 15, fat: 14 }, serving: { label: '1 pc', grams: 60 }, pieceGrams: 60, group: 'street' },
  { key: 'balut', name: 'Balut', aliases: ['balut', 'penoy'], per100: { calories: 188, protein: 14, carbs: 1.5, fat: 13 }, serving: { label: '1 pc', grams: 70 }, pieceGrams: 70, group: 'egg' },
  { key: 'chicharon', name: 'Chicharon', aliases: ['chicharon', 'chicharron', 'pork rinds', 'chicharon bulaklak'], per100: { calories: 540, protein: 60, carbs: 0, fat: 32 }, serving: { label: '1 pack', grams: 30 }, group: 'street' },
  { key: 'okoy', name: 'Okoy', aliases: ['okoy', 'ukoy', 'shrimp fritter'], per100: { calories: 260, protein: 9, carbs: 22, fat: 15 }, serving: { label: '1 pc', grams: 70 }, pieceGrams: 70, group: 'street' },
  { key: 'turon', name: 'Turon', aliases: ['turon', 'banana lumpia', 'turon saba'], per100: { calories: 225, protein: 2.5, carbs: 42, fat: 5 }, serving: { label: '1 pc', grams: 80 }, pieceGrams: 80, group: 'merienda' },
  { key: 'banana_cue', name: 'Banana cue', aliases: ['banana cue', 'banana q', 'bananacue'], per100: { calories: 200, protein: 1.2, carbs: 45, fat: 2.5 }, serving: { label: '1 stick', grams: 80 }, pieceGrams: 80, group: 'merienda' },
  { key: 'camote_cue', name: 'Camote cue', aliases: ['camote cue', 'kamote cue', 'camote q'], per100: { calories: 220, protein: 1.5, carbs: 45, fat: 5 }, serving: { label: '1 stick', grams: 100 }, pieceGrams: 100, group: 'merienda' },
  { key: 'lumpiang_gulay', name: 'Lumpiang gulay', aliases: ['lumpiang gulay', 'vegetable lumpia', 'lumpia gulay', 'lumpiang togue'], per100: { calories: 188, protein: 3.8, carbs: 22.5, fat: 8.8 }, serving: { label: '1 pc', grams: 80 }, pieceGrams: 80, group: 'snack' },
  { key: 'lumpiang_sariwa', name: 'Lumpiang sariwa', aliases: ['lumpiang sariwa', 'fresh lumpia', 'lumpia sariwa'], per100: { calories: 120, protein: 4, carbs: 16, fat: 4.5 }, serving: { label: '1 pc', grams: 150 }, pieceGrams: 150, group: 'snack' },

  // Bread & pastries
  { key: 'ensaymada', name: 'Ensaymada', aliases: ['ensaymada', 'ensaimada'], per100: { calories: 388, protein: 7.5, carbs: 50, fat: 17.5 }, serving: { label: '1 pc', grams: 80 }, pieceGrams: 80, group: 'bread' },
  { key: 'spanish_bread', name: 'Spanish bread', aliases: ['spanish bread'], per100: { calories: 330, protein: 7, carbs: 50, fat: 11 }, serving: { label: '1 pc', grams: 50 }, pieceGrams: 50, group: 'bread' },
  { key: 'pan_de_coco', name: 'Pan de coco', aliases: ['pan de coco'], per100: { calories: 330, protein: 7, carbs: 52, fat: 10 }, serving: { label: '1 pc', grams: 60 }, pieceGrams: 60, group: 'bread' },
  { key: 'monay', name: 'Monay', aliases: ['monay'], per100: { calories: 288, protein: 7.5, carbs: 55, fat: 2.5 }, serving: { label: '1 pc', grams: 80 }, pieceGrams: 80, group: 'bread' },
  { key: 'siopao', name: 'Siopao', aliases: ['siopao', 'siopao asado', 'siopao bola-bola', 'siopao bola bola', 'steamed bun'], per100: { calories: 250, protein: 9, carbs: 40, fat: 6 }, serving: { label: '1 pc', grams: 120 }, pieceGrams: 120, group: 'bread' },
  { key: 'hopia', name: 'Hopia', aliases: ['hopia', 'hopia mongo', 'hopia ube'], per100: { calories: 380, protein: 7, carbs: 60, fat: 13 }, serving: { label: '1 pc', grams: 50 }, pieceGrams: 50, group: 'bread' },
  { key: 'buko_pie', name: 'Buko pie', aliases: ['buko pie', 'coconut pie'], per100: { calories: 290, protein: 4, carbs: 38, fat: 14 }, serving: { label: '1 slice', grams: 120 }, group: 'dessert' },

  // Kakanin (rice cakes) & desserts
  { key: 'puto', name: 'Puto', aliases: ['puto', 'puto cheese', 'rice cake'], per100: { calories: 225, protein: 5, carbs: 45, fat: 2.5 }, serving: { label: '1 pc', grams: 40 }, pieceGrams: 40, group: 'kakanin' },
  { key: 'kutsinta', name: 'Kutsinta', aliases: ['kutsinta', 'kuchinta', 'cuchinta'], per100: { calories: 200, protein: 2.5, carbs: 45, fat: 0.5 }, serving: { label: '1 pc', grams: 40 }, pieceGrams: 40, group: 'kakanin' },
  { key: 'bibingka', name: 'Bibingka', aliases: ['bibingka'], per100: { calories: 250, protein: 5, carbs: 42, fat: 7 }, serving: { label: '1 pc', grams: 120 }, pieceGrams: 120, group: 'kakanin' },
  { key: 'puto_bumbong', name: 'Puto bumbong', aliases: ['puto bumbong'], per100: { calories: 230, protein: 3, carbs: 45, fat: 4 }, serving: { label: '1 serving', grams: 100 }, group: 'kakanin' },
  { key: 'suman', name: 'Suman', aliases: ['suman', 'suman sa lihiya', 'suman malagkit'], per100: { calories: 180, protein: 3, carbs: 38, fat: 2 }, serving: { label: '1 pc', grams: 80 }, pieceGrams: 80, group: 'kakanin' },
  { key: 'biko', name: 'Biko', aliases: ['biko', 'bibingkang malagkit'], per100: { calories: 240, protein: 3, carbs: 48, fat: 4 }, serving: { label: '1 pc', grams: 100 }, group: 'kakanin' },
  { key: 'palitaw', name: 'Palitaw', aliases: ['palitaw'], per100: { calories: 230, protein: 3, carbs: 45, fat: 4.5 }, serving: { label: '1 pc', grams: 30 }, pieceGrams: 30, group: 'kakanin' },
  { key: 'maja_blanca', name: 'Maja blanca', aliases: ['maja blanca', 'maja'], per100: { calories: 160, protein: 2, carbs: 28, fat: 5 }, serving: { label: '1 slice', grams: 100 }, group: 'kakanin' },
  { key: 'ube_halaya', name: 'Ube halaya', aliases: ['ube halaya', 'halayang ube', 'ube jam'], per100: { calories: 200, protein: 2, carbs: 40, fat: 4 }, serving: { label: '1 serving', grams: 100 }, group: 'dessert' },
  { key: 'leche_flan', name: 'Leche flan', aliases: ['leche flan', 'flan'], per100: { calories: 280, protein: 6, carbs: 42, fat: 10 }, serving: { label: '1 slice', grams: 100 }, group: 'dessert' },
  { key: 'halo_halo', name: 'Halo-halo', aliases: ['halo-halo', 'halo halo', 'halohalo'], per100: { calories: 89, protein: 1.1, carbs: 17, fat: 1.7 }, serving: { label: '1 glass', grams: 350 }, group: 'dessert' },
  { key: 'taho', name: 'Taho', aliases: ['taho', 'soy pudding'], per100: { calories: 80, protein: 3, carbs: 15, fat: 1 }, serving: { label: '1 cup', grams: 250 }, group: 'dessert' },
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
  chicken_inasal: ['lechon_manok', 'chicken_adobo'],
  lechon_manok: ['chicken_inasal'],
  lechon: ['lechon_kawali', 'liempo'],
  pork_bbq: ['isaw', 'liempo'],
  isaw: ['pork_bbq'],
  tilapia: ['galunggong', 'daing_bangus'],
  galunggong: ['tilapia', 'tuyo'],
  tuyo: ['tinapa', 'galunggong'],
  tinapa: ['tuyo', 'galunggong'],
  inihaw_bangus: ['daing_bangus', 'tilapia'],
  adobong_pusit: ['calamares'],
  calamares: ['adobong_pusit'],
  tortang_talong: ['fried_egg'],
  monggo: ['ginataang_kalabasa'],
  chop_suey: ['pinakbet'],
  ginataang_kalabasa: ['monggo', 'pinakbet'],
  fried_egg: ['boiled_egg'],
  boiled_egg: ['fried_egg'],
  corned_beef: ['giniling'],
  luncheon_meat: ['hotdog', 'embutido'],
  hotdog: ['longganisa', 'luncheon_meat'],
  embutido: ['luncheon_meat'],
  palabok: ['pancit_malabon', 'pancit_bihon'],
  pancit_malabon: ['palabok'],
  instant_canton: ['pancit_canton'],
  mami: ['lomi', 'batchoy', 'instant_noodle_soup'],
  lomi: ['mami'],
  batchoy: ['mami'],
  sotanghon: ['mami', 'sopas'],
  sopas: ['sotanghon', 'lugaw'],
  champorado: ['lugaw'],
  fishball: ['kikiam'],
  kikiam: ['fishball'],
  kwek_kwek: ['tokneneng'],
  tokneneng: ['kwek_kwek'],
  turon: ['banana_cue', 'lumpiang_gulay'],
  banana_cue: ['camote_cue', 'turon'],
  camote_cue: ['banana_cue'],
  lumpiang_gulay: ['lumpia_shanghai', 'turon'],
  lumpiang_sariwa: ['lumpiang_gulay'],
  ensaymada: ['spanish_bread'],
  spanish_bread: ['pan_de_coco', 'ensaymada'],
  pan_de_coco: ['spanish_bread'],
  siopao: ['pandesal'],
  puto: ['kutsinta', 'bibingka'],
  kutsinta: ['puto', 'biko'],
  bibingka: ['puto', 'biko'],
  biko: ['suman', 'kutsinta'],
  suman: ['biko'],
  palitaw: ['puto'],
  maja_blanca: ['leche_flan'],
  leche_flan: ['maja_blanca'],
  halo_halo: ['taho'],
  taho: ['halo_halo'],
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
