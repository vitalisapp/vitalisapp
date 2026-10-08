#!/usr/bin/env node
// Idempotent migration runner: tracks _migrations, runs pending *.sql in order.
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const db = require('../config/db');

const MIGRATIONS_DIR = path.join(__dirname, '..', '..', 'migrations');

// 1062 intentionally NOT ignored: seeds must use INSERT IGNORE.
const IGNORED_ERRNOS = new Set([1050, 1060, 1061, 1091, 1146, 1553, 1826, 1830, 1832]);

async function ensureMigrationsTable() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

async function getApplied() {
  const [rows] = await db.execute('SELECT name FROM _migrations ORDER BY id');
  return new Set(rows.map(r => r.name));
}

function getFiles() {
  if (!fs.existsSync(MIGRATIONS_DIR)) return [];
  return fs.readdirSync(MIGRATIONS_DIR).filter(f => f.endsWith('.sql')).sort();
}

function stripComments(sql) {
  // Quote-aware comment strip: '--' inside '...', "...", `...` is a literal,
  // not a comment. Also respects '' escaped quotes and \ escapes.
  let out = '';
  let quote = null;
  let escaped = false;
  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i];
    const nxt = sql[i + 1];
    if (escaped) { out += ch; escaped = false; continue; }
    if (quote) {
      out += ch;
      if (ch === '\\') { escaped = true; continue; }
      if (ch === quote) {
        if (quote === "'" && nxt === "'") { out += "'"; i++; continue; }
        quote = null;
      }
      continue;
    }
    if (ch === "'" || ch === '"' || ch === '`') { quote = ch; out += ch; continue; }
    // -- line comment only when preceded by start/whitespace/semicolon/paren (MySQL rule: -- must be followed by space/control)
    if (ch === '-' && nxt === '-' && (sql[i + 2] === undefined || /[\s;]/.test(sql[i + 2]))) {
      while (i < sql.length && sql[i] !== '\n') i++;
      if (i < sql.length) out += '\n';
      continue;
    }
    // /* block comment */ outside quotes
    if (ch === '/' && nxt === '*') {
      i += 2;
      while (i < sql.length && !(sql[i] === '*' && sql[i + 1] === '/')) i++;
      i += 1; // skip closing '/'
      out += ' ';
      continue;
    }
    out += ch;
  }
  return out;
}

function splitStatements(sql) {
  // Strip line/block comments quote-aware, then split by ; outside quotes/backticks.
  // Naive split(';') breaks procedures and strings containing ';' — track
  // quote state so 'a;b', "a;b", `a;b` stay intact. Same algorithm, safer split.
  const withoutBlockComments = stripComments(sql);
  const out = [];
  let buf = '';
  let quote = null; // ', ", or `
  let escaped = false;
  for (let i = 0; i < withoutBlockComments.length; i++) {
    const ch = withoutBlockComments[i];
    if (escaped) { buf += ch; escaped = false; continue; }
    if (ch === '\\' && quote) { buf += ch; escaped = true; continue; }
    if (quote) {
      buf += ch;
      // SQL escapes single-quote as '' inside string
      if (ch === quote) {
        if (quote === "'" && withoutBlockComments[i + 1] === "'") { buf += "'"; i++; continue; }
        quote = null;
      }
      continue;
    }
    if (ch === "'" || ch === '"' || ch === '`') { quote = ch; buf += ch; continue; }
    if (ch === ';') { const t = buf.trim(); if (t) out.push(t); buf = ''; continue; }
    buf += ch;
  }
  const tail = buf.trim();
  if (tail) out.push(tail);
  return out;
}

async function run() {
  const dryRun = process.argv.includes('--dry-run') || process.argv.includes('--dry');
  const verbose = process.argv.includes('--verbose');
  await ensureMigrationsTable();
  const applied = await getApplied();
  const files = getFiles();
  const pending = files.filter(f => !applied.has(f));
  if (pending.length === 0) {
    console.log('✔ No pending migrations');
    return;
  }
  console.log(`Pending (${pending.length}): ${pending.join(', ')}`);
  if (dryRun) {
    for (const file of pending) {
      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
      console.log(`  • ${file} (${splitStatements(sql).length} statements)`);
    }
    console.log('Dry run — no changes applied. Run without --dry-run to execute.');
    return;
  }
  for (const file of pending) {
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
    const statements = splitStatements(sql);
    const conn = await db.getConnection();
    try {
      await conn.query('START TRANSACTION');
      for (const raw of statements) {
        if (!raw) continue;
        const stmt = raw.trim();
        // Skip empty or comment-only
        if (!stmt || stmt.startsWith('--')) continue;
        try {
          if (verbose) console.log(`  → ${stmt.slice(0, 120)}${stmt.length > 120 ? '…' : ''}`);
          await conn.query(stmt);
        } catch (e) {
          if (IGNORED_ERRNOS.has(e.errno) || /Duplicate|already exists|Duplicate key/i.test(e.message)) {
            console.log(`  ↷ Ignored (already exists): ${e.message.split('\n')[0].slice(0, 180)}`);
            continue;
          }
          throw e;
        }
      }
      await conn.query('INSERT INTO _migrations (name) VALUES (?)', [file]);
      await conn.query('COMMIT');
      console.log(`✔ Applied ${file} (${statements.length} statements)`);
    } catch (e) {
      try { await conn.query('ROLLBACK'); } catch (_) {}
      console.error(`✘ Failed ${file}: [${e.errno}] ${e.message}`);
      // Never dump full SQL in production logs (may contain schema/PII) — truncated hint only in dev.
      if (e.sql && process.env.NODE_ENV !== 'production') console.error('  SQL:', String(e.sql).slice(0, 200));
      throw e;
    } finally {
      conn.release();
    }
  }
  console.log('Done.');
}

if (require.main === module) {
  run().then(() => process.exit(0)).catch(() => { process.exit(1); });
}
module.exports = { run, splitStatements, stripComments, IGNORED_ERRNOS };
