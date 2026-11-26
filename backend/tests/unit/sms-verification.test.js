// SMS OTP verification — mocked UniSMS + in-memory DB.
// No real SMS, no real DB rows: the provider's HTTP call is stubbed with
// global fetch, and src/config/db is replaced via require.cache.
const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('crypto');

const dbPath = require.resolve('../../src/config/db');

// ─── tiny in-memory DB ───
function createDb(seed = {}) {
  const state = {
    users: (seed.users || []).map((u) => ({ is_verified: 0, phone: null, ...u })),
    verifications: (seed.verifications || []).map((v) => ({ attempts: 0, used: 0, ...v })),
    nextId: (seed.verifications || []).reduce((max, v) => Math.max(max, v.id || 0), 0) + 1,
  };

  const findUserByEmail = (email) => state.users.find((u) => u.email === email);
  const activeFor = (userId) =>
    state.verifications.filter((v) => v.user_id === userId && !v.used).sort((a, b) => b.id - a.id);

  const execute = async (sql, params = []) => {
    const q = String(sql).replace(/\s+/g, ' ').trim();

    if (q.includes('FROM users WHERE email = ?') && q.includes('LIMIT 1')) {
      const user = findUserByEmail(params[0]);
      return [
        user
          ? [{ id: user.id, name: user.name, email: user.email, phone: user.phone, is_verified: user.is_verified }]
          : [],
        [],
      ];
    }

    if (q.includes('SELECT id FROM users WHERE phone = ?')) {
      const [phone, excludeId] = params;
      return [state.users.filter((u) => u.phone === phone && u.id !== excludeId).map((u) => ({ id: u.id })), []];
    }

    if (q.includes('SELECT last_sent_at FROM phone_verifications')) {
      const [row] = activeFor(params[0]);
      return [row ? [{ last_sent_at: row.last_sent_at }] : [], []];
    }

    if (q.includes('FROM phone_verifications WHERE user_id = ? AND used = 0 ORDER BY id DESC LIMIT 1')) {
      const [row] = activeFor(params[0]);
      return [
        row
          ? [{
              id: row.id,
              phone: row.phone,
              otp_hash: row.otp_hash,
              expires_at: row.expires_at,
              attempts: row.attempts,
            }]
          : [],
        [],
      ];
    }

    if (q.includes('SELECT COUNT(*) AS total FROM phone_verifications')) {
      const oneHourAgo = Date.now() - 60 * 60 * 1000;
      const total = state.verifications.filter(
        (v) => v.user_id === params[0] && new Date(v.created_at || v.last_sent_at).getTime() > oneHourAgo,
      ).length;
      return [[{ total }], []];
    }

    if (q.startsWith('UPDATE phone_verifications SET used = 1 WHERE user_id = ? AND used = 0')) {
      state.verifications.forEach((v) => {
        if (v.user_id === params[0] && !v.used) v.used = 1;
      });
      return [{ affectedRows: 1 }, []];
    }

    if (q.startsWith('UPDATE phone_verifications SET used = 1 WHERE id = ?')) {
      const row = state.verifications.find((v) => v.id === params[0]);
      if (row) row.used = 1;
      return [{ affectedRows: row ? 1 : 0 }, []];
    }

    if (q.startsWith('UPDATE phone_verifications SET attempts = attempts + 1')) {
      const row = state.verifications.find((v) => v.id === params[0]);
      if (row) row.attempts += 1;
      return [{ affectedRows: row ? 1 : 0 }, []];
    }

    if (q.startsWith('UPDATE phone_verifications SET reference_id')) {
      const row = state.verifications.find((v) => v.id === params[1]);
      if (row) row.reference_id = params[0];
      return [{ affectedRows: row ? 1 : 0 }, []];
    }

    if (q.startsWith('INSERT INTO phone_verifications')) {
      const [user_id, phone, otp_hash, expires_at] = params;
      const row = {
        id: state.nextId++,
        user_id,
        phone,
        otp_hash,
        expires_at,
        attempts: 0,
        used: 0,
        last_sent_at: new Date(),
        created_at: new Date(),
        reference_id: null,
      };
      state.verifications.push(row);
      return [{ insertId: row.id, affectedRows: 1 }, []];
    }

    if (q.startsWith('DELETE FROM phone_verifications WHERE id = ?')) {
      state.verifications = state.verifications.filter((v) => v.id !== params[0]);
      return [{ affectedRows: 1 }, []];
    }

    if (q.startsWith('UPDATE users SET phone = ?')) {
      const user = state.users.find((u) => u.id === params[1]);
      if (user) {
        if (state.users.some((u) => u.phone === params[0] && u.id !== user.id)) {
          const err = new Error('Duplicate entry for key uq_users_phone');
          err.code = 'ER_DUP_ENTRY';
          throw err;
        }
        user.phone = params[0];
        user.phone_verified_at = new Date();
        user.is_verified = 1;
      }
      return [{ affectedRows: 1 }, []];
    }

    if (q.includes('FROM users WHERE email = ?') && q.includes('token_version')) {
      const user = findUserByEmail(params[0]);
      return [
        user
          ? [{
              id: user.id,
              name: user.name,
              email: user.email,
              phone: user.phone,
              avatar_url: null,
              fitness_goal: null,
              token_version: 0,
              is_verified: user.is_verified,
              onboarding_completed: 0,
              role: 'member',
              status: 'active',
              accepted_terms_at: null,
              accepted_terms_version: null,
            }]
          : [],
        [],
      ];
    }

    throw new Error(`Unexpected SQL: ${q}`);
  };

  const conn = {
    execute,
    beginTransaction: async () => {},
    commit: async () => {},
    rollback: async () => {},
    release: () => {},
  };

  return { state, execute, getConnection: async () => conn };
}

