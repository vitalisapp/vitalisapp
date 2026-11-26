#!/usr/bin/env node
// Cross-platform test orchestrator.
//
// Jest is the primary runner; the pre-existing node:test suites are kept alive
// and run alongside it. All child processes are forced onto the isolated
// *_test database before any application module is loaded.
//
// Usage:
//   node scripts/run-tests.js --suite auth
//   node scripts/run-tests.js auth            # same suite
//   node scripts/run-tests.js --filter login  # only files with "login" in the path
//   node scripts/run-tests.js --name "logout" # only tests whose title matches
//   node scripts/run-tests.js --jest-only --suite security
//   npm test -- auth --name logout
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const BACKEND = path.join(__dirname, "..");
const TESTS = path.join(BACKEND, "tests");
const JEST_BIN = path.join(BACKEND, "node_modules", "jest", "bin", "jest.js");
const TEST_SECRET = "vitalis-jest-secret-0123456789abcdef0123";

const SUITES = {
  all: {
    jest: ["tests/jest/**/*.test.js"],
    node: ["tests/unit/*.test.js", "tests/integration/*.test.js"],
  },
  api: { jest: ["tests/jest/api/*.test.js"], node: [] },
  auth: {
    jest: ["tests/jest/api/auth-api.test.js"],
    node: ["tests/integration/auth-revocation.test.js"],
  },
  authorization: { jest: ["tests/jest/api/authorization.test.js"], node: [] },
  security: { jest: ["tests/jest/api/security.test.js"], node: [] },
  db: { jest: ["tests/jest/api/db-integrity.test.js"], node: [] },
  external: { jest: ["tests/jest/api/external-failures.test.js"], node: [] },
  modules: { jest: ["tests/jest/api/modules.test.js"], node: [] },
  unit: { jest: ["tests/jest/unit/*.test.js"], node: ["tests/unit/*.test.js"] },
  integration: {
    jest: ["tests/jest/api/*.test.js"],
    node: ["tests/integration/*.test.js"],
  },
  smoke: {
    jest: ["tests/jest/api/endpoint-inventory.test.js"],
    node: ["tests/integration/health.test.js"],
  },
  coverage: {
    jest: ["tests/jest/**/*.test.js"],
    node: ["tests/unit/*.test.js", "tests/integration/*.test.js"],
    coverage: true,
  },
};

function parseArgs(argv) {
  const opts = {
    suite: "all",
    jestOnly: false,
    nodeOnly: false,
    coverage: false,
    onlyFailures: false,
    list: false,
    filter: null,
    name: null,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    switch (arg) {
      case "--suite":
        opts.suite = argv[++i];
        break;
      case "--filter":
        opts.filter = argv[++i];
        break;
      case "--name":
      case "-t":
        opts.name = argv[++i];
        break;
      case "--jest-only":
        opts.jestOnly = true;
        break;
      case "--node-only":
        opts.nodeOnly = true;
        break;
      case "--coverage":
        opts.coverage = true;
        break;
      case "--only-failures":
        opts.onlyFailures = true;
        break;
      case "--list":
        opts.list = true;
        break;
      case "--":
        break;
      default:
        if (arg.startsWith("--")) {
          throw new Error(`Unknown option: ${arg}`);
        }
        if (!opts.filter) opts.filter = arg;
        break;
    }
  }
  if (!SUITES[opts.suite]) {
    throw new Error(`Unknown suite '${opts.suite}'. Choose one of: ${Object.keys(SUITES).join(", ")}`);
  }
  if (opts.jestOnly && opts.nodeOnly) {
    throw new Error("Choose only one of --jest-only or --node-only.");
  }
  return opts;
}

function globToRegExp(glob) {
  const escaped = glob
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replace(/\*\*/g, "@@DOUBLE@@")
    .replace(/\*/g, "[^/]*")
    .replace(/@@DOUBLE@@/g, ".*")
    .replace(/\?/g, "[^/]");
  return new RegExp(`^${escaped}$`);
}

function allTestFiles() {
  const found = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith(".test.js")) found.push(path.relative(BACKEND, full).split(path.sep).join("/"));
    }
  };
  walk(TESTS);
  return found.sort();
}

function selectFiles(patterns, filter) {
  const matchers = patterns.map(globToRegExp);
  return allTestFiles().filter(
    (file) => matchers.some((re) => re.test(file)) && (!filter || file.toLowerCase().includes(filter.toLowerCase())),
  );
}

function childEnv(opts) {
  const dbName = process.env.DB_TEST_NAME || process.env.DB_NAME || "fitnessapp_test";
  if (!/^[a-zA-Z0-9_]+_test$/i.test(dbName)) {
    throw new Error(
      `[test-safety] DB_NAME '${dbName}' is not an explicit *_test schema. ` +
        "Set DB_TEST_NAME=fitnessapp_test (or DB_NAME=fitnessapp_test) before running tests.",
    );
  }
  return {
    ...process.env,
    NODE_ENV: "test",
    DB_NAME: dbName,
    DB_TEST_NAME: dbName,
    JWT_SECRET: TEST_SECRET,
    // Jest's own setup.js mocks external providers. The legacy node:test
    // suites exercise the real OTP service, so do NOT force UNISMS_MOCK here.
    REMINDERS_ENABLED: "false",
    ALLOW_DEV_LINKS: "0",
  };
}

function run(label, command, args, env) {
  console.log(`\n=== ${label} ===`);
  console.log(`${path.basename(command)} ${args.map((a) => (a.includes(path.sep) ? path.basename(a) : a)).join(" ")}`);
  const result = spawnSync(command, args, { cwd: BACKEND, env, stdio: "inherit" });
  if (result.error) {
    console.error(`[${label}] failed to start: ${result.error.message}`);
    return 1;
  }
  return result.status === null ? 1 : result.status;
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  const def = SUITES[opts.suite];
  const env = childEnv(opts);
  const coverage = opts.coverage || def.coverage === true;

  const jestFiles = opts.nodeOnly ? [] : selectFiles(def.jest, opts.filter);
  const nodeFiles = opts.jestOnly ? [] : selectFiles(def.node, opts.filter);

  if (!jestFiles.length && !nodeFiles.length) {
    console.error(`[tests] no files matched suite='${opts.suite}' filter='${opts.filter || "(none)"}'.`);
    process.exit(1);
  }

  if (opts.list) {
    console.log(`Jest (${jestFiles.length}):\n  ${jestFiles.join("\n  ") || "(none)"}`);
    console.log(`node:test (${nodeFiles.length}):\n  ${nodeFiles.join("\n  ") || "(none)"}`);
    return;
  }

  let failed = 0;

  if (jestFiles.length) {
    const args = [JEST_BIN, "--runInBand", "--runTestsByPath", ...jestFiles];
    if (coverage) args.push("--coverage");
    if (opts.onlyFailures) args.push("--onlyFailures");
    if (opts.name) args.push("--testNamePattern", opts.name);
    failed |= run("Jest", process.execPath, args, env);
  }

  if (nodeFiles.length) {
    const args = ["--test"];
    if (opts.name) args.push("--test-name-pattern", opts.name);
    if (coverage) args.push("--experimental-test-coverage");
    args.push(...nodeFiles.map((file) => path.join(BACKEND, file)));
    failed |= run("node:test", process.execPath, args, env);
  }

  console.log(`\n=== summary: ${failed === 0 ? "PASS" : "FAIL"} (suite=${opts.suite}) ===`);
  if (failed) process.exitCode = 1;
}

try {
  main();
} catch (err) {
  console.error(err.message);
  process.exitCode = 1;
}
