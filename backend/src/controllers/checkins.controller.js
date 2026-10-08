const db = require('../config/db');

const VALID_LEVELS = ['LOW', 'MODERATE', 'GOOD', 'HIGH'];

// POST /api/checkins/:userId — create or update today's check-in
async function postUserId(req,res,next){
  try{
      const { userId } = req.params;
      const { sleepHours, sleep_hours, sleepQuality, sleep_quality,
              stressLevel, stress_level, soreness, soreness_level, sorenessLevel,
              energyLevel, energy_level } = req.body || {};

      const hours = sleepHours ?? sleep_hours;
      if (hours == null || Number(hours) < 0 || Number(hours) > 24) {
        return res.status(400).json({ error: 'sleepHours (0–24) is required' });
      }
      const normalizeLevel = (v) => (v == null ? null : String(v).trim().toUpperCase());
      const qNorm = normalizeLevel(sleepQuality ?? sleep_quality);
      const stNorm = normalizeLevel(stressLevel ?? stress_level);
      const soNorm = normalizeLevel(soreness ?? soreness_level ?? sorenessLevel);
      const eNorm = normalizeLevel(energyLevel ?? energy_level);
      for (const [label, val] of [['sleep_quality', qNorm], ['stress_level', stNorm], ['soreness_level', soNorm], ['energy_level', eNorm]]) {
        if (val !== null && !VALID_LEVELS.includes(val)) {
          return res.status(400).json({ error: `${label} must be one of: ${VALID_LEVELS.join(', ')}` });
        }
      }

      await db.execute(
        `INSERT INTO daily_checkins
         (user_id, checkin_date, sleep_hours, sleep_quality, stress_level, soreness_level, energy_level)
         VALUES (?, CURDATE(), ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           sleep_hours = VALUES(sleep_hours),
           sleep_quality = VALUES(sleep_quality),
           stress_level = VALUES(stress_level),
           soreness_level = VALUES(soreness_level),
           energy_level = VALUES(energy_level)`,
        [
          userId, Number(hours),
          qNorm,
          stNorm,
          soNorm,
          eNorm,
        ]
      );

      const [[row]] = await db.execute(
        'SELECT * FROM daily_checkins WHERE user_id = ? AND checkin_date = CURDATE()',
        [userId]
      );
      res.status(201).json({ success: true, checkin: row });
  }catch(e){ next(e); }
}

// GET /api/checkins/:userId/today — today's check-in or null
async function gettodayUserId(req,res,next){
  try{
      const { userId } = req.params;
      const [rows] = await db.execute(
        'SELECT *, checkin_date AS check_date, soreness_level AS soreness FROM daily_checkins WHERE user_id = ? AND checkin_date = CURDATE() LIMIT 1',
        [userId]
      );
      res.json({ checkin: rows[0] || null });
  }catch(e){ next(e); }
}

// GET /api/checkins/:userId/history?days=14 — recent check-ins for trends
async function gethistoryUserId(req,res,next){
  try{
      const { userId } = req.params;
      const days = Math.min(Math.max(parseInt(req.query.days) || 14, 1), 60);
      const [rows] = await db.execute(
        `SELECT checkin_date, checkin_date AS check_date, sleep_hours, sleep_quality, stress_level, soreness_level, soreness_level AS soreness, energy_level
         FROM daily_checkins WHERE user_id = ? AND checkin_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
         ORDER BY checkin_date ASC`,
        [userId, days]
      );
      res.json({ history: rows || [] });
  }catch(e){ next(e); }
}

module.exports = { postUserId, gettodayUserId, gethistoryUserId, VALID_LEVELS };
