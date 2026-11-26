// Fail-closed guard: no test may touch a non-test database.
// Loaded by every Jest setup path BEFORE src/config/db is required.
function assertTestEnvironment() {
  const env = String(process.env.NODE_ENV || "");
  const dbName = String(process.env.DB_NAME || "");

  if (env !== "test") {
    throw new Error(
      `[test-safety] NODE_ENV must be 'test' (got '${env || "unset"}'). Refusing to run.`,
    );
  }
  if (!/^[a-zA-Z0-9_]+_test$/i.test(dbName)) {
    throw new Error(
      `[test-safety] DB_NAME '${dbName || "(unset)"}' is not an explicit *_test schema. ` +
        `Refusing to run tests against shared/production data.`,
    );
  }
  if (String(process.env.JWT_SECRET || "").length < 32) {
    throw new Error("[test-safety] JWT_SECRET must be at least 32 characters for tests.");
  }
  return true;
}

module.exports = { assertTestEnvironment };