let db;
function installDb(seed) {
  db = createDb(seed);
  require.cache[dbPath] = { id: dbPath, filename: dbPath, loaded: true, exports: db };
  // Fresh module instance so the cached db is the one used.
  delete require.cache[require.resolve('../../src/services/phoneVerification.service')];
}

const { normalizePhMobile, isValidPhMobile, maskPhone } = require('../../src/utils/phone');

const sms = require('../../src/services/sms.service');
const realSendSms = sms.sendSms;
let sent = [];

beforeEach(() => {
  sent = [];
  sms.sendSms = async ({ content }) => {
    sent.push(content);
    return { accepted: true, mocked: true, referenceId: null, status: 'mocked' };
  };
});

afterEach(() => {
  sms.sendSms = realSendSms;
});

function lastCode() {
  const match = String(sent.at(-1) || '').match(/\b(\d{6})\b/);
  return match ? match[1] : null;
}

function loadService() {
  return require('../../src/services/phoneVerification.service');
}

// ─── number normalisation ───
describe('PH mobile normalisation', () => {
  it('accepts both requested formats and their variants', () => {
    assert.equal(normalizePhMobile('09171234567'), '+639171234567');
    assert.equal(normalizePhMobile('+639171234567'), '+639171234567');
    assert.equal(normalizePhMobile('639171234567'), '+639171234567');
    assert.equal(normalizePhMobile('9171234567'), '+639171234567');
    assert.equal(normalizePhMobile('+63 917 123 4567'), '+639171234567');
    assert.equal(normalizePhMobile('0917-123-4567'), '+639171234567');
    assert.equal(normalizePhMobile('(0917) 123.4567'), '+639171234567');
  });

  it('rejects non-Philippine and malformed numbers', () => {
    assert.equal(normalizePhMobile(''), '');
    assert.equal(normalizePhMobile('12345'), '');
    assert.equal(normalizePhMobile('+12025550123'), '');
    assert.equal(normalizePhMobile('0917123456'), ''); // too short
    assert.equal(normalizePhMobile('091712345678'), ''); // too long
    assert.equal(isValidPhMobile('09171234567'), true);
    assert.equal(isValidPhMobile('0212345678'), false);
  });

  it('masks numbers for display without exposing the full value', () => {
    const masked = maskPhone('09171234567');
    assert.equal(masked, '+63917***4567');
    assert.ok(!masked.includes('1234567'));
  });
});

