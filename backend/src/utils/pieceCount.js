// Piece-count reconciliation for vision results.
//
// Vision models undercount small repeated foods (3 empanadas reported as "2
// pcs"), especially with thinking disabled. The prompt now makes the model
// commit to an explicit `piece_count` (and `per_piece_g`) BEFORE it writes the
// totals. This module makes the rest of the item agree with that count:
//   • food_name / serving say a different number → rewrite them to piece_count
//   • the totals were built for the old number (weight evidence) → rescale them
// Pure functions, no I/O.

const MAX_PIECES = 60;

// Measures, not pieces: "2 cups rice" / "150 g" must never be read as a count.
const MEASURE_WORDS = /^(?:cups?|g|grams?|kg|ml|l|liters?|litres?|oz|ounces?|lbs?|tbsp|tsp|tablespoons?|teaspoons?|bowls?|servings?|plates?|glass(?:es)?|bottles?|cans?|sachets?|portions?|scoops?)\b/i;

/**
 * Find the piece count stated in free text. Returns { n, start, end } (span of
 * the digits, so callers can rewrite just the number) or null.
 */
function findStatedCount(text) {
  const s = String(text || '');
  const candidates = [
    /(?<![\d./])\b(\d+)\s*(?:pcs?|pieces?)\b/i, // "3 pcs", "(3 pieces)"
    /(?<![\d./])\b(\d+)\s*(?:x|×)(?=\s|$)/i,   // "3x empanada"
    /(?:^|\s)(?:x|×)\s*(\d+)\b/i,       // "empanada x3"
  ];
  for (const re of candidates) {
    const m = re.exec(s);
    if (m) {
      const start = m.index + m[0].indexOf(m[1]);
      return { n: Number(m[1]), start, end: start + m[1].length };
    }
  }
  // Leading number followed by a food word: "3 empanadas", "2 slices pizza".
  const lead = /^\s*(\d+)\s+([a-z]+)/i.exec(s);
  if (lead && !MEASURE_WORDS.test(lead[2])) {
    const start = lead.index + lead[0].indexOf(lead[1]);
    return { n: Number(lead[1]), start, end: start + lead[1].length };
  }
  return null;
}

function replaceCount(text, found, n) {
  return `${text.slice(0, found.start)}${n}${text.slice(found.end)}`;
}

function validCount(value) {
  const n = Number(value);
  return Number.isInteger(n) && n >= 1 && n <= MAX_PIECES ? n : null;
}

const SCALED_FIELDS = [
  'calories', 'protein', 'carbs', 'fat', 'saturated_fat', 'trans_fat',
  'polyunsaturated_fat', 'monounsaturated_fat', 'sugar', 'sodium', 'estimated_weight_g',
];

function scaleTotals(item, factor) {
  const out = { ...item };
  for (const key of SCALED_FIELDS) {
    const v = Number(item[key]);
    if (item[key] == null || item[key] === '' || !Number.isFinite(v)) continue;
    const scaled = v * factor;
    out[key] = key === 'calories' || key === 'sodium' || key === 'estimated_weight_g'
      ? Math.round(scaled)
      : Math.round(scaled * 10) / 10;
  }
  return out;
}

/**
 * Which count were the totals computed for? Uses per-piece weight × count vs
 * the total weight. Returns 'stated', 'counted', or null when there is no
 * weight evidence (then totals are left alone).
 */
function totalsBasis(item, stated, counted) {
  const per = Number(item.per_piece_g);
  const total = Number(item.estimated_weight_g);
  if (!Number.isFinite(per) || !Number.isFinite(total) || !(per > 0) || !(total > 0)) return null;
  const errStated = Math.abs(per * stated - total);
  const errCounted = Math.abs(per * counted - total);
  // Being merely closer is not evidence: a partly eaten portion can be far
  // below BOTH whole-piece estimates. Require agreement within rounding error.
  if (Math.min(errStated, errCounted) > Math.max(2, total * 0.05)) return null;
  return errStated < errCounted ? 'stated' : 'counted';
}

/**
 * Make an item consistent with its explicit piece_count. Items without a
 * valid piece_count are returned unchanged.
 */
function reconcilePieceCount(item) {
  if (!item || typeof item !== 'object') return item;
  const counted = validCount(item.piece_count);
  if (!counted) return item;

  let out = { ...item, piece_count: counted };
  const name = String(item.food_name || '');
  const serving = String(item.serving || '');
  const nameFound = findStatedCount(name);
  const servingFound = findStatedCount(serving);
  const conflicts = [...new Set([nameFound?.n, servingFound?.n]
    .filter((n) => validCount(n) && n !== counted))];
  const stated = conflicts.length === 1 ? conflicts[0] : null;

  if (stated && stated !== counted) {
    // Totals were sized for the stated number → bring them to the real count.
    if (totalsBasis(item, stated, counted) === 'stated') {
      out = scaleTotals(out, counted / stated);
    }
    out.low_confidence = true; // the model disagreed with itself; worth a look
  }
  if (conflicts.length > 1) out.low_confidence = true;

  if (nameFound) {
    if (nameFound.n !== counted) out.food_name = replaceCount(name, nameFound, counted);
  } else if (counted > 1 && name) {
    out.food_name = `${name} (${counted} pcs)`;
  }

  if (servingFound) {
    if (servingFound.n !== counted) out.serving = replaceCount(serving, servingFound, counted);
  } else if (counted > 1 && !serving.trim()) {
    out.serving = `${counted} pcs`;
  }

  // Fill a missing total weight from the per-piece weight.
  const per = Number(item.per_piece_g);
  if (!(Number(out.estimated_weight_g) > 0) && per > 0) {
    out.estimated_weight_g = Math.round(per * counted);
  }
  return out;
}

module.exports = { findStatedCount, reconcilePieceCount, MAX_PIECES };
