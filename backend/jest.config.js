// Jest configuration for the Vitalis backend (CommonJS, Node 22+).
// Jest is the primary runner; legacy node:test suites stay available via
// `npm run test:node` and are orchestrated by scripts/run-tests.js.
module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/tests/jest"],
  testMatch: ["**/*.test.js"],
  setupFiles: ["<rootDir>/tests/jest/setup.js"],
  setupFilesAfterEnv: ["<rootDir>/tests/jest/after-env.js"],
  globalTeardown: "<rootDir>/tests/jest/teardown.js",
  clearMocks: true,
  restoreMocks: true,
  detectOpenHandles: true,
  testTimeout: 30000,
  verbose: true,
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/sockets/**",
    "!src/jobs/**",
    "!src/db/migrate.js",
    "!src/db/create-migration.js",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "text-summary", "lcov", "json-summary"],
};
