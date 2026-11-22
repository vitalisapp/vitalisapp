// Import the actual export twice into a disposable database, never fitnessapp.
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const assert = require('node:assert/strict');

module.exports = async function verifyDemoSql(config, file) {
  const name = `vitalis_sqlverify_${Date.now()}`;
  const sql = fs.readFileSync(file, 'utf8');
  assert.equal((sql.match(/CREATE DATABASE IF NOT EXISTS `fitnessapp`/g) || []).length, 1);
  assert.equal((sql.match(/USE `fitnessapp`;/g) || []).length, 1);
  const isolated = sql
    .replace('CREATE DATABASE IF NOT EXISTS `fitnessapp`', `CREATE DATABASE IF NOT EXISTS \`${name}\``)
    .replace('USE `fitnessapp`;', `USE \`${name}\`;`);
  const db = await mysql.createConnection({ ...config, multipleStatements: true });
  try {
    let previousCounts;
    for (let pass = 1; pass <= 2; pass += 1) {
      await db.query(isolated);
      const [tables] = await db.execute('SELECT TABLE_NAME AS name FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? ORDER BY TABLE_NAME', [name]);
      const counts = {};
      for (const table of tables) {
        const [[row]] = await db.query(`SELECT COUNT(*) AS count FROM \`${table.name}\``);
        assert.ok(row.count > 0, `Empty demo table: ${table.name}`);
        counts[table.name] = row.count;
      }
      if (previousCounts) assert.deepEqual(counts, previousCounts, 'Reset import duplicated or lost records');
      previousCounts = counts;
      const [users] = await db.query('SELECT name, email, password, role, status, is_verified, onboarding_completed FROM users ORDER BY email');
      assert.deepEqual(users.map((u) => u.email), ['admin@gmail.com', ...[5, 6, 7, 8, 9].map((n) => `user${n}@gmail.com`)]);
      for (const user of users) {
        assert.ok(await bcrypt.compare('12345678', user.password), `Password mismatch: ${user.email}`);
        assert.equal(user.role, user.email === 'admin@gmail.com' ? 'admin' : 'member');
        if (user.role === 'member') assert.equal(user.name, user.email.split('@')[0]);
        assert.equal(user.status, 'active');
        assert.equal(user.is_verified, 1);
        assert.equal(user.onboarding_completed, 1);
      }
      const [migrations] = await db.query('SELECT name FROM _migrations ORDER BY name');
      const expected = fs.readdirSync(path.join(__dirname, '../migrations')).filter((f) => f.endsWith('.sql')).sort();
      assert.deepEqual(migrations.map((m) => m.name), expected);
      // FOREIGN_KEY_CHECKS=1 alone does not retroactively validate imported rows.
      const [keys] = await db.execute(
        `SELECT TABLE_NAME AS child, COLUMN_NAME AS col, REFERENCED_TABLE_NAME AS parent,
         REFERENCED_COLUMN_NAME AS ref FROM information_schema.KEY_COLUMN_USAGE
         WHERE TABLE_SCHEMA = ? AND REFERENCED_TABLE_NAME IS NOT NULL`, [name],
      );
      for (const key of keys) {
        const [[row]] = await db.query(
          `SELECT COUNT(*) AS count FROM \`${key.child}\` c LEFT JOIN \`${key.parent}\` p
           ON c.\`${key.col}\` = p.\`${key.ref}\` WHERE c.\`${key.col}\` IS NOT NULL AND p.\`${key.ref}\` IS NULL`,
        );
        assert.equal(Number(row.count), 0, `Orphaned rows: ${key.child}.${key.col}`);
      }
      const [[sets]] = await db.query('SELECT COUNT(*) AS count FROM workout_sets s JOIN workout_logs w ON w.id = s.workout_log_id WHERE s.user_id <> w.user_id');
      assert.equal(Number(sets.count), 0, 'Workout set ownership mismatch');
      console.log(`Demo import pass ${pass}: ${tables.length} populated tables, ${users.length} valid logins, ${keys.length} foreign keys verified.`);
    }
  } finally {
    try {
      await db.query(`DROP DATABASE IF EXISTS \`${name}\``);
    } finally {
      await db.end();
    }
  }
};
