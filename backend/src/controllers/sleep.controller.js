
const db = require('../config/db');
const { validUserId } = require('../utils/ids');

function numField(v, { min = 0, max = 100, name }) {
  // Strict: missing (undefined/null/'') means "not provided" → null (no junk zeros).
  if (v === undefined || v === null || v === '') return { value: null };
  const n = Number(v);
  if (!Number.isFinite(n) || n < min || n > max) {
    return { error: `${name} must be a number ${min}–${max}` };
  }
  return { value: n };
}
// --- WRITE SLEEP LOG ---

async function postUserId(req,res,next){
  try{
      const userId = validUserId(req.params.userId);
      if (!userId) return res.status(400).json({ error: 'Invalid user id' });
    
      const body = req.body || {};
      const duration = numField(body.sleep_duration, { min: 0, max: 24, name: 'sleep_duration' });
      const quality  = numField(body.sleep_quality, { min: 0, max: 10, name: 'sleep_quality' });
      const recovery = numField(body.recovery_score, { min: 0, max: 100, name: 'recovery_score' });
      const water    = numField(body.water_intake_ml, { min: 0, max: 10000, name: 'water_intake_ml' });
      for (const f of [duration, quality, recovery, water]) {
        if (f.error) return res.status(400).json({ error: f.error });
      }
      if (duration.value === null && quality.value === null
          && recovery.value === null && water.value === null) {
        return res.status(400).json({ error: 'At least one of sleep_duration, sleep_quality, recovery_score, water_intake_ml is required' });
      }
    
      try {
        await db.execute(
          `INSERT INTO sleep_logs 
          (user_id, sleep_duration, sleep_quality, recovery_score, water_intake_ml)
          VALUES (?, ?, ?, ?, ?)`,
          [
            userId,
            duration.value,
            quality.value,
            recovery.value,
            water.value
          ]
        );
    
        res.json({ success: true });
      } catch (err) {
        next(err);
      }
  }catch(e){ next(e); }
}

async function getUserIdToday(req,res,next){
  try{
        const userId = validUserId(req.params.userId);
        if (!userId) return res.status(400).json({ error: 'Invalid user id' });
    
        try {
        const [rows] = await db.execute(
        `SELECT sleep_duration, sleep_quality, recovery_score, water_intake_ml, recorded_at
         FROM sleep_logs
         WHERE user_id = ?
         AND (sleep_duration > 0 OR sleep_quality > 0 OR water_intake_ml > 0 OR recovery_score > 0)
         ORDER BY recorded_at DESC
         LIMIT 1`,
        [userId]
    );
    
            res.json(rows[0] || null);
    
        } catch (err) {
            next(err);
        }
  }catch(e){ next(e); }
}

async function getUserId(req,res,next){
  try{
        const userId = validUserId(req.params.userId);
        if (!userId) return res.status(400).json({ error: 'Invalid user id' });
        const range = String(req.query?.range ?? 'D').toUpperCase();
        const metric = String(req.query?.metric ?? 'duration').toLowerCase();
        if (!['D', 'W', 'M'].includes(range)) return res.status(400).json({ error: 'range must be D, W, or M' });
        const interval = range === 'W' ? '7 DAY' : range === 'M' ? '30 DAY' : '1 DAY';
        const METRIC_MAP = { duration: 'sleep_duration', quality: 'sleep_quality', recovery: 'recovery_score' };
        const column = METRIC_MAP[metric] ?? 'sleep_duration';
    
        try {
            const isDaily = range === 'D';
            const labelFormat   = isDaily ? '%H:%i' : '%m/%d';
            // Daily: one row per log (no GROUP BY — grouping by raw timestamp
            // explodes under ONLY_FULL_GROUP_BY). W/M: daily averages.
            const [rows] = isDaily
              ? await db.execute(
                `SELECT DATE_FORMAT(recorded_at, '${labelFormat}') AS label,
                        ${column} AS value
                 FROM sleep_logs
                 WHERE user_id = ?
                   AND recorded_at >= DATE_SUB(NOW(), INTERVAL ${interval})
                   AND ${column} > 0
                 ORDER BY recorded_at ASC
                 LIMIT 1000`,
                [userId]
              )
              : await db.execute(
                `SELECT DATE_FORMAT(recorded_at, '${labelFormat}') AS label,
                        AVG(${column}) AS value
                 FROM sleep_logs
                 WHERE user_id = ?
                   AND recorded_at >= DATE_SUB(NOW(), INTERVAL ${interval})
                   AND ${column} > 0
                 GROUP BY DATE(recorded_at)
                 ORDER BY DATE(recorded_at) ASC
                 LIMIT 1000`,
                [userId]
              );
            res.json(rows);
        } catch (err) {
            next(err);
        }
  }catch(e){ next(e); }
}

