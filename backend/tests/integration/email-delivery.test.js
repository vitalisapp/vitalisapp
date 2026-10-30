const { it } = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
process.env.JWT_SECRET = 'test-secret-min-32-chars-0123456789ab';
process.env.BREVO_API_KEY = 'test-api-key';
process.env.BREVO_WEBHOOK_SECRET = 'test-webhook-secret';
const rows = new Map();
const dbPath = require.resolve('../../src/config/db');
require.cache[dbPath] = { id: dbPath, filename: dbPath, loaded: true, exports: {
  execute: async (sql, params) => {
    if (sql.startsWith('INSERT')) { rows.set(params[0], params[1]); return [{}]; }
    return [rows.has(params[0]) ? [{ status: rows.get(params[0]) }] : []];
  },
} };
const service = require('../../src/services/emailDelivery.service');
const controller = require('../../src/controllers/emailDelivery.controller');
function response() {
  return { statusCode: 200, set() {}, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; }, sendStatus(code) { this.statusCode = code; return this; } };
}
const next = (err) => { throw err; };

it('tracks a message from waiting to delivered and normalizes receipt IDs', async () => {
  const token = service.trackingToken('<delivery-1@example.com>');
  assert.equal(await service.status(token), 'waiting');
  const res = response();
  await controller.webhook({ get: () => 'Bearer test-webhook-secret', body: { event: 'delivered', 'message-id': 'delivery-1@example.com' } }, res, next);
  assert.equal(res.statusCode, 204);
  assert.equal(await service.status(token), 'delivered');
  assert.equal(await service.status(service.trackingToken('different-message')), 'waiting');
});

it('rejects forged webhook updates', async () => {
  const res = response();
  await controller.webhook({ get: () => 'Bearer wrong', body: { event: 'delivered', 'message-id': 'forged' } }, res, next);
  assert.equal(res.statusCode, 401);
  assert.equal(await service.status(service.trackingToken('forged')), 'waiting');
});

it('reports deferred and bounced emails without claiming delivery', async () => {
  await service.record({ event: 'deferred', 'message-id': 'delayed' });
  await service.record({ event: 'hard_bounce', 'message-id': 'bounced' });
  assert.equal(await service.status(service.trackingToken('delayed')), 'delayed');
  assert.equal(await service.status(service.trackingToken('bounced')), 'failed');
});

it('rejects expired tracking tokens and session tokens', async () => {
  for (const token of [
    jwt.sign({ purpose: 'email-delivery', messageId: 'x' }, process.env.JWT_SECRET, { audience: 'email-delivery', expiresIn: -1 }),
    jwt.sign({ id: 13 }, process.env.JWT_SECRET),
    'forged-token',
  ]) {
    const res = response();
    await controller.getStatus({ body: { token } }, res, next);
    assert.equal(res.statusCode, 400);
  }
});
