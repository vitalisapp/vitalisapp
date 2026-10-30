const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Brevo's send receipt can wrap the ID in <>, while webhooks omit them.
function normalizeId(id) {
  return typeof id === 'string' ? id.trim().replace(/^<|>$/g, '') : '';
}

function trackingToken(messageId) {
  messageId = normalizeId(messageId);
  if (!messageId || !process.env.BREVO_API_KEY || !process.env.BREVO_WEBHOOK_SECRET) return null;
  return jwt.sign({ messageId, purpose: 'email-delivery' }, process.env.JWT_SECRET, {
    algorithm: 'HS256', expiresIn: '30m', audience: 'email-delivery',
  });
}

async function status(token) {
  const payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'], audience: 'email-delivery' });
  if (payload.purpose !== 'email-delivery' || typeof payload.messageId !== 'string') throw new Error('Invalid tracking token');
  const [rows] = await db.execute('SELECT status FROM email_delivery_events WHERE message_id = ?', [payload.messageId]);
  return rows[0]?.status || 'waiting';
}

async function record(event) {
  const messageId = normalizeId(event?.['message-id']);
  if (!messageId || messageId.length > 255) return;
  const states = {
    delivered: 'delivered', hard_bounce: 'failed', blocked: 'failed', invalid_email: 'failed', error: 'failed',
    deferred: 'delayed', soft_bounce: 'delayed', request: 'waiting',
  };
  const state = states[event.event];
  if (!state) return;
  // Late request/deferred events must not undo delivery or permanent failure.
  // A genuine delivery confirmation may supersede a previous failure.
  await db.execute(
    `INSERT INTO email_delivery_events (message_id, status) VALUES (?, ?)
     ON DUPLICATE KEY UPDATE status = CASE
       WHEN status = 'delivered' OR VALUES(status) = 'delivered' THEN 'delivered'
       WHEN status = 'failed' THEN 'failed'
       ELSE VALUES(status) END`,
    [messageId, state],
  );
}

module.exports = { trackingToken, status, record };