// ─── sendCode ───
describe('sendCode', () => {
  it('stores only a hash, sets a 5-minute expiry and never returns the code', async () => {
    installDb({ users: [{ id: 1, name: 'Ana', email: 'ana@example.com', phone: null, is_verified: 0 }] });
    const { sendCode, OTP_TTL_MS } = loadService();

    const result = await sendCode({ email: 'ana@example.com', phone: '09171234567' });

    assert.equal(result.phoneMasked, '+63917***4567');
    assert.equal(result.retryAfter, 60);
    assert.equal(result.expiresIn, 300);
    assert.equal(result.mocked, true);
    assert.ok(!JSON.stringify(result).match(/\d{6}/), 'response must not leak the code');

    const row = db.state.verifications[0];
    const code = lastCode();
    assert.ok(code && code.length === 6);
    assert.notEqual(row.otp_hash, code);
    assert.equal(row.otp_hash, crypto.createHash('sha256').update(code).digest('hex'));
    const ttl = new Date(row.expires_at).getTime() - Date.now();
    assert.ok(ttl > OTP_TTL_MS - 5000 && ttl <= OTP_TTL_MS, `unexpected TTL ${ttl}`);
  });

  it('rejects an invalid number before sending', async () => {
    installDb({ users: [{ id: 1, name: 'Ana', email: 'ana@example.com', phone: null }] });
    const { sendCode } = loadService();

    await assert.rejects(
      sendCode({ email: 'ana@example.com', phone: '12345' }),
      (err) => err.code === 'PHONE_INVALID' && err.status === 400,
    );
    assert.equal(sent.length, 0);
  });

  it('enforces the 60-second resend cooldown', async () => {
    installDb({
      users: [{ id: 1, name: 'Ana', email: 'ana@example.com', phone: '+639171234567' }],
      verifications: [{
        id: 1, user_id: 1, phone: '+639171234567', otp_hash: 'x',
        expires_at: new Date(Date.now() + 300000), used: 0,
        last_sent_at: new Date(), created_at: new Date(),
      }],
    });
    const { sendCode } = loadService();

    await assert.rejects(
      sendCode({ email: 'ana@example.com' }),
      (err) => err.code === 'RESEND_COOLDOWN' && err.status === 429 && err.details.retryAfter > 0,
    );
    assert.equal(sent.length, 0);
  });

  it('enforces the hourly per-account cap', async () => {
    installDb({
      users: [{ id: 1, name: 'Ana', email: 'ana@example.com', phone: '+639171234567' }],
      verifications: Array.from({ length: 5 }, (_, i) => ({
        id: i + 1, user_id: 1, phone: '+639171234567', otp_hash: 'x',
        expires_at: new Date(), used: 1, last_sent_at: new Date(), created_at: new Date(),
      })),
    });
    const { sendCode } = loadService();

    await assert.rejects(
      sendCode({ email: 'ana@example.com' }),
      (err) => err.code === 'SMS_HOURLY_LIMIT' && err.status === 429,
    );
  });

  it('refuses a number already linked to another account', async () => {
    installDb({
      users: [
        { id: 1, name: 'Ana', email: 'ana@example.com', phone: null },
        { id: 2, name: 'Ben', email: 'ben@example.com', phone: '+639171234567' },
      ],
    });
    const { sendCode } = loadService();

    await assert.rejects(
      sendCode({ email: 'ana@example.com', phone: '09171234567' }),
      (err) => err.code === 'PHONE_TAKEN' && err.status === 409,
    );
  });
});

