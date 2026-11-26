#!/usr/bin/env node
// Creates the isolated test schema (never drops/resets anything).
// Safety: refuses any DB_NAME that is not explicitly *_test.
require("dotenv").config();
const mysql = require("mysql2/promise");

const name = process.env.DB_TEST_NAME || process.env.DB_NAME || "";
if (!/^[a-zA-Z0-9_]+_test$/i.test(name)) {
  console.error(
    `[test-db] Refusing to touch '${name || "(empty)"}': test database name must end in _test.`,
  );
  process.exit(1);
}

(async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASS || undefined,
    connectTimeout: 5000,
  });
  try {
    await conn.query(
      `CREATE DATABASE IF NOT EXISTS \`${name}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    );
    const [rows] = await conn.query(
      "SELECT SCHEMA_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = ?",
      [name],
    );
    console.log(`[test-db] Ready: ${rows.length ? name : "missing after CREATE"}`);
  } finally {
    await conn.end();
  }
})().catch((err) => {
  console.error(`[test-db] Failed: ${err.code || err.message}`);
  process.exit(1);
});
