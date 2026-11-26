const service = require('../services/goals.service');
const { validUserId } = require('../utils/ids');
const { parseSecondaryGoals, parseExperience, checkTargetDate } = require('../utils/goalSetup');

const {
  GOAL_TYPES,
  SEXES,
  PACES,
  ACTIVITY_LEVELS,
  normalizeActivity,
  enumField,
  numOrNull,
  validDob,
  parseSleepHours,
  toRecord,
} = service;

// POST /api/goals/:userId — create (or replace) the active goal + generate plan
async function postUserId(req, res, next) {
  try {
    const userId = validUserId(req.params.userId);
    if (!userId) return res.status(400).json({ error: 'Invalid user id' });
    const {
      dob,
      sex,
      heightCm,
      height_cm,
      weightKg,
      weight_kg,
      goalType,
      goal_type,
      targetWeightKg,
      target_weight_kg,
      pace,
      focus,
      activityLevel,
      activity_level,
      exerciseFreq,
      exercise_freq,
      sleepHours,
      sleep_hours,
      secondaryGoals,
      secondary_goals,
      targetDate,
      target_date,
      experienceLevel,
      experience_level,
      _carried: carried = {},
    } = req.body || {};

    const height = Number(heightCm ?? height_cm);
    const weight = Number(weightKg ?? weight_kg);
    if (!Number.isFinite(height) || !Number.isFinite(weight) || height <= 0 || weight <= 0) {
      return res.status(400).json({ error: 'Please enter your height (cm) and weight (kg) as numbers.' });
    }
    if (height < 50 || height > 300)
      return res.status(400).json({ error: 'Height must be between 50 and 300 cm. Check that you entered centimetres, not feet or metres.' });
    if (weight < 10 || weight > 1000)
      return res.status(400).json({ error: 'Weight must be between 10 and 1000 kg. Check that you entered kilograms, not pounds.' });
    const goalRaw = goalType ?? goal_type;
    const goal = typeof goalRaw === 'string' ? goalRaw.trim().toUpperCase() : null;
    if (!goal || !GOAL_TYPES.includes(goal)) {
      return res.status(400).json({ error: 'Please choose a fitness goal.', code: 'GOAL_REQUIRED' });
    }

    const checks = {
      sex: enumField(
        sex,
        SEXES.map((s) => s.toUpperCase())
      ),
      pace: enumField(pace, PACES),
      activity: enumField(normalizeActivity(activityLevel ?? activity_level), ACTIVITY_LEVELS),
      target: numOrNull(targetWeightKg ?? target_weight_kg, {
        min: 10,
        max: 1000,
        name: 'targetWeightKg',
      }),
      dob: validDob(dob),
    };
    // A stale activity level carried from the old goal must not block a goal
    // change the user made elsewhere: drop it (TDEE falls back to sedentary).
    if (checks.activity.error && carried.activityLevel) checks.activity = { value: null };
    const LABELS = { sex: 'sex', pace: 'progress pace', activity: 'activity level', target: 'target weight' };
    for (const [k, f] of Object.entries(checks)) {
      if (!f.error) continue;
      // Age/DOB problems already carry a full plain-language explanation.
      if (f.friendly) return res.status(400).json({ error: f.error, code: f.code });
      const msg = k === 'target'
        ? 'Target weight must be between 10 and 1000 kg.'
        : `Please choose a valid ${LABELS[k] || k}.`;
      return res.status(400).json({ error: msg, field: k });
    }
    const sleepCheck = parseSleepHours(sleepHours ?? sleep_hours);
    if (sleepCheck.error) return res.status(400).json({ error: sleepCheck.error, field: 'sleepHours' });
    // Section 3: extra goals, experience, target date.
    let extra = parseSecondaryGoals(secondaryGoals ?? secondary_goals, goal);
    if (extra.error && carried.secondaryGoals) {
      // Carried from the old goal and now conflicting: keep only the
      // non-weight extras instead of blocking the goal change.
      extra = parseSecondaryGoals(
        (secondaryGoals ?? secondary_goals ?? []).filter((g) => g === 'BUILD_MUSCLE' || g === 'PERFORMANCE'),
        goal
      );
    }
    if (extra.error) return res.status(400).json({ error: extra.error, code: extra.code, field: 'secondaryGoals' });
    const exp = parseExperience(experienceLevel ?? experience_level);
    if (exp.error) return res.status(400).json({ error: exp.error, code: exp.code, field: 'experienceLevel' });
    let dateCheck = checkTargetDate({
      targetDate: targetDate ?? target_date,
      weightKg: weight,
      targetWeightKg: checks.target.value,
    });
    if (dateCheck.error && carried.targetDate) dateCheck = { value: null, feasibility: null };
    if (dateCheck.error) return res.status(400).json({ error: dateCheck.error, code: dateCheck.code, field: 'targetDate' });

    const focusNorm =
      focus === undefined || focus === null || focus === ''
        ? null
        : String(focus).trim().slice(0, 40) || null;
    const exerciseNorm = exerciseFreq ?? exercise_freq ?? null;
    const exerciseFreqNorm =
      exerciseNorm === null || exerciseNorm === ''
        ? null
        : String(exerciseNorm).trim().slice(0, 20);

    const { plan, goal: record } = await service.createGoal(userId, {
      dob: checks.dob.value,
      sex: checks.sex.value,
      height,
      weight,
      goal,
      target: checks.target.value,
      pace: checks.pace.value,
      focus: focusNorm,
      activity: checks.activity.value,
      exerciseFreq: exerciseFreqNorm,
      sleepHours: sleepCheck.value,
      secondaryGoals: extra.value || [],
      targetDate: dateCheck.value || null,
      experienceLevel: exp.value || null,
    });
    res.status(201).json({ success: true, plan, goal: record, targetFeasibility: dateCheck.feasibility || null });
  } catch (e) {
    next(e);
  }
}

