// Pure logic tests for validateTargetWeight (shared goal-direction rule).
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { validateTargetWeight } from "../../src/features/Onboarding/constants/goals.js";

describe("validateTargetWeight", () => {
  it("accepts loss below and gain above current weight", () => {
    assert.equal(validateTargetWeight("LOSE_WEIGHT", 70, 85), "");
    assert.equal(validateTargetWeight("GAIN_WEIGHT", 85, 55), "");
  });
  it("rejects the 55 -> 85 kg loss combination", () => {
    assert.equal(
      validateTargetWeight("LOSE_WEIGHT", 85, 55),
      "For weight loss, your target must be below your current weight."
    );
  });
  it("rejects equal and inverted gain targets", () => {
    assert.equal(validateTargetWeight("LOSE_WEIGHT", 55, 55).length > 0, true);
    assert.equal(
      validateTargetWeight("GAIN_WEIGHT", 55, 85),
      "For weight gain, your target must be above your current weight."
    );
  });
  it("ignores non-weight goals", () => {
    assert.equal(validateTargetWeight("MAINTAIN_WEIGHT", 200, 55), "");
    assert.equal(validateTargetWeight("PERFORMANCE", 40, 85), "");
  });
  it("keeps the existing range and presence messages", () => {
    assert.equal(validateTargetWeight("LOSE_WEIGHT", "", 85), "Enter a target weight for this goal.");
    assert.equal(
      validateTargetWeight("GAIN_WEIGHT", 5, 85),
      "Target weight must be between 10 and 1000 kg."
    );
  });
  it("skips direction when current weight is unknown", () => {
    assert.equal(validateTargetWeight("LOSE_WEIGHT", 70, ""), "");
    assert.equal(validateTargetWeight("LOSE_WEIGHT", 70, null), "");
  });
});
