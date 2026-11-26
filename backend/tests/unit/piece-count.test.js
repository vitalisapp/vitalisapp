// tests/unit/piece-count.test.js — vision piece-count reconciliation (no AI calls).
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { findStatedCount, reconcilePieceCount } = require('../../src/utils/pieceCount');
const gemini = require('../../src/config/gemini');
const { FOOD_ANALYSIS_PROMPT, FOOD_ANALYSIS_PROMPT_COMPACT } = require('../../src/constants/foodAnalysisPrompt');

describe('findStatedCount', () => {
  it('reads common count phrasings', () => {
    assert.equal(findStatedCount('Empanada (2 pcs)').n, 2);
    assert.equal(findStatedCount('3 pieces lumpia').n, 3);
    assert.equal(findStatedCount('3 empanadas').n, 3);
    assert.equal(findStatedCount('2x siomai').n, 2);
    assert.equal(findStatedCount('empanada x4').n, 4);
  });

  it('ignores measures and plain names', () => {
    assert.equal(findStatedCount('2 cups rice'), null);
    assert.equal(findStatedCount('150 g'), null);
    assert.equal(findStatedCount('Chicken adobo'), null);
    assert.equal(findStatedCount('Lunch box 2'), null);
  });
});

describe('reconcilePieceCount', () => {
  it('leaves items without piece_count untouched', () => {
    const item = { food_name: 'Rice', serving: '1 cup', calories: 206 };
    assert.deepEqual(reconcilePieceCount(item), item);
    assert.deepEqual(reconcilePieceCount({ ...item, piece_count: null }), { ...item, piece_count: null });
  });

  it('3 counted but "2 pcs" written with totals for 2 → rewrite and scale to 3', () => {
    const out = reconcilePieceCount({
      food_name: 'Empanada (2 pcs)', serving: '2 pcs', piece_count: 3, per_piece_g: 90,
      estimated_weight_g: 180, calories: 540, protein: 16, carbs: 56, fat: 28, sodium: 600,
    });
    assert.equal(out.food_name, 'Empanada (3 pcs)');
    assert.equal(out.serving, '3 pcs');
    assert.equal(out.estimated_weight_g, 270);
    assert.equal(out.calories, 810);
    assert.equal(out.protein, 24);
    assert.equal(out.carbs, 84);
    assert.equal(out.fat, 42);
    assert.equal(out.sodium, 900);
    assert.equal(out.low_confidence, true);
  });

  it('totals already sized for the count → fixes the label only', () => {
    const out = reconcilePieceCount({
      food_name: 'Empanada (2 pcs)', serving: '2 pcs', piece_count: 3, per_piece_g: 90,
      estimated_weight_g: 270, calories: 810,
    });
    assert.equal(out.food_name, 'Empanada (3 pcs)');
    assert.equal(out.calories, 810);
  });

  it('no weight evidence → no rescale, but label fixed and flagged', () => {
    const out = reconcilePieceCount({ food_name: '2 empanadas', piece_count: 3, calories: 540 });
    assert.equal(out.food_name, '3 empanadas');
    assert.equal(out.calories, 540);
    assert.equal(out.low_confidence, true);
  });

  it('adds a missing count to the name and fills weight from per-piece grams', () => {
    const out = reconcilePieceCount({ food_name: 'Empanada', serving: '', piece_count: 3, per_piece_g: 90, calories: 810 });
    assert.equal(out.food_name, 'Empanada (3 pcs)');
    assert.equal(out.serving, '3 pcs');
    assert.equal(out.estimated_weight_g, 270);
    assert.equal(out.low_confidence, undefined);
  });

  it('rejects absurd counts', () => {
    const item = { food_name: 'Rice', piece_count: 500 };
    assert.deepEqual(reconcilePieceCount(item), item);
  });

  it('does not read fractional portions as whole piece counts', () => {
    for (const serving of ['0.5 pcs', '1/2 piece', '1.5 pieces']) {
      assert.equal(findStatedCount(serving), null);
    }
  });

  it('does not inflate totals when neither count explains the visible weight', () => {
    const out = reconcilePieceCount({
      food_name: 'Empanada (2 pcs)', serving: '2 pcs', piece_count: 3,
      per_piece_g: 90, estimated_weight_g: 60, calories: 180,
    });
    assert.equal(out.calories, 180);
    assert.equal(out.estimated_weight_g, 60);
    assert.equal(out.low_confidence, true);
  });

  it('uses conflicting serving evidence even when the name already matches', () => {
    const out = reconcilePieceCount({
      food_name: 'Empanada (3 pcs)', serving: '2 pcs', piece_count: 3,
      per_piece_g: 90, estimated_weight_g: 180, calories: 540,
    });
    assert.equal(out.serving, '3 pcs');
    assert.equal(out.calories, 810);
    assert.equal(out.low_confidence, true);
  });
});

