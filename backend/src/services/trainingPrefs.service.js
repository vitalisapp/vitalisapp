// Training preferences — Module 5 personalization inputs (equipment, preferred
// days, session length, location). Pure logic + DB; controller stays thin.
const db = require('../config/db');
const { AppError } = require('../utils/errors');
const { EXCLUSION_KEYS } = require('../utils/workoutRecommender');

// Canonical equipment catalog — must match the frontend picker exactly. The
// catalog's own equipment labels (workoutGuide) use lowercase names like
// 'dumbbell', 'barbell', 'bodyweight'; the session/schedule logic accepts
// either side because normalizeEquipment maps both spellings.
const EQUIPMENT_OPTIONS = [
  'Bodyweight',
  'Dumbbells',
  'Barbell',
  'Kettlebell',
  'Resistance Bands',
  'Machines',
  'Pull-up Bar',
  'Cardio Equipment',
];
const LOCATION_OPTIONS = ['Home', 'Gym', 'Outdoor', 'BFP Office', 'Other'];
const MIN_SESSION_MINS = 10;
const MAX_SESSION_MINS = 180;

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/** "dumbbells" / 'Dumbbell' -> 'dumbbell', so prefs match the exercise catalog. */
function normalizeEquipmentName(raw) {
  return String(raw || '').toLowerCase().replace(/s$/, '').replace(/\s+equipment$/, '');
}

/** Map a user pref ('Dumbbells') to a catalog equipment label set. Used by the
 *  frontend; kept here so both sides agree through one shared rule. */
function equipmentMatchesCatalog(preference, catalogEquipment) {
  const pref = normalizeEquipmentName(preference);
  const cat = normalizeEquipmentName(catalogEquipment);
  if (cat === 'none' || cat === 'no equipment') return pref === 'bodyweight';
  return cat === pref || pref === 'bodyweight' && cat === 'bodyweight';
}

function cleanEquipment(raw) {
  const parsed = Array.isArray(raw) ? raw : [];
  const cleaned = [];
  for (const item of parsed) {
    if (typeof item !== 'string') continue;
    const t = item.trim();
    if (t.length === 0 || t.length > 60) continue;
    // Accept any of the canonical labels; tolerate free text (normalized for storage).
    cleaned.push(t);
    if (cleaned.length >= 8) break;
  }
  return Array.from(new Set(cleaned));
}

function cleanPreferredDays(raw) {
  const parsed = Array.isArray(raw) ? raw : [];
  const cleaned = parsed
    .filter((d) => Number.isInteger(Number(d)))
    .map((d) => Number(d))
    .filter((d) => d >= 0 && d <= 6);
  return Array.from(new Set(cleaned));
}

function validateInput(body) {
  const equipment = cleanEquipment(body?.equipment ?? []);
  const preferredDays = cleanPreferredDays(body?.preferred_days ?? []);

  let duration = null;
  if (body?.session_duration_mins !== undefined && body?.session_duration_mins !== null && body?.session_duration_mins !== '') {
    duration = Number(body.session_duration_mins);
    if (!Number.isInteger(duration) || duration < MIN_SESSION_MINS || duration > MAX_SESSION_MINS) {
      throw new AppError(`Session length must be between ${MIN_SESSION_MINS} and ${MAX_SESSION_MINS} minutes.`, 400, 'INVALID_DURATION');
    }
  }

  let location = null;
  if (body?.workout_location !== undefined && body?.workout_location !== null && body?.workout_location !== '') {
    location = String(body.workout_location).trim().slice(0, 50) || null;
  }

  // Exclusions are optional on PUT: undefined means keep what is saved, so
  // older clients that only send equipment/days never wipe them.
  const excludedCategories = body?.excluded_categories === undefined
    ? undefined
    : cleanStringList(body.excluded_categories, 10).filter((k) => EXCLUSION_KEYS.includes(k));
  const excludedExercises = body?.excluded_exercises === undefined
    ? undefined
    : cleanStringList(body.excluded_exercises, 60);

  return {
    equipment,
    preferred_days: preferredDays,
    session_duration_mins: duration,
    workout_location: location,
    excluded_categories: excludedCategories,
    excluded_exercises: excludedExercises,
  };
}

function cleanStringList(raw, max) {
  const out = [];
  for (const v of Array.isArray(raw) ? raw : []) {
    if (typeof v !== 'string') continue;
    const t = v.trim().slice(0, 80);
    if (t && !out.includes(t)) out.push(t);
    if (out.length >= max) break;
  }
  return out;
}

