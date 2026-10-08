const db = require('../config/db');
const { requireValidUserId } = require('../utils/ids');

async function getsummaryUserId(req, res, next) {
  try {
    const userId = requireValidUserId(req.params.userId, res);
    if (!userId) return;
    const [rows] = await db.execute(
      `
                SELECT
                    ROUND(AVG(sleep_quality), 1)   as avg_sleep_quality,
                    ROUND(AVG(recovery_score), 1)  as avg_recovery_score,
                    ROUND(AVG(sleep_duration), 1)  as avg_sleep_hours,
                    ROUND(AVG(water_intake_ml), 0) as avg_water_ml,
                    COUNT(*) as sample_count
                FROM sleep_logs
                WHERE user_id = ?
                  AND recorded_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`,
      [userId]
    );
    const [activity] = await db.execute(
      `
                SELECT COALESCE(SUM(steps),0) as total_steps,
                       COALESCE(SUM(calories_burned),0) as total_calories,
                       COALESCE(SUM(workout_duration_mins),0) as total_workout_mins,
                       COUNT(*) as active_days
                FROM daily_stats
                WHERE user_id = ? AND stat_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`,
      [userId]
    );
    const r = rows[0] || {};
    res.json({
      avg_sleep_quality: r.avg_sleep_quality ?? null,
      avg_recovery_score: r.avg_recovery_score ?? null,
      avg_sleep_hours: r.avg_sleep_hours ?? null,
      avg_water_ml: r.avg_water_ml != null ? Number(r.avg_water_ml) : null,
      sample_count: Number(r.sample_count || 0),
      total_steps: Number(activity[0]?.total_steps || 0),
      total_calories: Number(activity[0]?.total_calories || 0),
      total_workout_mins: Number(activity[0]?.total_workout_mins || 0),
      active_days: Number(activity[0]?.active_days || 0),
      hrv: r.avg_sleep_quality ?? null,
      vo2_max: r.avg_recovery_score ?? null,
      stress: r.avg_sleep_hours ?? null,
    });
  } catch (e) {
    next(e);
  }
}

async function getzonesUserId(req, res, next) {
  try {
    const userId = requireValidUserId(req.params.userId, res);
    if (!userId) return;
    const timeframe = String(req.query?.timeframe ?? 'weekly').toLowerCase();

    const intervalMap = {
      weekly: '7 DAY',
      monthly: '30 DAY',
      quarterly: '90 DAY',
    };
    if (!Object.prototype.hasOwnProperty.call(intervalMap, timeframe)) {
      return res.status(400).json({ error: 'timeframe must be weekly, monthly, or quarterly' });
    }
    const interval = intervalMap[timeframe];

    const [rows] = await db.execute(
      `
                SELECT 
                    CASE 
                        WHEN workout_type IN ('HIIT', 'Sprinting', 'Boxing')       THEN 5
                        WHEN workout_type IN ('Running', 'Cycling', 'Jump Rope')   THEN 4
                        WHEN workout_type IN ('Jogging', 'Swimming', 'Rowing')     THEN 3
                        WHEN workout_type IN ('Walking', 'Yoga', 'Stretching')     THEN 1
                        ELSE 2
                    END as zone,
                    CASE 
                        WHEN workout_type IN ('HIIT', 'Sprinting', 'Boxing')       THEN 'Zone 5 (Anaerobic)'
                        WHEN workout_type IN ('Running', 'Cycling', 'Jump Rope')   THEN 'Zone 4 (Threshold)'
                        WHEN workout_type IN ('Jogging', 'Swimming', 'Rowing')     THEN 'Zone 3 (Tempo)'
                        WHEN workout_type IN ('Walking', 'Yoga', 'Stretching')     THEN 'Zone 1 (Recovery)'
                        ELSE 'Zone 2 (Aerobic Base)'
                    END as label,
                    COUNT(*) as sessions,
                    COALESCE(SUM(COALESCE(duration_seconds, 0)) / 60, 0) as minutes_raw,
                    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 0) as pct
                FROM workout_logs
                WHERE user_id = ?
                  AND start_time >= DATE_SUB(NOW(), INTERVAL ${interval})
                  AND status = 'completed'
                GROUP BY zone, label
                ORDER BY zone DESC`,
      [userId]
    );

    if (!rows.length) return res.json([]);

    res.json(
      rows.map((row) => {
        const sessions = Number(row.sessions || 0);
        const rawMins = Number(row.minutes_raw || 0);
        const minutes = rawMins > 0 ? Math.round(rawMins) : sessions;
        return {
          zone: row.zone,
          label: row.label,
          sessions,
          minutes,
          value: `${row.pct}%`,
        };
      })
    );
  } catch (e) {
    next(e);
  }
}

// Legacy /vo2 path kept for compat — actually returns recovery trend, NOT lab VO2 max.
async function getvo2UserId(req, res, next) {
  try {
    const userId = requireValidUserId(req.params.userId, res);
    if (!userId) return;
    const [rows] = await db.execute(
      `
                SELECT
                    recovery_score as value,
                    DATE_FORMAT(recorded_at, '%m/%d') as date
                FROM sleep_logs
                WHERE user_id = ?
                  AND recovery_score > 0
                ORDER BY recorded_at ASC
                LIMIT 7`,
      [userId]
    );
    res.json(
      (rows || []).map((r) => ({
        ...r,
        metric: 'recovery_score',
        note: 'recovery trend, not lab VO2 max',
      }))
    );
  } catch (e) {
    next(e);
  }
}

// GET /api/analytics/recovery/:userId — honest recovery trend
async function getrecoveryUserId(req, res, next) {
  try {
    const userId = requireValidUserId(req.params.userId, res);
    if (!userId) return;
    const [rows] = await db.execute(
      `
                SELECT DATE_FORMAT(recorded_at, '%m/%d') as date,
                       ROUND(AVG(sleep_duration),1) as sleep_hours,
                       ROUND(AVG(sleep_quality),1) as sleep_quality,
                       ROUND(AVG(recovery_score),1) as recovery_score,
                       ROUND(AVG(water_intake_ml),0) as water_ml
                FROM sleep_logs
                WHERE user_id = ? AND recorded_at >= DATE_SUB(NOW(), INTERVAL 14 DAY)
                GROUP BY DATE(recorded_at) ORDER BY DATE(recorded_at) ASC LIMIT 14`,
      [userId]
    );
    res.json(rows || []);
  } catch (e) {
    next(e);
  }
}

// GET /api/analytics/progress/:userId — weight/BMI trend + activity volume
async function getprogressUserId(req, res, next) {
  try {
    const userId = requireValidUserId(req.params.userId, res);
    if (!userId) return;
    const [bmi] = await db.execute(
      `
                SELECT bmi, weight_kg, DATE_FORMAT(recorded_at, '%m/%d') as date
                FROM bmi_records WHERE user_id = ? ORDER BY recorded_at ASC LIMIT 20`,
      [userId]
    );
    const [volume] = await db.execute(
      `
                SELECT DATE_FORMAT(stat_date, '%m/%d') as date, steps, calories_burned, workout_duration_mins
                FROM daily_stats WHERE user_id = ? AND stat_date >= DATE_SUB(CURDATE(), INTERVAL 14 DAY)
                ORDER BY stat_date ASC LIMIT 14`,
      [userId]
    );
    res.json({ bmi: bmi || [], volume: volume || [] });
  } catch (e) {
    next(e);
  }
}

module.exports = {
  getsummaryUserId,
  getzonesUserId,
  getvo2UserId,
  getrecoveryUserId,
  getprogressUserId,
};
