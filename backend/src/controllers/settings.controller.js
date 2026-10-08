const db = require('../config/db');
const { z } = require('zod');

const ALLOWED_UNITS = ['metric', 'imperial'];
const ALLOWED_THEMES = ['light', 'dark', 'system'];
const DEFAULTS = { units: 'metric', step_goal: 8000, theme: 'system' };

const putSettingsSchema = z.object({
  units: z.enum(ALLOWED_UNITS).optional(),
  step_goal: z.coerce.number().int().min(1000).max(30000).optional(),
  theme: z.enum(ALLOWED_THEMES).optional(),
}).refine((o) => o.units !== undefined || o.step_goal !== undefined || o.theme !== undefined, {
  message: 'At least one of units, step_goal, theme is required.',
});

// GET /api/settings — JWT user only (no :userId, avoids IDOR by design)
async function get(req, res, next) {
  try {
    const [rows] = await db.execute(
      'SELECT units, step_goal, theme FROM user_settings WHERE user_id=?',
      [req.user.id]
    );
    if (!rows.length) return res.json({ settings: { ...DEFAULTS } });
    res.json({ settings: rows[0] });
  } catch (e) { next(e); }
}

// PUT /api/settings {units?, step_goal?, theme?} — upsert (validated by Zod)
async function put(req, res, next) {
  try {
    const { units, step_goal, theme } = req.body;
    const [existing] = await db.execute('SELECT units, step_goal, theme FROM user_settings WHERE user_id=?', [req.user.id]);
    const cur = existing[0] || DEFAULTS;

    const nextUnits = units === undefined ? cur.units : units;
    const nextGoal = step_goal === undefined ? Number(cur.step_goal) : Number(step_goal);
    const nextTheme = theme === undefined ? cur.theme : theme;

    await db.execute(
      `INSERT INTO user_settings (user_id, units, step_goal, theme) VALUES (?,?,?,?)
       ON DUPLICATE KEY UPDATE units=VALUES(units), step_goal=VALUES(step_goal), theme=VALUES(theme), updated_at=NOW()`,
      [req.user.id, nextUnits, nextGoal, nextTheme]
    );
    res.json({ success: true, settings: { units: nextUnits, step_goal: nextGoal, theme: nextTheme } });
  } catch (e) { next(e); }
}

module.exports = { get, put, ALLOWED_UNITS, ALLOWED_THEMES, putSettingsSchema };
