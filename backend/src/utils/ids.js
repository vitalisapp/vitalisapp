function validId(v) {
  const n = Number(v);
  return Number.isInteger(n) && n > 0 ? n : null;
}

const validUserId = validId;

function requireValidUserId(value, res) {
  const id = validId(value);
  if (!id && res) res.status(400).json({ error: 'Invalid user id' });
  return id || null;
}

module.exports = { validUserId, validId, requireValidUserId };