async function getUserIdAnalysis(req,res,next){
  try{
        const userId = validUserId(req.params.userId);
        if (!userId) return res.status(400).json({ error: 'Invalid user id' });
        const range = String(req.query?.range ?? 'D').toUpperCase();
        const metric = String(req.query?.metric ?? 'sleep_hours').toLowerCase();
        if (!['D', 'W', 'M'].includes(range)) return res.status(400).json({ error: 'range must be D, W, or M' });
    
        const ANALYSIS_MAP = {
            sleep_hours:    'sleep_duration',
            recovery_score: 'recovery_score',
            efficiency:     'sleep_quality',
        };
    
        const column   = ANALYSIS_MAP[metric] || 'sleep_duration';
        const interval = range === 'W' ? '7 DAY' : range === 'M' ? '30 DAY' : '1 DAY';
    
        try {
            const isDaily     = range === 'D';
            const labelFormat = isDaily ? '%H:%i' : (range === 'W' ? '%a' : '%m/%d');
    
            // GROUP BY the same expression as the label — grouping by
            // HOUR() while selecting %H:%i breaks under ONLY_FULL_GROUP_BY.
            const groupExpr = isDaily ? "DATE_FORMAT(recorded_at, '%Y-%m-%d %H')" : 'DATE(recorded_at)';
            const [rows] = await db.execute(
                `SELECT DATE_FORMAT(recorded_at, '${labelFormat}') AS label, 
                        AVG(${column}) AS value
                 FROM sleep_logs
                 WHERE user_id = ? 
                   AND recorded_at >= DATE_SUB(NOW(), INTERVAL ${interval})
                 GROUP BY ${groupExpr}
                 ORDER BY MIN(recorded_at) ASC
                 LIMIT 1000`,
                [userId]
            );
            res.json(rows);
        } catch (err) {
            console.error('[Analysis Graph] Error:', err.message);
            next(err);
        }
  }catch(e){ next(e); }
}

async function getUserIdScatter(req,res,next){
  try{
        const userId = validUserId(req.params.userId);
        if (!userId) return res.status(400).json({ error: 'Invalid user id' });
        const timeframe = String(req.query?.timeframe ?? 'weekly').toLowerCase();
    
        const intervalMap = {
            weekly:    '7 DAY',
            monthly:   '30 DAY',
            quarterly: '90 DAY',
        };
        if (!Object.prototype.hasOwnProperty.call(intervalMap, timeframe)) {
          return res.status(400).json({ error: 'timeframe must be weekly, monthly, or quarterly' });
        }
        const interval = intervalMap[timeframe];
    
        try {
            const [rows] = await db.execute(
                `SELECT 
                   sleep_duration,
                   sleep_quality,
                   recovery_score,
                   DATE_FORMAT(recorded_at, '%Y-%m-%d %H:%i') AS recorded_at
                 FROM sleep_logs
                  WHERE user_id = ?
                    AND recorded_at >= DATE_SUB(NOW(), INTERVAL ${interval})
                    AND sleep_duration > 0
                    AND sleep_quality  > 0
                  ORDER BY recorded_at ASC
                  LIMIT 1000`,
                [userId]
            );
            res.json(rows);
        } catch (err) {
            console.error('[Scatter] Error:', err.message);
            next(err);
        }
  }catch(e){ next(e); }
}

module.exports = { postUserId, getUserIdToday, getUserId, getUserIdAnalysis, getUserIdScatter };