/** Upsert (PK is user_id). Returns the saved row as plain JSON. */
async function save(userId, body) {
  const prefs = validateInput(body);
  const current = (prefs.excluded_categories === undefined || prefs.excluded_exercises === undefined)
    ? await get(userId).catch(() => null)
    : null;
  const exclCats = prefs.excluded_categories ?? current?.excludedCategories ?? [];
  const exclEx = prefs.excluded_exercises ?? current?.excludedExercises ?? [];
  const baseParams = [
    userId,
    JSON.stringify(prefs.equipment),
    JSON.stringify(prefs.preferred_days),
    prefs.session_duration_mins,
    prefs.workout_location,
  ];
  try {
    await db.execute(
      `INSERT INTO training_preferences (user_id, equipment, preferred_days, session_duration_mins, workout_location, excluded_categories, excluded_exercises)
         VALUES (?, CAST(? AS JSON), CAST(? AS JSON), ?, ?, CAST(? AS JSON), CAST(? AS JSON))
       ON DUPLICATE KEY UPDATE
         equipment = VALUES(equipment),
         preferred_days = VALUES(preferred_days),
         session_duration_mins = VALUES(session_duration_mins),
         workout_location = VALUES(workout_location),
         excluded_categories = VALUES(excluded_categories),
         excluded_exercises = VALUES(excluded_exercises)`,
      [...baseParams, JSON.stringify(exclCats), JSON.stringify(exclEx)]
    );
  } catch (err) {
    // Pre-050 database: save the original fields only.
    if (err.errno !== 1054 && err.code !== 'ER_BAD_FIELD_ERROR') throw err;
    await db.execute(
      `INSERT INTO training_preferences (user_id, equipment, preferred_days, session_duration_mins, workout_location)
         VALUES (?, CAST(? AS JSON), CAST(? AS JSON), ?, ?)
       ON DUPLICATE KEY UPDATE
         equipment = VALUES(equipment),
         preferred_days = VALUES(preferred_days),
         session_duration_mins = VALUES(session_duration_mins),
         workout_location = VALUES(workout_location)`,
      baseParams
    );
  }
  return get(userId);
}

/** Add or remove one exercise from the do-not-recommend list. */
async function setExerciseExcluded(userId, name, excluded) {
  const clean = String(name || '').trim().slice(0, 80);
  if (!clean) throw new AppError('Choose an exercise.', 400, 'EXERCISE_REQUIRED');
  const current = await get(userId);
  const list = (current?.excludedExercises || []).filter((n) => n.toLowerCase() !== clean.toLowerCase());
  if (excluded) list.push(clean);
  return save(userId, {
    equipment: current?.equipment || [],
    preferred_days: current?.preferredDays || [],
    session_duration_mins: current?.sessionDurationMins ?? null,
    workout_location: current?.workoutLocation ?? null,
    excluded_categories: current?.excludedCategories || [],
    excluded_exercises: list.slice(-60),
  });
}

/** Returns null when the user hasn't set preferences yet. */
async function get(userId) {
  let row;
  try {
    [[row]] = await db.execute(
      `SELECT equipment, preferred_days, session_duration_mins, workout_location, excluded_categories, excluded_exercises, updated_at
         FROM training_preferences WHERE user_id = ? LIMIT 1`,
      [userId]
    );
  } catch (err) {
    if (err.errno !== 1054 && err.code !== 'ER_BAD_FIELD_ERROR') throw err;
    [[row]] = await db.execute(
      `SELECT equipment, preferred_days, session_duration_mins, workout_location, updated_at
         FROM training_preferences WHERE user_id = ? LIMIT 1`,
      [userId]
    );
  }
  if (!row) return null;
  return {
    equipment: safeParse(row.equipment),
    preferredDays: safeParse(row.preferred_days),
    sessionDurationMins: row.session_duration_mins != null ? Number(row.session_duration_mins) : null,
    workoutLocation: row.workout_location,
    excludedCategories: safeParse(row.excluded_categories),
    excludedExercises: safeParse(row.excluded_exercises),
    updatedAt: row.updated_at,
  };
}

function safeParse(value) {
  if (value == null) return [];
  if (Array.isArray(value)) return value;
  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

module.exports = {
  EQUIPMENT_OPTIONS,
  LOCATION_OPTIONS,
  DAY_NAMES,
  MIN_SESSION_MINS,
  MAX_SESSION_MINS,
  normalizeEquipmentName,
  equipmentMatchesCatalog,
  validateInput,
  save,
  get,
  setExerciseExcluded,
};
