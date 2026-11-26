const { assertTestEnvironment } = require("./env-guard");
assertTestEnvironment();

const db = require("../../../src/config/db");

async function execute(sql, params = []) {
  return db.execute(sql, params);
}

async function query(sql, params = []) {
  return db.query(sql, params);
}

// Deleting a test user cascades to virtually all child rows (see migrations).
// Only ever called against the guarded *_test schema.
async function cleanupUserIds(ids) {
  const clean = [...new Set(ids.filter((n) => Number.isInteger(Number(n))))];
  if (!clean.length) return;
  const placeholders = clean.map(() => "?").join(",");
  await db.execute(`DELETE FROM users WHERE id IN (${placeholders})`, clean);
}

async function tableExists(name) {
  const [rows] = await db.execute(
    "SELECT COUNT(*) AS n FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?",
    [name],
  );
  return rows[0].n > 0;
}

module.exports = { db, execute, query, cleanupUserIds, tableExists };
