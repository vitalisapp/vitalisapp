// Per-user daily AI budget. Must run AFTER verifyUser (needs req.user.id).
const db = require('../config/db');

const DAILY_AI_LIMIT = parseInt(process.env.AI_DAILY_LIMIT, 10) || 50;
let tzWarned = false;

async function aiQuota(req, res, next) {
  try {
    const userId = req.user?.id;
    if (!userId) return next(); // verifyUser owns the auth decision
    const [[row]] = await db.execute(
      'SELECT `count` FROM ai_daily_usage WHERE user_id = ? AND usage_day = UTC_DATE()',
      [userId]
    );
    if (row && Number(row.count) >= DAILY_AI_LIMIT) {
      res.set('Retry-After', '3600');
      return res.status(429).json({
        error: 'Daily AI limit reached. Try again tomorrow.',
        code: 'AI_QUOTA_EXCEEDED',
      });
    }
    // Count 2xx only — failures must not burn quota.
    if (!tzWarned && !process.env.TZ && process.env.NODE_ENV !== 'production') {
      tzWarned = true;
      console.warn('[aiQuota] TZ not set — set TZ=UTC for consistent logs (quota uses UTC_DATE()).');
    }
    let counted = false;
    const countOnce = async () => {
      if (counted) return;
      counted = true;
      try {
        await db.execute(
          'INSERT INTO ai_daily_usage (user_id, usage_day, `count`) VALUES (?, UTC_DATE(), 1) ' +
          'ON DUPLICATE KEY UPDATE `count` = `count` + 1',
          [userId]
        );
      } catch (ledgerErr) {
        console.warn('[aiQuota] ledger write failed (quota not counted):', ledgerErr.code || ledgerErr.message);
      }
    };
    res.on('finish', () => {
      if (res.statusCode >= 200 && res.statusCode < 300) countOnce().catch(() => {});
    });
    next();
  } catch (e) {
    next(e);
  }
}

module.exports = aiQuota;
module.exports.DAILY_AI_LIMIT = DAILY_AI_LIMIT;
