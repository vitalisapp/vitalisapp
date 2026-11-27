// tests/unit/sql-quotes.test.js — SQL string literals must be single-quoted.
// Production MySQL (Aiven) runs with sql_mode=ANSI, where "pending" is an
// identifier, so `status = "pending"` fails with "Unknown column 'pending'".
// That silently broke friend requests in production while dev MySQL was fine.
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', '..', 'src');
const SQL_LINE = /\b(SELECT|INSERT|UPDATE|DELETE|WHERE|VALUES|SET|AND|OR)\b/;
// `col = "value"` (not JS ===/!==), `VALUES (?, ?, "value")`, `IN ("value", …)`.
const DOUBLE_QUOTED_LITERAL = new RegExp([
  /(?<![=!<>])=\s*"[a-z_][a-z0-9_ -]*"/.source,
  /\(\s*\?\s*,[^)]*"[a-z_][a-z0-9_ -]*"\s*\)/.source,
  /\bIN\s*\([^)]*"[a-z_][a-z0-9_ -]*"/.source,
].join('|'));

function* jsFiles(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* jsFiles(full);
    else if (entry.name.endsWith('.js')) yield full;
  }
}

describe('SQL quoting', () => {
  it('uses no double-quoted string literals in SQL', () => {
    const offenders = [];
    for (const file of jsFiles(SRC)) {
      fs.readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
        if (line.trim().startsWith('//')) return;
        if (SQL_LINE.test(line) && DOUBLE_QUOTED_LITERAL.test(line)) {
          offenders.push(`${path.relative(SRC, file)}:${i + 1}: ${line.trim()}`);
        }
      });
    }
    assert.deepEqual(offenders, [], `Use 'single quotes' for SQL strings:\n${offenders.join('\n')}`);
  });
});
