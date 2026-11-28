// scripts/build-database-sql.js — regenerate the repo-root database.sql.
//
//   npm run db:sql
//   npm run db:sql -- --demo  (five demo members + admin, every table populated)
//
// Creates a throwaway database, applies EVERY migration to it (so it holds
// only schema + the migrations' own seed data — never real user records),
// exports it to ../database.sql in a MariaDB 10.4 / MySQL 8 friendly form,
// then drops the throwaway database. Your DB_NAME database is never touched.
// Run it after adding a migration so database.sql stays the full snapshot.
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const { execFileSync } = require('child_process');
const mysql = require('mysql2/promise');

const TMP_DB = `vitalis_sqlbuild_${Date.now()}`;
const OUT = path.join(__dirname, '..', '..', 'database.sql');
const DEMO = process.argv.includes('--demo');
const conn = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || undefined,
  dateStrings: true,
  supportBigNumbers: true,
  bigNumberStrings: true,
};

const esc = (v) => {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'number' || typeof v === 'bigint') return String(v);
  if (typeof v === 'boolean') return v ? '1' : '0';
  if (Buffer.isBuffer(v)) return `0x${v.toString('hex')}`;
  if (typeof v === 'object') v = JSON.stringify(v);
  return `'${String(v).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\0/g, '\\0')}'`;
};

