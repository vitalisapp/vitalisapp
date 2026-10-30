const { it } = require('node:test');
const assert = require('node:assert/strict');
const { createBrevoTransport } = require('../../src/config/brevoTransport');

const options = { apiKey: 'test-api-key', senderEmail: 'sender@example.com', senderName: 'Vitalis' };
const message = { to: 'recipient@example.com', subject: 'Verify email', html: '<a href="https://example.com/verify-email?token=test">Verify</a>', replyTo: 'reply@example.com' };

it('sends verification content and reply-to through HTTPS with API authentication', async (t) => {
  t.mock.method(globalThis, 'fetch', async (url, request) => {
    assert.equal(url, 'https://api.brevo.com/v3/smtp/email');
    assert.equal(request.method, 'POST');
    assert.equal(request.headers['api-key'], options.apiKey);
    const body = JSON.parse(request.body);
    assert.deepEqual(body.sender, { email: options.senderEmail, name: options.senderName });
    assert.deepEqual(body.to, [{ email: message.to }]);
    assert.equal(body.htmlContent, message.html);
    assert.equal(body.subject, message.subject);
    assert.deepEqual(body.replyTo, { email: message.replyTo });
    assert.ok(request.signal instanceof AbortSignal);
    return { ok: true, json: async () => ({ messageId: 'accepted' }) };
  });
  assert.deepEqual(await createBrevoTransport(options).sendMail(message), { messageId: 'accepted' });
});

it('reports authentication failures without exposing API keys', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => ({ ok: false, status: 401 }));
  await assert.rejects(createBrevoTransport(options).sendMail(message), (err) => {
    assert.match(err.message, /401.*API key/);
    assert.ok(!err.message.includes(options.apiKey));
    return true;
  });
});

it('includes provider diagnostics while redacting secrets and email content', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => ({
    ok: false, status: 401,
    json: async () => ({
      code: 'unauthorized',
      message: `Unrecognized IP 192.0.2.1\n${options.apiKey} ${message.to} ${message.html} https://example.com/verify?token=secret`,
      headers: { 'api-key': options.apiKey },
    }),
  }));
  await assert.rejects(createBrevoTransport(options).sendMail(message), (err) => {
    assert.match(err.message, /Provider: unauthorized: Unrecognized IP 192\.0\.2\.1/);
    for (const secret of [options.apiKey, message.to, message.html, 'token=secret', '\n']) {
      assert.ok(!err.message.includes(secret));
    }
    return true;
  });
});

it('retains HTTP diagnostics when the provider returns a non-JSON body', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => ({
    ok: false, status: 503, json: async () => { throw new SyntaxError('Invalid JSON'); },
  }));
  await assert.rejects(createBrevoTransport(options).sendMail(message), /Brevo HTTPS API returned 503/);
});

it('reports request timeouts and requires an explicit sender', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => { throw new DOMException('Timed out', 'TimeoutError'); });
  await assert.rejects(createBrevoTransport(options).sendMail(message), /timed out/);
  await assert.rejects(createBrevoTransport({ apiKey: 'key' }).sendMail(message), /MAIL_FROM/);
});

it('prefers the API when SMTP credentials also exist', (t) => {
  for (const [key, value] of Object.entries({ BREVO_API_KEY: 'test-key', MAIL_FROM: 'sender@example.com', BREVO_SMTP_LOGIN: 'smtp-login', BREVO_SMTP_KEY: 'smtp-key' })) {
    const old = process.env[key];
    process.env[key] = value;
    t.after(() => { if (old === undefined) delete process.env[key]; else process.env[key] = old; });
  }
  const id = require.resolve('../../src/config/mailer');
  delete require.cache[id];
  t.after(() => { delete require.cache[id]; });
  const mailer = require(id);
  assert.equal(mailer.provider, 'brevo-api');
  assert.equal(mailer.mailConfigured(), true);
  assert.equal(mailer.fromAddress(), 'sender@example.com');
});