// ─── verifyCode ───
describe('verifyCode', () => {
  async function setup() {
    installDb({ users: [{ id: 1, name: 'Ana', email: 'ana@example.com', phone: null, is_verified: 0 }] });
    const service = loadService();
    await service.sendCode({ email: 'ana@example.com', phone: '09171234567' });
    return { service, code: lastCode() };
  }

  it('verifies the correct code, consumes it and marks the account verified', async () => {
    const { service, code } = await setup();

    const user = await service.verifyCode({ email: 'ana@example.com', code });
    assert.equal(user.phone, '+639171234567');
    assert.equal(user.phone_masked, '+63917***4567');
    assert.equal(db.state.users[0].is_verified, 1);
    assert.equal(db.state.verifications.filter((v) => !v.used).length, 0);

    // Reuse must fail: the code is single-use.
    await assert.rejects(
      service.verifyCode({ email: 'ana@example.com', code }),
      (err) => err.code === 'ALREADY_VERIFIED' || err.code === 'OTP_EXPIRED',
    );
  });

  it('rejects a wrong code and counts the attempt', async () => {
    const { service } = await setup();

    await assert.rejects(
      service.verifyCode({ email: 'ana@example.com', code: '000000' }),
      (err) => err.code === 'OTP_INVALID' && err.details.attemptsRemaining === 4,
    );
    assert.equal(db.state.verifications[0].attempts, 1);
    assert.equal(db.state.users[0].is_verified, 0);
  });

  it('locks after five wrong attempts', async () => {
    const { service } = await setup();
    db.state.verifications[0].attempts = 5;

    await assert.rejects(
      service.verifyCode({ email: 'ana@example.com', code: '000000' }),
      (err) => err.code === 'OTP_LOCKED' && err.status === 429,
    );
    assert.equal(db.state.verifications[0].used, 1);
  });

  it('rejects an expired code', async () => {
    const { service, code } = await setup();
    db.state.verifications[0].expires_at = new Date(Date.now() - 1000);

    await assert.rejects(
      service.verifyCode({ email: 'ana@example.com', code }),
      (err) => err.code === 'OTP_EXPIRED',
    );
    assert.equal(db.state.verifications[0].used, 1);
    assert.equal(db.state.users[0].is_verified, 0);
  });

  it('rejects a malformed code before touching the DB', async () => {
    const { service } = await setup();
    await assert.rejects(
      service.verifyCode({ email: 'ana@example.com', code: '12ab' }),
      (err) => err.code === 'OTP_INVALID' && err.status === 400,
    );
  });
});

