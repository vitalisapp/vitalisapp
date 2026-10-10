// tests/integration/env-guards.test.js — env fail-fast guards run in a child
// process (env.js calls process.exit on violation, so it cannot be required
// in-process). Pins: ALLOW_DEV_LINKS=1 is refused in production.
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const path = require('node:path');

const REPO_BACKEND = path.resolve(__dirname, '..', '..');

function loadEnv(extra) {
  return spawnSync(
    process.execPath,
    ['-e', "require('./src/config/env'); console.log('ENV_OK');"],
    {
      cwd: REPO_BACKEND,
      env: {
        ...process.env,
        NODE_ENV: 'production',
        DB_HOST: '127.0.0.1',
        DB_USER: 'root',
        DB_PASS: 'x',
        DB_NAME: 'fitnessapp',
        JWT_SECRET: 'test-secret-min-32-chars-0123456789ab',
        TZ: 'UTC',
        ...extra,
      },
      encoding: 'utf8',
    }
  );
}

describe('env fail-fast guards', () => {
  it('refuses ALLOW_DEV_LINKS=1 in production', () => {
    const r = loadEnv({ ALLOW_DEV_LINKS: '1' });
    assert.notEqual(r.status, 0);
    assert.match(r.stderr + r.stdout, /ALLOW_DEV_LINKS/);
  });

  it('loads fine with ALLOW_DEV_LINKS unset in production', () => {
    const r = loadEnv({ ALLOW_DEV_LINKS: '0' });
    assert.equal(r.status, 0);
    assert.match(r.stdout, /ENV_OK/);
  });
});
