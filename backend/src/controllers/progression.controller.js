// Revision #4 — progressive unlocking. Thin: validate → service → JSON.
// AppErrors (LEVEL_LOCKED, NEEDS_MIGRATION_061, …) go to the shared error
// handler, which forwards code + details.
const { z } = require('zod');
const service = require('../services/progression.service');

async function get(req, res, next) {
  try {
    res.set('Cache-Control', 'private, no-store');
    res.json(await service.getProgression(req.user.id));
  } catch (err) {
    next(err);
  }
}

async function postSeen(req, res, next) {
  try {
    res.json(await service.markSeen(req.user.id));
  } catch (err) {
    next(err);
  }
}

const completeSchema = z.object({ workoutLogId: z.coerce.number().int().positive() });
const keySchema = z.string().regex(/^[a-z0-9_]{1,50}$/);

async function postCompleteChallenge(req, res, next) {
  const key = keySchema.safeParse(req.params.key);
  const body = completeSchema.safeParse(req.body || {});
  if (!key.success || !body.success) return res.status(400).json({ error: 'Valid challenge and workoutLogId are required' });
  try {
    res.json(await service.completeChallenge(req.user.id, key.data, body.data.workoutLogId));
  } catch (err) {
    next(err);
  }
}

module.exports = { get, postSeen, postCompleteChallenge };
