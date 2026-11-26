// start-prod.js — cross-platform production boot (Windows-safe).
// package.json "start:prod" used Unix-only `NODE_ENV=production node server.js`
// which breaks on PowerShell/cmd. This wrapper sets NODE_ENV, applies any
// pending database migrations, then boots server.js.
//
// Migrations run on every boot so a deploy can never ship code that needs a
// column the database does not have yet (e.g. "Progression needs database
// migration 061"). The runner is idempotent: already-applied files are skipped.
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

async function migrate() {
  if (process.env.SKIP_MIGRATIONS === '1') {
    console.log('[boot] SKIP_MIGRATIONS=1 — not running migrations');
    return;
  }
  const db = require('./src/config/db');
  const { run } = require('./src/db/migrate');
  // Several instances booting at once must not apply the same file twice.
  const conn = await db.getConnection();
  try {
    const [[lock]] = await conn.query("SELECT GET_LOCK('vitalis:migrate', 60) AS ok");
    if (Number(lock.ok) !== 1) {
      console.warn('[boot] another instance is migrating — skipping');
      return;
    }
    try {
      await run();
    } finally {
      await conn.query("SELECT RELEASE_LOCK('vitalis:migrate')");
    }
  } finally {
    conn.release();
  }
}

migrate()
  .catch((e) => {
    // Keep the site up: features that need the failed migration report
    // NEEDS_MIGRATION, everything else keeps working. The error is in the log.
    console.error(`[boot] migrations failed: ${e.message} — starting server anyway`);
  })
  .finally(() => require('./server.js'));
