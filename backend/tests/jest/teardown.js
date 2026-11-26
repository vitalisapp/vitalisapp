// Global teardown closes the mysql2 pool so Jest exits cleanly.
// The parent process does not run setupFiles, so set the same safe env here.
process.env.NODE_ENV = "test";
process.env.DB_NAME = process.env.DB_TEST_NAME || "fitnessapp_test";
process.env.JWT_SECRET = process.env.JWT_SECRET || "vitalis-jest-secret-0123456789abcdef0123";

module.exports = async () => {
  require("./helpers/env-guard").assertTestEnvironment();
  try {
    const db = require("../../src/config/db");
    if (typeof db.end === "function") await db.end();
  } catch (err) {
    console.warn(`[jest-teardown] pool close skipped: ${err.message}`);
  }
};
