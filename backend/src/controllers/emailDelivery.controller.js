const crypto = require('crypto');
const delivery = require('../services/emailDelivery.service');

async function getStatus(req, res, next) {
  res.set('Cache-Control', 'no-store');
  if (typeof req.body?.token !== 'string' || req.body.token.length > 2048) return res.status(400).json({ error: 'Invalid tracking token' });
  try {
    res.json({ status: await delivery.status(req.body.token) });
  } catch (err) {
    if (['JsonWebTokenError', 'TokenExpiredError', 'NotBeforeError'].includes(err.name) || err.message === 'Invalid tracking token') {
      return res.status(400).json({ error: 'Delivery tracking expired. Check your inbox or request a new link.' });
    }
    next(err);
  }
}

async function webhook(req, res, next) {
  const secret = process.env.BREVO_WEBHOOK_SECRET;
  if (!secret) return res.sendStatus(503);
  const expected = Buffer.from(`Bearer ${secret}`);
  const actual = Buffer.from(req.get('authorization') || '');
  if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) return res.sendStatus(401);
  try {
    const events = Array.isArray(req.body) ? req.body : [req.body];
    if (events.length > 100) return res.sendStatus(400);
    for (const event of events) await delivery.record(event);
    res.sendStatus(204);
  } catch (err) { next(err); }
}

module.exports = { getStatus, webhook };
