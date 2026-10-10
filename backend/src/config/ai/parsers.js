// JSON parsing helpers for AI output (never throw — return null/fallback).
const { validateAndCorrectMacros } = require('./nutrition');

// Balanced-brace extraction: finds the largest valid JSON object containing
// "items" (or a single food object). Replaces the old non-greedy
// /\{[\s\S]*?\}/ which stopped at the FIRST inner "}" and silently dropped
// every item past the first on multi-item plates.
function extractBalancedJSON(str) {
  let best = null;
  let searchFrom = 0;
  while (true) {
    const start = str.indexOf('{', searchFrom);
    if (start < 0) break;
    let depth = 0;
    let inStr = false;
    let esc = false;
    for (let i = start; i < str.length; i++) {
      const c = str[i];
      if (inStr) {
        if (esc) esc = false;
        else if (c === '\\') esc = true;
        else if (c === '"') inStr = false;
        continue;
      }
      if (c === '"') inStr = true;
      else if (c === '{') depth++;
      else if (c === '}') {
        depth--;
        if (depth === 0) {
          const slice = str.slice(start, i + 1);
          try {
            const obj = JSON.parse(slice);
            if (obj && (Array.isArray(obj.items) || obj.food_name)) {
              // Prefer the parse with the most items.
              const count = Array.isArray(obj.items) ? obj.items.length : 1;
              const bestCount = best && Array.isArray(best.items) ? best.items.length : (best ? 1 : 0);
              if (!best || count > bestCount) best = obj;
            }
          } catch (_) {}
          break;
        }
      }
    }
    searchFrom = start + 1;
  }
  return best;
}

// Last resort: scrape every flat {...} block containing food_name + calories
// (for outputs truncated mid-array where no balanced object parses).
function scrapeItemBlocks(str) {
  const items = [];
  const re = /\{[^{}]*"food_name"[^{}]*\}/g;
  let m;
  while ((m = re.exec(str)) !== null) {
    try {
      const obj = JSON.parse(m[0]);
      if (obj.food_name && obj.calories != null) items.push(obj);
    } catch (_) {}
  }
  return items;
}

function parseNutritionJSON(raw) {
  const clean = raw
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim();

  try {
    return JSON.parse(clean);
  } catch (_) {}

  const balanced = extractBalancedJSON(clean);
  if (balanced) return balanced;

  const scraped = scrapeItemBlocks(clean);
  if (scraped.length > 0) {
    return { items: scraped.slice(0, 8), suggestion: '' };
  }

  const extract = (key) => {
    const m = clean.match(new RegExp(`"${key}"\\s*:\\s*"?([^",}]+)"?`));
    return m ? m[1].trim() : null;
  };

  const food_name = extract('food_name');
  const calories = extract('calories');
  if (!food_name || !calories) return null;

  return {
    food_name: food_name,
    serving: extract('serving') || '',
    calories: Number(calories) || 0,
    protein: Number(extract('protein')) || 0,
    carbs: Number(extract('carbs')) || 0,
    fat: Number(extract('fat')) || 0,
    saturated_fat: Number(extract('saturated_fat')) || 0,
    trans_fat: Number(extract('trans_fat')) || 0,
    polyunsaturated_fat: Number(extract('polyunsaturated_fat')) || 0,
    monounsaturated_fat: Number(extract('monounsaturated_fat')) || 0,
    suggestion: extract('suggestion') || '',
  };
}

// MULTI-ITEM NORMALIZER
function normalizeItems(raw) {
  const parsed = parseNutritionJSON(raw);
  if (!parsed) return null;

  if (Array.isArray(parsed.items)) {
    const items = parsed.items
      .filter(Boolean)
      .slice(0, 8)
      .map(validateAndCorrectMacros)
      .filter(Boolean);
    if (items.length === 0) return null;
    return {
      items,
      suggestion:
        typeof parsed.suggestion === 'string'
          ? parsed.suggestion.slice(0, 200)
          : '',
    };
  }

  // Legacy single-object shape → one-item list
  if (parsed.food_name && parsed.calories != null) {
    const item = validateAndCorrectMacros(parsed);
    if (!item) return null;
    return {
      items: [item],
      suggestion: parsed.suggestion || '',
    };
  }
  return null;
}

function emptyItemsFallback(reason) {
  return {
    items: [
      {
        food_name: 'Unknown food',
        serving: '',
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        saturated_fat: 0,
        trans_fat: 0,
        polyunsaturated_fat: 0,
        monounsaturated_fat: 0,
      },
    ],
    suggestion:
      reason || 'Could not analyze the image. Please try a clearer photo.',
  };
}

function stripDataUriPrefix(base64) {
  const s = String(base64 || '');
  return s.includes(',') ? s.split(',').pop() : s;
}

// Safe JSON helper (never throws — returns { parsed, raw }).
function safeParseAI(raw, fallback = null) {
  if (raw == null) return { parsed: fallback, raw: '' };
  const str = String(raw);
  const clean = str
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim();
  try {
    return { parsed: JSON.parse(clean), raw: str };
  } catch (_) {}
  const match = clean.match(/\{[\s\S]*\}/);
  if (match) {
    try {
      return { parsed: JSON.parse(match[0]), raw: str };
    } catch (_) {}
  }
  return { parsed: fallback, raw: str };
}

module.exports = {
  extractBalancedJSON,
  scrapeItemBlocks,
  parseNutritionJSON,
  normalizeItems,
  emptyItemsFallback,
  stripDataUriPrefix,
  safeParseAI,
};