// MySQL 8 → also importable on XAMPP MariaDB 10.4.
const portable = (ddl) => ddl
  .replace(/utf8mb4_0900_ai_ci/g, 'utf8mb4_unicode_ci')
  .replace(/ AUTO_INCREMENT=\d+/, '')
  .replace(/^CREATE TABLE `/, 'CREATE TABLE IF NOT EXISTS `');

// CREATE TABLE IF NOT EXISTS skips a table that already exists, so an older
// copy would lack newer columns and the INSERTs below would fail with 1054.
// For every column, add it only when information_schema says it is missing.
// Prepared statements keep this portable (MySQL 8 has no ADD COLUMN IF NOT EXISTS)
// and need no DELIMITER, so it pastes cleanly into phpMyAdmin.
function addMissingColumns(table, createSql) {
  const lines = [];
  for (const raw of createSql.split('\n')) {
    const m = raw.match(/^\s+`([^`]+)`\s+(.+?),?$/);
    if (!m) continue;
    const [, col, def] = m;
    if (/AUTO_INCREMENT/i.test(def)) continue; // the id column always exists with its table
    const alter = `ALTER TABLE \`${table}\` ADD COLUMN \`${col}\` ${def}`.replace(/'/g, "''");
    lines.push(
      `SET @s = (SELECT IF(COUNT(*) = 0, '${alter}', 'DO 0') FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = '${table}' AND column_name = '${col}');`,
      'PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;',
    );
  }
  return lines.length ? ['', `-- Add any columns an older \`${table}\` is missing`, ...lines] : [];
}

// Same idea for foreign keys: an older existing table keeps no FK, so add each
// one only when information_schema shows it is missing. (FOREIGN_KEY_CHECKS=0
// is set at the top of the file, so existing rows are not re-validated.)
function addMissingForeignKeys(table, createSql) {
  const lines = [];
  for (const raw of createSql.split('\n')) {
    const m = raw.match(/^\s+CONSTRAINT `([^`]+)` (FOREIGN KEY .+?),?$/);
    if (!m) continue;
    const [, name, def] = m;
    const alter = `ALTER TABLE \`${table}\` ADD CONSTRAINT \`${name}\` ${def}`.replace(/'/g, "''");
    lines.push(
      `SET @s = (SELECT IF(COUNT(*) = 0, '${alter}', 'DO 0') FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = '${table}' AND constraint_name = '${name}' AND constraint_type = 'FOREIGN KEY');`,
      'PREPARE vitalis_stmt FROM @s; EXECUTE vitalis_stmt; DEALLOCATE PREPARE vitalis_stmt;',
    );
  }
  return lines.length ? ['', `-- Add any foreign keys an older \`${table}\` is missing`, ...lines] : [];
}

async function dump(srcDb, outFile) {
  const c = await mysql.createConnection({ ...conn, database: srcDb, dateStrings: true, supportBigNumbers: true, bigNumberStrings: true });
  const [tables] = await c.query(
    "SELECT table_name AS t FROM information_schema.tables WHERE table_schema = ? AND table_type = 'BASE TABLE' ORDER BY table_name", [srcDb],
  );
  const names = tables.map((r) => r.t);
  const [migs] = await c.query('SELECT name FROM _migrations ORDER BY name');

  const out = [];
  out.push(`-- database.sql - Vitalis full schema + seed data
-- Generated for a clean XAMPP (MariaDB 10.4) / MySQL 8 phpMyAdmin import.
--
-- Source of truth: backend/migrations/001..${migs[migs.length - 1].name.slice(0, 3)} (${migs.length} files).
-- Built by applying every migration to an EMPTY database and exporting it,
-- so this file holds the schema plus seed data and no real user records.
-- Dataset: ${DEMO ? 'DEMO: user5@gmail.com through user9@gmail.com + admin@gmail.com; all passwords: 12345678.' : 'Clean: plans, food catalog and default admin account.'}
${DEMO ? '-- Demo photos are placeholder PNGs. Verification/reset records are used and expired.\n-- Demo email-delivery entries are fixtures; no messages were sent.\n' : ''}-- Non-destructive: nothing is dropped. Existing tables and rows are kept.
-- Rebuild: npm run db:sql${DEMO ? ' -- --demo' : ''} (from backend/).
-- Regenerated: ${new Date().toISOString().slice(0, 10)}.
--
-- What this does:
--   1. Creates database \`fitnessapp\` and selects it.
--   2. Creates each of the ${names.length - 1} application tables + \`_migrations\` only if
--      it does not exist yet (CREATE TABLE IF NOT EXISTS).
--   3. Loads seed rows with INSERT IGNORE: a row whose id/unique key already
--      exists is skipped, so existing data is never overwritten.
--   4. Fills \`_migrations\` ONLY when it is empty (fresh install). On an
--      existing database its history is left alone, so afterwards run
--      \`npm run db:migrate\` to add any columns/tables that copy is missing.
--
-- Default admin (from 040_admin_seed.sql): admin@gmail.com / 12345678.
-- Change that password after the first sign-in.
--
-- Safe to paste straight into the phpMyAdmin "Import" tab or the SQL tab.

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
SET @OLD_SQL_MODE = @@SQL_MODE;
SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';

CREATE DATABASE IF NOT EXISTS \`fitnessapp\`
  DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE \`fitnessapp\`;`);

  let rowsTotal = 0;
  const seeded = [];
  for (const t of names) {
    const [[ddl]] = await c.query(`SHOW CREATE TABLE \`${t}\``);
    out.push('', '-- --------------------------------------------------------', `-- Table \`${t}\``, '-- --------------------------------------------------------');
    const createSql = portable(ddl['Create Table']);
    out.push(`${createSql};`);
    out.push(...addMissingColumns(t, createSql));
    out.push(...addMissingForeignKeys(t, createSql));
    const [rows] = await c.query(`SELECT * FROM \`${t}\``);
    if (!rows.length) continue;
    rowsTotal += rows.length;
    seeded.push(`${t} (${rows.length})`);
    if (t === '_migrations') {
      // Mark migrations applied only on a fresh install. An existing DB keeps
      // its own history so `npm run db:migrate` still applies what it lacks.
      const sel = rows.map((r) => `SELECT ${esc(r.name)} AS name, ${esc(r.applied_at)} AS applied_at`).join('\n  UNION ALL ');
      out.push('', 'SET @vitalis_fresh = (SELECT COUNT(*) = 0 FROM `_migrations`);',
        `INSERT IGNORE INTO \`_migrations\` (\`name\`, \`applied_at\`)\nSELECT m.name, m.applied_at FROM (\n  ${sel}\n) m WHERE @vitalis_fresh = 1;`);
      continue;
    }
    const cols = Object.keys(rows[0]).map((k) => `\`${k}\``).join(', ');
    for (let i = 0; i < rows.length; i += 100) {
      const chunk = rows.slice(i, i + 100).map((r) => `(${Object.values(r).map(esc).join(', ')})`).join(',\n');
      out.push('', `INSERT IGNORE INTO \`${t}\` (${cols}) VALUES\n${chunk};`);
    }
  }

  out.push('', 'SET SQL_MODE = @OLD_SQL_MODE;', 'SET FOREIGN_KEY_CHECKS = 1;', '', `-- Done. Tables: ${names.length - 1} + _migrations. Seeded: ${seeded.join(', ')}.`, '');
  fs.writeFileSync(outFile, out.join('\n'), 'utf8');
  await c.end();
  return { tables: names.length, migrations: migs.length, rows: rowsTotal, seeded };
}

(async () => {
  const admin = await mysql.createConnection(conn);
  await admin.query(`CREATE DATABASE \`${TMP_DB}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  try {
    execFileSync(process.execPath, [path.join(__dirname, '..', 'src', 'db', 'migrate.js')], {
      env: { ...process.env, DB_NAME: TMP_DB },
      stdio: ['ignore', 'ignore', 'inherit'],
    });
    if (DEMO) {
      const demo = await mysql.createConnection({ ...conn, database: TMP_DB });
      try {
        await require('./seed-demo-data')(demo);
      } finally {
        await demo.end();
      }
    }
    const tmpFile = `${OUT}.tmp`;
    const info = await dump(TMP_DB, tmpFile);
    if (DEMO) await require('./verify-demo-sql')(conn, tmpFile);
    fs.renameSync(tmpFile, OUT);
    console.log(`database.sql updated: ${info.tables} tables, ${info.migrations} migrations, seeded ${info.seeded.join(', ')}`);
  } finally {
    await admin.query(`DROP DATABASE IF EXISTS \`${TMP_DB}\``);
    await admin.end();
  }
})().catch((e) => { console.error('db:sql failed:', e.message); process.exit(1); });
