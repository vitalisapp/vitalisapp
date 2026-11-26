// Accuracy check for Revision #2 (Filipino dish recognition).
//
// Runs real meal photos through the SAME vision chain the app uses and compares
// each result with the dish reference (src/utils/filipinoDishes.js —
// approximate values; cross-check with the FNRI PhilFCT).
//
//   1. Put photos in testing-photo/filipino/
//   2. Copy testing-photo/filipino/manifest.example.json → manifest.json and
//      list each photo's real dish (and grams if you weighed it)
//   3. npm run eval:filipino            (needs the AI keys in backend/.env)
//
// Uses live AI calls (counts against provider quota). Writes a JSON report to
// testing-photo/filipino/report-<timestamp>.json.
require('../src/config/env');
const fs = require('fs');
const path = require('path');
const { analyzeFoodImage } = require('../src/config/gemini');
const { compressImageBase64 } = require('../src/utils/upload');
const { findDish, nutritionFor } = require('../src/utils/filipinoDishes');

const DIR = path.join(__dirname, '..', '..', 'testing-photo', 'filipino');
const KCAL_TOLERANCE = 0.3; // ±30 % of the reference counts as "in range"

function parse(raw) {
  try {
    return JSON.parse(String(raw).replace(/```json|```/gi, '').trim().match(/\{[\s\S]*\}/)[0]);
  } catch {
    return null;
  }
}

async function evaluate(entry) {
  const file = path.join(DIR, entry.file);
  if (!fs.existsSync(file)) return { ...entry, error: 'file not found' };
  const expectedDish = findDish(entry.expected);
  if (!expectedDish) return { ...entry, error: `"${entry.expected}" is not in filipinoDishes.js` };

  const { base64 } = await compressImageBase64(fs.readFileSync(file).toString('base64'));
  const t0 = Date.now();
  const parsed = parse(await analyzeFoodImage(base64));
  const seconds = (Date.now() - t0) / 1000;
  if (!parsed || parsed.success === false || !Array.isArray(parsed.items) || !parsed.items.length) {
    return { ...entry, seconds, error: parsed?.suggestion || parsed?.code || 'no result' };
  }

  // The item that is the expected dish (top-1), else one listing it as an alternative.
  const items = parsed.items;
  const top = items.find((it) => findDish(it.food_name)?.key === expectedDish.key);
  const viaAlt = !top && items.find((it) =>
    (it.alternatives || []).some((a) => findDish(a.name)?.key === expectedDish.key));
  const item = top || viaAlt || items[0];

  const grams = Number(entry.grams) || Number(item.estimated_weight_g) || expectedDish.serving.grams;
  const reference = nutritionFor(expectedDish, grams);
  const kcalError = reference ? (item.calories - reference.calories) / reference.calories : null;

  return {
    file: entry.file,
    expected: expectedDish.name,
    got: item.food_name,
    identified: top ? 'top-1' : viaAlt ? 'alternative' : 'missed',
    dish_confidence: item.dish_confidence || null,
    flagged: Boolean(item.low_confidence),
    review_reasons: item.review_reasons || [],
    grams_used: grams,
    grams_source: entry.grams ? 'weighed' : item.estimated_weight_g ? 'ai' : 'typical serving',
    ai_kcal: item.calories,
    reference_kcal: reference?.calories ?? null,
    kcal_error_pct: kcalError == null ? null : Math.round(kcalError * 100),
    kcal_in_range: kcalError == null ? null : Math.abs(kcalError) <= KCAL_TOLERANCE,
    seconds,
  };
}

async function main() {
  const manifestPath = path.join(DIR, 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    console.error(`No manifest at ${manifestPath}. Copy manifest.example.json to manifest.json first.`);
    process.exit(1);
  }
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const results = [];
  for (const entry of manifest) {
    process.stdout.write(`… ${entry.file} `);
    try {
      const r = await evaluate(entry);
      results.push(r);
      console.log(r.error ? `ERROR: ${r.error}` : `${r.identified} | ${r.got} | ${r.ai_kcal} vs ${r.reference_kcal} kcal (${r.kcal_error_pct}%)${r.flagged ? ' | flagged' : ''}`);
    } catch (e) {
      results.push({ ...entry, error: e.message });
      console.log(`ERROR: ${e.message}`);
    }
  }

  const ok = results.filter((r) => !r.error);
  const pct = (n) => (ok.length ? `${Math.round((n / ok.length) * 100)}%` : 'n/a');
  const top1 = ok.filter((r) => r.identified === 'top-1').length;
  const anyId = ok.filter((r) => r.identified !== 'missed').length;
  const inRange = ok.filter((r) => r.kcal_in_range).length;
  const missedNotFlagged = ok.filter((r) => r.identified === 'missed' && !r.flagged).length;

  console.log('\n──── Summary ────');
  console.log(`Photos evaluated:          ${ok.length}/${results.length}`);
  console.log(`Dish correct (top-1):      ${top1} (${pct(top1)})`);
  console.log(`Correct or in alternatives:${anyId} (${pct(anyId)})`);
  console.log(`kcal within ±${KCAL_TOLERANCE * 100}% of ref:  ${inRange} (${pct(inRange)})`);
  console.log(`Wrong dish NOT flagged:    ${missedNotFlagged}  (should be 0 — these mislead users)`);
  console.log('Reference values are approximate (src/utils/filipinoDishes.js); verify with FNRI PhilFCT.');

  const out = path.join(DIR, `report-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
  fs.writeFileSync(out, JSON.stringify({ when: new Date().toISOString(), tolerance: KCAL_TOLERANCE, results }, null, 2));
  console.log(`Report: ${out}`);
}

main().catch((e) => { console.error('[eval] crashed:', e); process.exit(1); });
