// tests/unit/password-login-compat.test.js — Revision #1 backward compatibility.
// Existing accounts with passwords that fail the NEW policy must still sign
// in; login only records password_weak (Profile "needs attention" warning)
// and upgrades legacy bcrypt cost. In-memory DB via require.cache.
const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');

const dbPath = require.resolve('../../src/config/db');
const servicePath = require.resolve('../../src/services/auth.service');

let user;
let writes;

function installDb() {
  writes = [];
  const execute = async (sql, params = []) => {
    if (/^SELECT id, name, email, phone, password, password_weak/.test(sql)) {
      return [params[0] === user.email ? [{ ...user }] : []];
    }
    if (/^UPDATE users SET password = \?, password_weak = \? WHERE id = \?/.test(sql)) {
      [user.password, user.password_weak] = params;
      writes.push('rehash+flag');
      return [{ affectedRows: 1 }];
    }
    if (/^UPDATE users SET password_weak = \? WHERE id = \?/.test(sql)) {
      [user.password_weak] = params;
      writes.push('flag');
      return [{ affectedRows: 1 }];
    }
    if (/^SELECT avatar_url FROM user_profiles/.test(sql)) return [[]];
    return [{ affectedRows: 1 }];
  };
  require.cache[dbPath] = {
    id: dbPath, filename: dbPath, loaded: true,
    exports: { execute, query: execute, getConnection: async () => ({ execute, release() {} }) },
  };
  delete require.cache[servicePath];
  return require(servicePath);
}

async function seedUser(password, { cost = 10, weak = null } = {}) {
  user = {
    id: 7, name: 'Old User', email: `old${Math.random()}@example.com`, phone: null,
    password: await bcrypt.hash(password, cost), password_weak: weak,
    fitness_goal: 'general fitness', avatar_url: null, is_verified: 1,
    onboarding_completed: 1, is_online: 0, token_version: 0, status: 'active', role: 'member',
  };
}

describe('login with passwords created before the policy', () => {
  let service;
  beforeEach(() => { service = installDb(); });

  it('still signs in with an old weak password and flags it', async () => {
    await seedUser('oldpass1');
    const { user: out } = await service.login({ email: user.email, password: 'oldpass1' });
    assert.equal(out.id, 7);
    assert.equal(user.password_weak, 1);
    assert.equal(Number(out.password_weak), 1);
    // Legacy cost-10 hash upgraded, and the SAME password keeps working.
    assert.equal(bcrypt.getRounds(user.password), 12);
    assert.equal(await bcrypt.compare('oldpass1', user.password), true);

    const again = await service.login({ email: user.email, password: 'oldpass1' });
    assert.equal(again.user.id, 7);
  });

  it('marks a compliant old password as healthy', async () => {
    await seedUser('Tr4ining-Day!', { cost: 12 });
    await service.login({ email: user.email, password: 'Tr4ining-Day!' });
    assert.equal(user.password_weak, 0);
    assert.deepEqual(writes, ['flag']);
  });

  it('writes nothing when the flag and hash are already current', async () => {
    await seedUser('Tr4ining-Day!', { cost: 12, weak: 0 });
    await service.login({ email: user.email, password: 'Tr4ining-Day!' });
    assert.deepEqual(writes, []);
  });

  it('still rejects a wrong password and never touches the flag', async () => {
    await seedUser('oldpass1');
    await assert.rejects(
      service.login({ email: user.email, password: 'nope' }),
      (err) => err.code === 'INVALID_CREDENTIALS',
    );
    assert.deepEqual(writes, []);
    assert.equal(user.password_weak, null);
  });
});


// Code deployed before `npm run db:migrate` (no users.password_weak yet):
// login, /me, register and the cost upgrade must all keep working.
describe('before migration 060 (no password_weak column)', () => {
  const missing = () => Object.assign(new Error("Unknown column 'password_weak' in 'field list'"), { errno: 1054, code: 'ER_BAD_FIELD_ERROR' });

  function installLegacyDb(store) {
    const sqls = [];
    const execute = async (sql, params = []) => {
      sqls.push(sql);
      if (/password_weak/.test(sql) && !/NULL AS password_weak/.test(sql)) throw missing();
      if (/^SELECT id, name, email, phone, password, fitness_goal/.test(sql)) return [params[0] === store.email ? [{ ...store }] : []];
      if (/^UPDATE users SET password = \? WHERE id = \?/.test(sql)) { [store.password] = params; return [{ affectedRows: 1 }]; }
      if (/FROM users u\s+LEFT JOIN user_profiles/.test(sql)) return [[{ id: store.id, name: store.name, email: store.email, password_weak: null }]];
      if (/^INSERT INTO users/.test(sql)) return [{ insertId: 99 }];
      if (/^SELECT avatar_url FROM user_profiles/.test(sql)) return [[]];
      return [[]];
    };
    require.cache[dbPath] = { id: dbPath, filename: dbPath, loaded: true, exports: { execute, query: execute, getConnection: async () => ({ execute, release() {} }) } };
    delete require.cache[servicePath];
    return { service: require(servicePath), sqls };
  }

  it('logs in and still upgrades a cost-10 hash', async () => {
    const store = { id: 3, name: 'Legacy', email: 'legacy@example.com', phone: null, password: await bcrypt.hash('oldpass1', 10), fitness_goal: 'x', avatar_url: null, is_verified: 1, onboarding_completed: 1, is_online: 0, token_version: 0, status: 'active', role: 'member' };
    const { service, sqls } = installLegacyDb(store);
    const { user: out } = await service.login({ email: store.email, password: 'oldpass1' });
    assert.equal(out.id, 3);
    assert.equal(bcrypt.getRounds(store.password), 12);
    assert.ok(sqls.some((s) => /^SELECT id, name, email, phone, password, fitness_goal/.test(s)), 'legacy select used');
  });

  it('/me works and reports no warning', async () => {
    const store = { id: 3, name: 'Legacy', email: 'legacy@example.com' };
    const { service } = installLegacyDb(store);
    const me = await service.getMe(3);
    assert.equal(me.id, 3);
    assert.equal(me.password_weak, null);
  });
});
