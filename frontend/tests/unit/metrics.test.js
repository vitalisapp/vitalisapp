// Pure logic tests for src/features/Profile/utils/metrics.js.
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  computeBMI,
  bmiCategory,
  calcBMR,
  activityFactors,
  humanize,
} from "../../src/features/Profile/utils/metrics.js";

describe("computeBMI", () => {
  it("computes BMI to one decimal", () => {
    assert.equal(computeBMI(175, 70), 22.9);
  });
  it("returns null for missing input", () => {
    assert.equal(computeBMI(null, 70), null);
    assert.equal(computeBMI(175, 0), null);
    assert.equal(computeBMI("", ""), null);
  });
});

describe("bmiCategory", () => {
  it("buckets WHO boundaries with theme colors", () => {
    assert.deepEqual(bmiCategory(null), { label: "—", color: "var(--text-disabled)" });
    assert.equal(bmiCategory(17).label, "Underweight");
    assert.equal(bmiCategory(22).label, "Normal");
    assert.equal(bmiCategory(22).color, "var(--accent)");
    assert.equal(bmiCategory(27).label, "Overweight");
    assert.equal(bmiCategory(27).color, "var(--warning)");
    assert.equal(bmiCategory(32).label, "Obese");
    assert.equal(bmiCategory(32).color, "var(--error)");
  });
});

describe("calcBMR", () => {
  it("applies Mifflin-St Jeor by sex", () => {
    assert.equal(calcBMR(70, 175, 30, "male"), 1649);
    assert.equal(calcBMR(70, 175, 30, "female"), 1483);
  });
  it("returns null for missing input", () => {
    assert.equal(calcBMR(0, 175, 30, "male"), null);
    assert.equal(calcBMR(70, 175, null, "male"), null);
  });
});

describe("activityFactors", () => {
  it("covers the five activity levels", () => {
    assert.equal(activityFactors.Sedentary, 1.2);
    assert.equal(activityFactors["Extra Active"], 1.9);
  });
});

describe("humanize", () => {
  it("humanizes DB enums", () => {
    assert.equal(humanize("GRADUAL"), "Gradual");
    assert.equal(humanize("12_DAYS"), "12 days");
  });
  it("falls back to an em dash", () => {
    assert.equal(humanize(null), "—");
    assert.equal(humanize(""), "—");
  });
});
