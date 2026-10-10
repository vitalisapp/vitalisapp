// Pure logic tests for src/features/Analytics/utils/sleepScore.js.
// Display-only scoring — training readiness lives in backend utils/readiness.js.
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  calculateSleepScore,
  getSleepStatusReal,
  getPointColor,
} from "../../src/features/Analytics/utils/sleepScore.js";

describe("calculateSleepScore", () => {
  it("scores ideal sleep highly (8h, quality 8)", () => {
    assert.equal(calculateSleepScore(8, 8), 92);
  });
  it("rewards the full 7-9h band", () => {
    assert.equal(calculateSleepScore(7, 10), 100);
    assert.equal(calculateSleepScore(9, 10), 100);
  });
  it("penalizes oversleep above 10h", () => {
    assert.ok(calculateSleepScore(12, 8) < calculateSleepScore(8, 8));
  });
  it("scales short sleep proportionally", () => {
    assert.equal(calculateSleepScore(3.5, 0), 30);
  });
  it("returns 0 for invalid input", () => {
    assert.equal(calculateSleepScore(NaN, 5), 0);
    assert.equal(calculateSleepScore(8, NaN), 0);
    assert.equal(calculateSleepScore(-1, 5), 0);
    assert.equal(calculateSleepScore(25, 5), 0);
    assert.equal(calculateSleepScore(8, 11), 0);
  });
});

describe("getSleepStatusReal", () => {
  it("labels Optimal / Fair / High / Low bands", () => {
    assert.equal(getSleepStatusReal(8, 9).level, "Optimal");
    assert.equal(getSleepStatusReal(6, 6).level, "Fair");
    assert.equal(getSleepStatusReal(12, 2).level, "High");
    assert.equal(getSleepStatusReal(4, 2).level, "Low");
  });
  it("carries the numeric score through", () => {
    assert.equal(getSleepStatusReal(8, 8).score, 92);
  });
});

describe("getPointColor", () => {
  it("uses the injected accent for high scores", () => {
    assert.equal(getPointColor(8, 9, "#123456"), "#123456");
    assert.equal(getPointColor(8, 9), "#57B26A");
  });
  it("falls back through orange to red", () => {
    assert.equal(getPointColor(6, 6), "#fb923c");
    assert.equal(getPointColor(4, 2), "#f87171");
  });
});
