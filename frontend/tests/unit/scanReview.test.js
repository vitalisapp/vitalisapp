// Revision #2 — confirm / correct scanned dishes before saving.
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  reviewReasons,
  needsReview,
  itemsNeedingReview,
  densityOf,
  recalcForGrams,
  applyDish,
} from "../../src/lib/scanReview.js";
import { scalePortion } from "../../src/lib/nutrition.js";

const ADOBO_REF = { name: "Chicken adobo", per100: { calories: 160, protein: 14, carbs: 4, fat: 9 }, serving: { label: "1 serving", grams: 200 } };
const PORK_ADOBO = { name: "Pork adobo", per100: { calories: 253, protein: 16.7, carbs: 4, fat: 18.7 } };

const scanned = (over = {}) => ({
  key: "a", food_name: "Chicken adobo", serving: "1 serving", grams: 200,
  calories: 320, protein: 28, carbs: 8, fat: 18,
  saturated_fat: 5, trans_fat: 0, polyunsaturated_fat: 4, monounsaturated_fat: 8,
  sugar: 2, sodium: 900, reference: ADOBO_REF, alternatives: [PORK_ADOBO],
  review_reasons: [], low_confidence: false, selected: true, reviewed: false, custom: false,
  ...over,
});

describe("which items need a check before saving", () => {
  it("flags actionable reasons only", () => {
    assert.equal(needsReview(scanned()), false);
    assert.equal(needsReview(scanned({ low_confidence: true, review_reasons: ["dish_unclear"] })), true);
    // Info-only: the user cannot verify calorie maths from a photo.
    assert.equal(needsReview(scanned({ low_confidence: true, review_reasons: ["macro_mismatch"] })), false);
  });

  it("treats old flagged results without reasons as unsure", () => {
    assert.deepEqual(reviewReasons({ low_confidence: true }), ["model_unsure"]);
    assert.equal(needsReview(scanned({ low_confidence: true, review_reasons: [] })), true);
  });

  it("skips excluded, custom and already-reviewed items", () => {
    const flagged = { low_confidence: true, review_reasons: ["portion_unusual"] };
    assert.equal(needsReview(scanned({ ...flagged, selected: false })), false);
    assert.equal(needsReview(scanned({ ...flagged, custom: true })), false);
    assert.equal(needsReview(scanned({ ...flagged, reviewed: true })), false);
    assert.equal(itemsNeedingReview([scanned(flagged), scanned()]).length, 1);
  });

  it("ignores unknown reason codes", () => {
    assert.deepEqual(reviewReasons({ review_reasons: ["nope", "dish_unclear"] }), ["dish_unclear"]);
  });
});

describe("correcting the weight", () => {
  it("recalculates from the dish reference", () => {
    const out = recalcForGrams(scanned(), 300);
    assert.equal(out.grams, 300);
    assert.equal(out.calories, 480);
    assert.equal(out.protein, 42);
    assert.equal(out.sodium, 1350); // sub-values follow the weight
    assert.equal(out.saturated_fat, 7.5);
  });

  it("rescales proportionally when there is no reference", () => {
    const item = scanned({ reference: null, food_name: "Mystery stew", grams: 250, calories: 400, protein: 20, carbs: 30, fat: 20 });
    assert.equal(densityOf(item).calories, 160);
    const out = recalcForGrams(item, 125);
    assert.equal(out.calories, 200);
    assert.equal(out.fat, 10);
  });

  it("returns null for an unusable weight or no density", () => {
    assert.equal(recalcForGrams(scanned(), 0), null);
    assert.equal(recalcForGrams(scanned({ reference: null, grams: null }), 100), null);
  });
});

describe("correcting the dish", () => {
  it("applies the alternative at the same visible weight", () => {
    const out = applyDish(scanned(), PORK_ADOBO, 200);
    assert.equal(out.food_name, "Pork adobo");
    assert.equal(out.calories, 506);
    assert.equal(out.fat, 37.4);
    assert.equal(out.reference.name, "Pork adobo");
    // Fat breakdown follows the new total fat; sugar/sodium unknown for the new dish.
    assert.ok(Math.abs(out.saturated_fat - 5 * (37.4 / 18)) < 0.1);
    assert.equal(out.sugar, null);
    assert.equal(out.sodium, null);
  });

  it("falls back to the dish's typical serving when no weight is known", () => {
    const out = applyDish(scanned({ grams: null }), ADOBO_REF, "");
    assert.equal(out.grams, 200);
    assert.equal(out.calories, 320);
  });

  it("needs a density to apply", () => {
    assert.equal(applyDish(scanned(), { name: "Unknown" }, 200), null);
  });
});

describe("portion buttons keep the weight in step", () => {
  it("scales grams with the portion", () => {
    const double = scalePortion(scanned(), 2);
    assert.equal(double.grams, 400);
    assert.equal(scalePortion(double, 0.5).grams, 100); // from the base, not compounding
  });
});
