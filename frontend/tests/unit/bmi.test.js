// Section 2 — BMI interpretation + sleep guidance (pure logic, node --test).
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  calcBmi, classifyBmi, healthyWeightRange, distanceToHealthy, bmiScalePosition, sleepGuidance,
} from "../../src/lib/bmi.js";
import { checkDob } from "../../src/lib/age.js";

describe("BMI classification (WHO international)", () => {
  it("classifies at the exact cut-offs", () => {
    assert.equal(classifyBmi(18.4).key, "UNDERWEIGHT");
    assert.equal(classifyBmi(18.5).key, "NORMAL");
    assert.equal(classifyBmi(24.9).key, "NORMAL");
    assert.equal(classifyBmi(25).key, "OVERWEIGHT");
    assert.equal(classifyBmi(30).key, "OBESE");
    assert.equal(classifyBmi(null), null);
  });

  it("explains, not just labels", () => {
    for (const b of [17, 22, 27, 35]) {
      const c = classifyBmi(b);
      assert.ok(c.meaning.length > 40 && c.tip.length > 40, c.key);
    }
  });

  it("computes healthy range and distance for a height", () => {
    assert.equal(calcBmi(70, 175), 22.9);
    assert.deepEqual(healthyWeightRange(175), { minKg: 56.7, maxKg: 76.3 });
    assert.equal(distanceToHealthy(80, 175), "3.7 kg above the healthy range");
    assert.equal(distanceToHealthy(70, 175), "Within the healthy range");
    assert.equal(bmiScalePosition(10), 0);
    assert.equal(bmiScalePosition(50), 100);
  });
});

describe("sleep guidance", () => {
  it("uses adult and teen recommendations", () => {
    assert.equal(sleepGuidance(5, 25).status, "LOW");
    assert.equal(sleepGuidance(6.5, 25).status, "SLIGHTLY_LOW");
    assert.equal(sleepGuidance(8, 25).status, "GOOD");
    assert.equal(sleepGuidance(7.5, 15).status, "SLIGHTLY_LOW");
    assert.equal(sleepGuidance(11, 30).status, "HIGH");
    assert.equal(sleepGuidance(null), null);
  });
});

describe("minimum age explanation", () => {
  it("explains a 2015 birth year", () => {
    const r = checkDob("2015-05-01", new Date(2026, 10, 21));
    assert.equal(r.code, "AGE_TOO_YOUNG");
    assert.match(r.message, /11 years old/);
  });
});
