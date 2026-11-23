// Stats — business logic + DB access.
// (Daily stats.)
const db = require('../config/db');
const { getBurnForDay } = require('./energy.service');

// Today's daily_stats row (DB-local day), or zeroed defaults when none.
async function getDailyStats(userId) {
  // Use CURDATE() (DB-local) as source of truth — avoids UTC off-by-one
  // when app TZ != UTC. `today` kept only for response echo.
  const today = new Date().toISOString().slice(0, 10);
  const [stats] = await db.execute(
    'SELECT calories_burned, steps, workout_duration_mins FROM daily_stats WHERE user_id = ? AND stat_date = CURDATE()',
    [userId]
  );

  const base = stats[0] || { calories_burned: 0, steps: 0, workout_duration_mins: 0 };
  const [[dayRow]] = await db.execute(`SELECT DATE_FORMAT(CURDATE(), '%Y-%m-%d') AS today`);
  const burn = await getBurnForDay(userId, dayRow.today).catch(() => null);
  return burn ? { ...base, calories_burned: burn.total, burn } : base;
}


module.exports = { getDailyStats };
