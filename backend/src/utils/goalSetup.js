// Goal setup rules (Section 3) — pure, no I/O.
//   parseSecondaryGoals  up to 2 extra goals; blocks contradictory pairs
//   parseExperience      BEGINNER | INTERMEDIATE | ADVANCED
//   checkTargetDate      2 weeks – 2 years out, plus a realism check against a
//                        safe weekly rate (loss ≈ 1% body weight / week, max
//                        1 kg; gain ≈ 0.5 kg / week) with a suggested date.

const GOAL_KEYS = ['LOSE_WEIGHT', 'MAINTAIN_WEIGHT', 'GAIN_WEIGHT', 'BUILD_MUSCLE', 'PERFORMANCE'];
const EXPERIENCE_LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
const MAX_SECONDARY = 2;
const MIN_TARGET_DAYS = 14;
const MAX_TARGET_DAYS = 730;

// Weight-direction goals that cannot be combined with each other.
const WEIGHT_DIRECTION = { LOSE_WEIGHT: 'down', GAIN_WEIGHT: 'up', MAINTAIN_WEIGHT: 'hold' };
const LABEL = {
  LOSE_WEIGHT: 'Lose Weight',
  MAINTAIN_WEIGHT: 'Maintain Weight',
  GAIN_WEIGHT: 'Gain Weight',
  BUILD_MUSCLE: 'Build Muscle',
  PERFORMANCE: 'Improve Performance',
};

/**
 * @returns {{ value: string[] }} or {{ error, code }}
 * `raw` may be an array or a comma string. Undefined → { value: undefined }
 * (caller keeps what is stored).
 */
function parseSecondaryGoals(raw, primary) {
  if (raw === undefined) return { value: undefined };
  if (raw === null || raw === '') return { value: [] };
  const list = Array.isArray(raw) ? raw : String(raw).split(',');
  const out = [];
  for (const v of list) {
    const k = String(v || '').trim().toUpperCase();
    if (!k || k === primary || out.includes(k)) continue;
    if (!GOAL_KEYS.includes(k)) return { error: 'One of your extra goals is not a valid choice.', code: 'INVALID_SECONDARY_GOAL' };
    out.push(k);
  }
  if (out.length > MAX_SECONDARY) {
    return { error: `You can pick up to ${MAX_SECONDARY} extra goals besides your main goal.`, code: 'TOO_MANY_GOALS' };
  }
  const directional = [primary, ...out].filter((g) => WEIGHT_DIRECTION[g]);
  if (directional.length > 1) {
    const [a, b] = directional;
    return {
      error: `"${LABEL[a]}" and "${LABEL[b]}" pull your body weight in different directions, so they can't be combined. Keep one of them; "Build Muscle" and "Improve Performance" work with any weight goal.`,
      code: 'CONFLICTING_GOALS',
    };
  }
  return { value: out };
}

function parseExperience(raw) {
  if (raw === undefined) return { value: undefined };
  if (raw === null || raw === '') return { value: null };
  const k = String(raw).trim().toUpperCase();
  if (!EXPERIENCE_LEVELS.includes(k)) return { error: 'Please choose Beginner, Intermediate or Advanced.', code: 'INVALID_EXPERIENCE' };
  return { value: k };
}

function isoDay(d) {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}

function startOfUtcDay(now) {
  return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
}

/** Safe weekly change (kg/week) for the given direction. */
function safeWeeklyRate(direction, weightKg) {
  if (direction === 'down') return Math.min(1, Math.max(0.25, Number(weightKg) * 0.01));
  return 0.5;
}

/**
 * Validate a target date and judge whether the target weight is realistic by then.
 * @returns {{ value: string|null|undefined, feasibility?: object }} or {{ error, code }}
 */
function checkTargetDate({ targetDate, weightKg, targetWeightKg, now = new Date() }) {
  if (targetDate === undefined) return { value: undefined };
  if (targetDate === null || targetDate === '') return { value: null, feasibility: null };
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(targetDate).trim());
  if (!m) return { error: 'Please choose a valid target date.', code: 'INVALID_TARGET_DATE' };
  const t = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const check = new Date(t);
  if (check.getUTCMonth() !== Number(m[2]) - 1) return { error: 'Please choose a valid target date.', code: 'INVALID_TARGET_DATE' };
  const days = Math.round((t - startOfUtcDay(now)) / 86400000);
  if (days < MIN_TARGET_DAYS) {
    return { error: 'Your target date should be at least 2 weeks from today. Real changes in your body take time.', code: 'TARGET_DATE_TOO_SOON' };
  }
  if (days > MAX_TARGET_DAYS) {
    return { error: 'Please pick a target date within the next 2 years. You can set a new goal after reaching this one.', code: 'TARGET_DATE_TOO_FAR' };
  }
  return { value: isoDay(check), feasibility: targetFeasibility({ days, weightKg, targetWeightKg, now }) };
}

/** Pure realism check. Returns null when there is no weight change to judge. */
function targetFeasibility({ days, weightKg, targetWeightKg, now = new Date() }) {
  const w = Number(weightKg);
  const tw = Number(targetWeightKg);
  if (!Number.isFinite(w) || !Number.isFinite(tw) || w <= 0 || tw <= 0) return null;
  const diff = tw - w;
  if (Math.abs(diff) < 0.5) return null;
  const direction = diff < 0 ? 'down' : 'up';
  const weeks = days / 7;
  const requiredPerWeek = Math.abs(diff) / weeks;
  const safe = safeWeeklyRate(direction, w);
  const realistic = requiredPerWeek <= safe + 1e-9;
  const safeWeeks = Math.ceil(Math.abs(diff) / safe);
  const suggested = isoDay(new Date(startOfUtcDay(now) + safeWeeks * 7 * 86400000));
  const verb = direction === 'down' ? 'lose' : 'gain';
  const r = (n) => Math.round(n * 100) / 100;
  return {
    direction,
    weeks: Math.round(weeks * 10) / 10,
    changeKg: r(Math.abs(diff)),
    requiredPerWeek: r(requiredPerWeek),
    safeMaxPerWeek: r(safe),
    realistic,
    suggestedDate: suggested,
    message: realistic
      ? `Realistic: about ${r(requiredPerWeek)} kg a week, within the safe limit of ${r(safe)} kg a week.`
      : `This would mean you ${verb} about ${r(requiredPerWeek)} kg a week, more than the safe ${r(safe)} kg a week. A safer target date is ${suggested} or later.`,
  };
}

module.exports = {
  GOAL_KEYS,
  EXPERIENCE_LEVELS,
  MAX_SECONDARY,
  parseSecondaryGoals,
  parseExperience,
  checkTargetDate,
  targetFeasibility,
  safeWeeklyRate,
};
