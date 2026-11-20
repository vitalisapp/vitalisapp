// Stats — business logic + DB access.
// (Daily stats.)
const db = require('../config/db');

// Today's daily_stats row (DB-local day), or zeroed defaults when none.
async function getDailyStats(userId) {
  // Use CURDATE() (DB-local) as source of truth — avoids UTC off-by-one
  // when app TZ != UTC. `today` kept only for response echo.
  const today = new Date().toISOString().slice(0, 10);
  const [stats] = await db.execute(
    'SELECT calories_burned, steps, workout_duration_mins FROM daily_stats WHERE user_id = ? AND stat_date = CURDATE()',
    [userId]
  );

  if (stats.length === 0) {
    return {
      calories_burned: 0,
      steps: 0,
      workout_duration_mins: 0,
    };
  }

  return stats[0];
}


module.exports = { getDailyStats };
