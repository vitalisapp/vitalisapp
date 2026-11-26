// Per-test-file teardown. Jest isolates module registries per file, so the
// mysql2 pool created inside this registry must be closed here (a global
// teardown sees a different pool instance and cannot close it).
afterAll(async () => {
  try {
    const db = require("../../src/config/db");
    if (typeof db.end === "function") await db.end();
  } catch (err) {
    console.warn(`[jest-after-env] pool close skipped: ${err.message}`);
  }
});
