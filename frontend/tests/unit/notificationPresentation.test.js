// Pure-logic tests for the notification presentation mapper (no DOM, no deps).
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  getCategory,
  getNotificationMeta,
  splitTitle,
  parseDate,
  formatRelativeTime,
  groupByDay,
} from "../../src/features/user/Notifications/notificationPresentation.js";

const NOW = new Date(2026, 10, 19, 15, 0, 0); // local time, Thu 19 Nov 2026 15:00
const at = (daysAgo, h = 10, m = 0) => {
  const d = new Date(NOW);
  d.setDate(d.getDate() - daysAgo);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
};

describe("getCategory / getNotificationMeta", () => {
  it("falls back to SYSTEM for missing or unknown categories", () => {
    assert.equal(getCategory({}), "SYSTEM");
    assert.equal(getCategory({ category: "bogus" }), "SYSTEM");
    assert.equal(getCategory({ category: "nutrition" }), "NUTRITION");
  });
  it("uses the category icon for info/success", () => {
    assert.equal(getNotificationMeta({ category: "TRAINING", type: "info" }).icon, "fitness_center");
    const s = getNotificationMeta({ category: "NUTRITION", type: "success" });
    assert.equal(s.icon, "restaurant");
    assert.equal(s.tone.fg, "var(--success)");
  });
  it("overrides icon and tone for warning/error", () => {
    assert.equal(getNotificationMeta({ category: "GOAL", type: "warning" }).icon, "warning");
    const e = getNotificationMeta({ category: "SOCIAL", type: "error" });
    assert.equal(e.icon, "error");
    assert.equal(e.tone.fg, "var(--error)");
  });
});

describe("splitTitle", () => {
  it("extracts a short leading label", () => {
    assert.deepEqual(splitTitle("🔥 Run Analysis: Great pace today", "Training"), {
      title: "🔥 Run Analysis",
      body: "Great pace today",
    });
  });
  it("keeps the whole message as body when there is no short label", () => {
    const msg = "You hit your protein goal. Keep it up!";
    assert.deepEqual(splitTitle(msg, "Nutrition"), { title: "Nutrition", body: msg });
  });
  it("does not split on URLs", () => {
    const msg = "See https://example.com for details";
    assert.equal(splitTitle(msg, "System").body, msg);
  });
  it("handles null messages", () => {
    assert.deepEqual(splitTitle(null, "System"), { title: "System", body: "" });
  });
});

describe("parseDate / formatRelativeTime", () => {
  it("parses MySQL-style timestamps and rejects junk", () => {
    assert.ok(parseDate("2026-11-19 10:00:00") instanceof Date);
    assert.equal(parseDate("not a date"), null);
    assert.equal(parseDate(null), null);
    assert.equal(formatRelativeTime("garbage", NOW), "");
  });
  it("formats recent times", () => {
    assert.equal(formatRelativeTime(new Date(NOW.getTime() - 10_000), NOW), "Just now");
    assert.equal(formatRelativeTime(new Date(NOW.getTime() - 5 * 60_000), NOW), "5m ago");
    assert.equal(formatRelativeTime(new Date(NOW.getTime() - 3 * 3600_000), NOW), "3h ago");
    assert.equal(formatRelativeTime(at(1), NOW), "Yesterday");
    assert.equal(formatRelativeTime(at(3), NOW), "3d ago");
  });
});

describe("groupByDay", () => {
  it("buckets by local calendar day and preserves order", () => {
    const items = [
      { id: 1, created_at: at(0, 14) },
      { id: 2, created_at: at(0, 9) },
      { id: 3, created_at: at(1, 23, 30) },
      { id: 4, created_at: at(4) },
      { id: 5, created_at: at(20) },
      { id: 6, created_at: null },
      { id: 7, created_at: "nope" },
    ];
    const groups = groupByDay(items, NOW);
    assert.deepEqual(groups.map((g) => g.key), ["today", "yesterday", "week", "older"]);
    assert.deepEqual(groups[0].items.map((n) => n.id), [1, 2]);
    assert.deepEqual(groups[1].items.map((n) => n.id), [3]);
    assert.deepEqual(groups[2].items.map((n) => n.id), [4]);
    assert.deepEqual(groups[3].items.map((n) => n.id), [5, 6, 7]);
  });
  it("omits empty groups and tolerates empty input", () => {
    assert.deepEqual(groupByDay([], NOW), []);
    assert.deepEqual(groupByDay(undefined, NOW), []);
  });
});
