// Frontend smoke tests — pure logic only, no DOM, no new deps (node --test).
// Covers src/lib/avatar.js which drives every avatar render offline.
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  getInitials,
  avatarGradient,
  resolveAvatar,
} from "../../src/lib/avatar.js";

describe("getInitials", () => {
  it("returns ? for empty names", () => {
    assert.equal(getInitials(""), "?");
    assert.equal(getInitials(null), "?");
    assert.equal(getInitials("   "), "?");
  });
  it("uses first two letters for single names", () => {
    assert.equal(getInitials("Ana"), "AN");
  });
  it("uses first + last initials", () => {
    assert.equal(getInitials("Juan Dela Cruz"), "JC");
  });
});

describe("avatarGradient", () => {
  it("is deterministic per seed", () => {
    assert.equal(avatarGradient("ana"), avatarGradient("ana"));
  });
  it("differs across seeds (spot check)", () => {
    assert.notEqual(avatarGradient("ana"), avatarGradient("zzz-top"));
  });
});

describe("resolveAvatar", () => {
  it("passes through http image URLs", () => {
    const r = resolveAvatar("https://cdn.example.com/a.png", "Ana");
    assert.equal(r.kind, "image");
    assert.equal(r.src, "https://cdn.example.com/a.png");
  });
  it("falls back to initials for retired hosts", () => {
    const r = resolveAvatar("https://dicebear.example/abc.svg", "Ana");
    assert.equal(r.kind, "initials");
    assert.equal(r.initials, "AN");
  });
  it("falls back to initials for empty / preset tokens", () => {
    assert.equal(resolveAvatar("", "Ana").kind, "initials");
    assert.equal(resolveAvatar("preset:atlas", "Ana").kind, "initials");
  });
});
