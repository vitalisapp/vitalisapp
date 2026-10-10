// Pure logic tests for src/features/MealTracker/utils/dateKey.js.
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  toLocalKey,
  buildMonthGrid,
} from "../../src/features/MealTracker/utils/dateKey.js";

describe("toLocalKey", () => {
  it("formats local YYYY-MM-DD with padding", () => {
    assert.equal(toLocalKey(new Date(2026, 9, 5)), "2026-10-05");
    assert.equal(toLocalKey(new Date(2026, 0, 1)), "2026-01-01");
  });
  it("uses local day, never UTC-shifted", () => {
    const d = new Date(2026, 9, 10, 23, 59);
    assert.equal(toLocalKey(d), "2026-10-10");
  });
});

describe("buildMonthGrid", () => {
  it("starts Sunday with no blanks when the 1st is Sunday (Feb 2026)", () => {
    const cells = buildMonthGrid(2026, 1);
    assert.equal(cells.length, 28);
    assert.equal(cells[0], 1);
    assert.equal(cells[27], 28);
  });
  it("pads leading blanks when the 1st is mid-week (Oct 2026 starts Thursday)", () => {
    const cells = buildMonthGrid(2026, 9);
    assert.deepEqual(cells.slice(0, 4), [null, null, null, null]);
    assert.equal(cells[4], 1);
    assert.equal(cells.length, 35);
  });
  it("holds leading blanks plus every day of the month", () => {
    for (const [y, m] of [[2026, 0], [2026, 5], [2027, 1]]) {
      const cells = buildMonthGrid(y, m);
      const startDay = new Date(y, m, 1).getDay();
      const daysInMonth = new Date(y, m + 1, 0).getDate();
      assert.equal(cells.length, startDay + daysInMonth);
      assert.deepEqual(cells.filter((c) => c !== null), Array.from({ length: daysInMonth }, (_, i) => i + 1));
    }
  });
});
