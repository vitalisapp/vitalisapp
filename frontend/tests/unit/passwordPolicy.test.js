// Revision #1 — client password policy must mirror the server rule.
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import {
  MIN_LENGTH,
  PASSWORD_RULES,
  checkPassword,
  getPasswordStrength,
} from "../../src/lib/passwordPolicy.js";

const require = createRequire(import.meta.url);
const server = require("../../../backend/src/utils/passwordPolicy.js");

const SAMPLES = [
  "", "abc", "oldpass1", "Passw0rd!", "Tr4ining-Day!", "tr4ining-day!",
  "TR4INING-DAY!", "Training-Day!", "Tr4iningDay12", "Tr4ining Day12",
  "Password123!", "P@ssword-123", "Vitalis1234!", `Aa1!${"x".repeat(68)}`,
  `Aa1!${"x".repeat(69)}`, "Ñandú-Pássw0rd-2026",
];

describe("client password policy", () => {
  it("requires 12 characters and five rules", () => {
    assert.equal(MIN_LENGTH, 12);
    assert.deepEqual(PASSWORD_RULES.map((r) => r.key), ["length", "upper", "lower", "number", "special"]);
  });

  it("agrees with the server on every sample (same verdict, same failures)", () => {
    for (const pw of SAMPLES) {
      const c = checkPassword(pw);
      const s = server.checkPassword(pw);
      assert.equal(c.ok, s.ok, pw);
      assert.deepEqual(c.failed, s.failed, pw);
    }
  });

  it("only shows Strong when the policy passes", () => {
    assert.equal(getPasswordStrength(""), null);
    assert.equal(getPasswordStrength("Tr4ining-Day!").key, "strong");
    assert.notEqual(getPasswordStrength("Password123!").key, "strong");
    assert.notEqual(getPasswordStrength("Tr4iningDay12").key, "strong");
    assert.equal(getPasswordStrength("abc").key, "weak");
  });

  it("gives a clear message listing what is missing", () => {
    assert.match(checkPassword("abcdefghijkl").message, /uppercase letter, a number and a special character/);
    assert.equal(checkPassword("Tr4ining-Day!").message, null);
  });
});
