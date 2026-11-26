// Run a query that uses a column from a not-yet-applied migration, falling
// back to the legacy query when MySQL reports that column as unknown (1054).
// Keeps login / register / password changes working between deploying code
// and running `npm run db:migrate`.
function isMissingColumn(err, column) {
  return Boolean(err) && err.errno === 1054 && (!column || String(err.message || '').includes(column));
}

async function executeCompat(conn, column, [sql, params], [legacySql, legacyParams = params]) {
  try {
    return await conn.execute(sql, params);
  } catch (err) {
    if (!isMissingColumn(err, column)) throw err;
    return conn.execute(legacySql, legacyParams);
  }
}

module.exports = { executeCompat, isMissingColumn };