// GET /api/goals/active/:userId — active goal + progress vs target
async function getactiveUserId(req, res, next) {
  try {
    const userId = validUserId(req.params.userId);
    if (!userId) return res.status(400).json({ error: 'Invalid user id' });
    const row = await service.getActiveGoalRow(userId);
    if (!row) return res.json({ goal: null });

    const goal = toRecord(row);
    const { currentWeightKg, progressPct } = await service.computeProgress(userId, goal);

    res.json({ goal, currentWeightKg, progressPct });
  } catch (e) {
    next(e);
  }
}

// PATCH /api/goals/:userId/change — switch goal (archives old, generates new plan)
async function patchchangeUserId(req, res, next) {
  try {
    const userId = validUserId(req.params.userId);
    if (!userId) return res.status(400).json({ error: 'Invalid user id' });
    const prev = await service.getActiveGoalRow(userId);
    if (!prev) {
      // No prior goal — treat as first creation
      return postUserId(req, res, next);
    }
    const mergedReq = { ...req, body: service.carriedBody(prev, req.body) };
    return postUserId(mergedReq, res, next);
  } catch (e) {
    next(e);
  }
}

// PATCH /api/goals/active/:userId — edit identity fields (dob/sex) in place.
// Unlike POST /change (archive + re-insert + full rewrite), this only touches
// the active row. The plan IS recomputed because BMR depends on age/sex.
async function patchActiveUserId(req, res, next) {
  try {
    const userId = validUserId(req.params.userId);
    if (!userId) return res.status(400).json({ error: 'Invalid user id' });
    const { dob, sex, experienceLevel } = req.body || {};
    if (dob === undefined && sex === undefined && experienceLevel === undefined) {
      return res.status(400).json({ error: 'Nothing to update. Provide dob, sex or experienceLevel.' });
    }
    const prev = await service.getActiveGoalRow(userId);
    if (!prev) {
      return res
        .status(404)
        .json({ error: 'No active goal. Complete onboarding first.', code: 'NO_ACTIVE_GOAL' });
    }
    // Experience level does not change calories, so it is saved in place.
    if (experienceLevel !== undefined) {
      const exp = parseExperience(experienceLevel);
      if (exp.error) return res.status(400).json({ error: exp.error, code: exp.code, field: 'experienceLevel' });
      await service.updateExperience(prev.id, exp.value);
      if (dob === undefined && sex === undefined) {
        const row = await service.getActiveGoalRow(userId);
        return res.json({ success: true, goal: toRecord(row) });
      }
    }

    const dobCheck = dob === undefined ? { value: prev.dob } : validDob(dob);
    if (dobCheck.error) return res.status(400).json({ error: dobCheck.error, code: dobCheck.code });
    const sexCheck =
      sex === undefined
        ? { value: prev.sex }
        : enumField(
            sex,
            SEXES.map((s) => s.toUpperCase())
          );
    if (sexCheck.error) return res.status(400).json({ error: `sex: ${sexCheck.error}` });

    const dobVal = dobCheck.value ? new Date(dobCheck.value).toISOString().slice(0, 10) : null;
    const sexVal = sexCheck.value ? String(sexCheck.value).toLowerCase() : null;

    const goal = await service.updateActiveGoalIdentity(prev, dobVal, sexVal);
    res.json({ success: true, goal });
  } catch (e) {
    next(e);
  }
}

// POST /api/goals/active/:userId/recalibrate — re-derive kcal/macros from the
// latest weigh-in (manual button; auto recalibration is threshold-gated, this
// forces the recompute).
async function postActiveRecalibrate(req, res, next) {
  try {
    const userId = validUserId(req.params.userId);
    if (!userId) return res.status(400).json({ error: 'Invalid user id' });
    const prev = await service.getActiveGoalRow(userId);
    if (!prev) {
      return res
        .status(404)
        .json({ error: 'No active goal. Complete onboarding first.', code: 'NO_ACTIVE_GOAL' });
    }
    const result = await service.recalibrateGoal(userId, { force: true });
    if (!result.recalibrated) {
      const reasons = {
        NO_WEIGH_IN: 'Log your weight first — calibration needs at least one weigh-in.',
        MISSING_PROFILE: 'Goal is missing height/sex data — re-check onboarding.',
        ERROR: 'Recalibration failed — try again.',
      };
      return res.status(409).json({
        error: reasons[result.reason] || 'Recalibration not possible right now.',
        code: result.reason,
      });
    }
    res.json({
      success: true,
      message: `Targets recalibrated to your latest weigh-in (${result.driftKg > 0 ? '+' : ''}${result.driftKg} kg since last calibration).`,
      driftKg: result.driftKg,
      plan: result.plan,
      goal: result.goal,
    });
  } catch (e) {
    next(e);
  }
}

module.exports = { postUserId, getactiveUserId, patchchangeUserId, patchActiveUserId, postActiveRecalibrate };