describe('vision pipeline applies the count', () => {
  it('visionOutcome returns the corrected empanada item', () => {
    const raw = JSON.stringify({
      items: [{
        food_name: 'Empanada (2 pcs)', piece_count: 3, per_piece_g: 90, serving: '2 pcs',
        estimated_weight_g: 180, calories: 540, protein: 16, carbs: 56, fat: 28,
      }],
      suggestion: 'Pair with vegetables.',
    });
    const out = gemini.visionOutcome(raw);
    assert.equal(out.status, 'ok');
    assert.equal(out.result.items[0].food_name, 'Empanada (3 pcs)');
    assert.equal(out.result.items[0].calories, 810);
  });

  it('empanada has a per-piece anchor that scales with count', () => {
    const exp = gemini.anchorExpected('Empanada (3 pcs)', '3 pcs');
    assert.equal(exp.calories, 810);
  });

  it('both prompts ask for an explicit count before totals', () => {
    for (const p of [FOOD_ANALYSIS_PROMPT, FOOD_ANALYSIS_PROMPT_COMPACT]) {
      assert.match(p, /piece_count/);
      assert.match(p, /per_piece_g/);
      assert.match(p, /partly hidden/);
      // One location per piece grounds the count in the image.
      assert.match(p, /piece_locations/);
      // Balanced: warns against overcounting too (3 empanadas reported as 5).
      assert.match(p, /not high and not low/i);
      assert.doesNotMatch(p, /never default to 1 or 2/i);
    }
  });
});

describe('piece_locations (one entry per piece)', () => {
  const { reconcilePieceCount } = require('../../src/utils/pieceCount');
  const five = {
    food_name: 'Empanada (5 pcs)', serving: '5 pcs', piece_count: 5, per_piece_g: 90,
    estimated_weight_g: 450, calories: 1350, protein: 40, carbs: 140, fat: 70,
  };

  it('overcount: 3 listed but piece_count 5 → 3 pcs, totals scaled to 3', () => {
    const out = reconcilePieceCount({ ...five, piece_locations: ['left', 'middle', 'right'] });
    assert.equal(out.piece_count, 3);
    assert.equal(out.food_name, 'Empanada (3 pcs)');
    assert.equal(out.serving, '3 pcs');
    assert.equal(out.estimated_weight_g, 270);
    assert.equal(out.calories, 810);
    assert.equal(out.low_confidence, true);
    assert.equal(out.piece_locations, undefined);
  });

  it('undercount: 3 listed but piece_count 2 → 3 pcs', () => {
    const two = { food_name: 'Empanada (2 pcs)', serving: '2 pcs', piece_count: 2, per_piece_g: 90, estimated_weight_g: 180, calories: 540 };
    const out = reconcilePieceCount({ ...two, piece_locations: ['a', 'b', 'c'] });
    assert.equal(out.piece_count, 3);
    assert.equal(out.calories, 810);
  });

  it('list agrees with the count → unchanged and not flagged', () => {
    const three = { food_name: 'Empanada (3 pcs)', serving: '3 pcs', piece_count: 3, per_piece_g: 90, estimated_weight_g: 270, calories: 810 };
    const out = reconcilePieceCount({ ...three, piece_locations: ['l', 'm', 'r'] });
    assert.equal(out.piece_count, 3);
    assert.equal(out.calories, 810);
    assert.equal(out.low_confidence, undefined);
  });

  it('ignores blank entries and leaves non-countable food alone', () => {
    assert.equal(reconcilePieceCount({ ...five, piece_locations: ['l', ' ', 'r', ''] }).piece_count, 2);
    const rice = { food_name: 'Kanin', serving: '1 cup', piece_count: null, piece_locations: [], calories: 206 };
    assert.deepEqual(reconcilePieceCount(rice), rice);
  });
});