// ─── UniSMS provider mapping ───
describe('UniSMS provider responses', () => {
  const ORIGINAL = { ...process.env };
  const jsonResponse = (status, body, headers = {}) => ({
    status,
    headers: { get: (name) => headers[name] ?? null },
    json: async () => body,
  });

  beforeEach(() => {
    // Provider tests must hit the real client, not the sendCode capture stub.
    sms.sendSms = realSendSms;
    process.env.UNISMS_SECRET_KEY = 'test-secret';
    delete process.env.UNISMS_MOCK;
    process.env.NODE_ENV = 'test';
  });

  afterEach(() => {
    for (const key of ['UNISMS_SECRET_KEY', 'UNISMS_MOCK', 'UNISMS_SENDER_ID', 'UNISMS_TIMEOUT_MS', 'NODE_ENV']) {
      if (ORIGINAL[key] === undefined) delete process.env[key];
      else process.env[key] = ORIGINAL[key];
    }
    delete global.fetch;
  });

  it('accepts 201 as queued, not delivered', async () => {
    global.fetch = async () => jsonResponse(201, { message: { reference_id: 'ref_1', status: 'pending' } });
    const receipt = await sms.sendSms({ to: '+639171234567', content: 'code 123456' });
    assert.equal(receipt.accepted, true);
    assert.equal(receipt.status, 'pending');
    assert.equal(receipt.referenceId, 'ref_1');
  });

  it('maps 401 to a 503 auth failure without leaking details', async () => {
    global.fetch = async () => jsonResponse(401, { errors: 'bad key' });
    await assert.rejects(
      sms.sendSms({ to: '+639171234567', content: 'x' }),
      (err) => err.code === 'SMS_AUTH_FAILED' && err.status === 503 && !/bad key/.test(err.message),
    );
  });

  it('maps 429 to SMS_RATE_LIMITED with a retry hint', async () => {
    global.fetch = async () => jsonResponse(429, {}, { 'x-retry-after-ms': '3000' });
    await assert.rejects(
      sms.sendSms({ to: '+639171234567', content: 'x' }),
      (err) => err.code === 'SMS_RATE_LIMITED' && err.status === 429 && err.details.retryAfterMs === 3000,
    );
  });

  it('maps an unsupported network to a clear 422', async () => {
    global.fetch = async () => jsonResponse(422, { errors: 'Recipient network Smart is not supported' });
    await assert.rejects(
      sms.sendSms({ to: '+639171234567', content: 'x' }),
      (err) => err.code === 'SMS_UNSUPPORTED_NETWORK' && err.status === 422,
    );
  });

  it('maps a generic rejection to SMS_REJECTED', async () => {
    global.fetch = async () => jsonResponse(422, { errors: 'Invalid recipient' });
    await assert.rejects(
      sms.sendSms({ to: '+639171234567', content: 'x' }),
      (err) => err.code === 'SMS_REJECTED' && err.status === 422,
    );
  });

  it('does not infer a SIM network from carrier names in provider help text', async () => {
    global.fetch = async () => jsonResponse(422, {
      errors: 'Invalid sender ID. Contact support for Smart, TNT or Sun coverage.',
    });
    await assert.rejects(
      sms.sendSms({ to: '+639051234567', content: 'x' }),
      (err) => err.code === 'SMS_REJECTED',
    );
  });

  it('reports sender routing restrictions without claiming the SIM is Smart', async () => {
    global.fetch = async () => jsonResponse(422, {
      errors: { recipient: ["This Sender ID can't send to Smart, TNT or Sun numbers."] },
    });
    await assert.rejects(
      sms.sendSms({ to: '+639051234567', content: 'x' }),
      (err) => err.code === 'SMS_UNSUPPORTED_NETWORK'
        && /sender ID/.test(err.message)
        && !/This number's network/.test(err.message),
    );
  });

  it('maps exhausted credits to a service failure rather than blaming the SIM', async () => {
    global.fetch = async () => jsonResponse(422, {
      errors: 'Insufficient SMS credits. Smart, TNT or Sun coverage depends on your sender.',
    });
    await assert.rejects(
      sms.sendSms({ to: '+639951234567', content: 'x' }),
      (err) => err.code === 'SMS_INSUFFICIENT_CREDITS' && err.status === 503,
    );
  });

  it('passes TM and DITO-format numbers to the provider without prefix blocking', async () => {
    for (const to of ['+639051234567', '+639911234567']) {
      global.fetch = async (_url, options) => {
        assert.equal(JSON.parse(options.body).recipient, to);
        return jsonResponse(201, { message: { status: 'pending', reference_id: 'ref_test' } });
      };
      assert.equal((await sms.sendSms({ to, content: 'x' })).accepted, true);
    }
  });

  it('maps a network failure to SMS_UNAVAILABLE', async () => {
    global.fetch = async () => { throw new Error('ECONNRESET'); };
    await assert.rejects(
      sms.sendSms({ to: '+639171234567', content: 'x' }),
      (err) => err.code === 'SMS_UNAVAILABLE' && err.status === 503,
    );
  });

  it('fails clearly when the key is missing', async () => {
    delete process.env.UNISMS_SECRET_KEY;
    await assert.rejects(
      sms.sendSms({ to: '+639171234567', content: 'x' }),
      (err) => err.code === 'SMS_NOT_CONFIGURED' && err.status === 503,
    );
  });

  it('never calls the provider in mock mode', async () => {
    process.env.UNISMS_MOCK = '1';
    let called = false;
    global.fetch = async () => { called = true; return jsonResponse(201, {}); };
    const receipt = await sms.sendSms({ to: '+639171234567', content: 'x' });
    assert.equal(receipt.mocked, true);
    assert.equal(called, false);
  });
});
