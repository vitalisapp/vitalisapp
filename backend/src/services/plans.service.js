// Plans — business logic + DB access. Controllers stay thin (parse/validate,
// call here, shape the response). All SQL lives in this file.
const db = require('../config/db');
const { AppError } = require('../utils/errors');
const { recommendPlan } = require('../utils/workoutRecommender');
const { ageOn } = require('../utils/age');
const { recommendRoutine } = require('../utils/warmupRecommender');
const { classifyBmi } = require('../utils/health');
const { requiredLevelForPlan } = require('../utils/progression');

// Bodyweight starter sets per plan focus (equipment: none).
// Recovery days intentionally get zero exercises (tracker offers Mark Complete).
const STARTER_BY_TAG = {
    Strength: [
        { exercise_order: 1, exercise_name: 'Bodyweight Squats', sets: 3, reps: '12', duration_seconds: null, rest_seconds: 60, notes: null },
        { exercise_order: 2, exercise_name: 'Push-Ups', sets: 3, reps: '10', duration_seconds: null, rest_seconds: 60, notes: 'Knees down to scale' },
        { exercise_order: 3, exercise_name: 'Plank', sets: 3, reps: null, duration_seconds: 30, rest_seconds: 45, notes: null },
        { exercise_order: 4, exercise_name: 'Glute Bridge', sets: 2, reps: '15', duration_seconds: null, rest_seconds: 45, notes: 'Squeeze at the top' },
    ],
    Cardio: [
        { exercise_order: 1, exercise_name: 'Jumping Jacks', sets: 3, reps: null, duration_seconds: 45, rest_seconds: 30, notes: null },
        { exercise_order: 2, exercise_name: 'High Knees', sets: 3, reps: null, duration_seconds: 30, rest_seconds: 30, notes: null },
        { exercise_order: 3, exercise_name: 'Mountain Climbers', sets: 3, reps: null, duration_seconds: 30, rest_seconds: 30, notes: 'Keep hips low' },
        { exercise_order: 4, exercise_name: 'Skaters', sets: 3, reps: null, duration_seconds: 30, rest_seconds: 30, notes: null },
    ],
    Mobility: [
        { exercise_order: 1, exercise_name: 'Cat-Cow', sets: 2, reps: null, duration_seconds: 60, rest_seconds: 20, notes: 'Move with your breath' },
        { exercise_order: 2, exercise_name: "Child's Pose Hold", sets: 2, reps: null, duration_seconds: 45, rest_seconds: 20, notes: null },
        { exercise_order: 3, exercise_name: 'Hip Circles', sets: 2, reps: '10 each side', duration_seconds: null, rest_seconds: 20, notes: null },
        { exercise_order: 4, exercise_name: 'Deep Breathing', sets: 1, reps: null, duration_seconds: 60, rest_seconds: null, notes: 'Nose in, slow mouth out' },
    ],
    Performance: [
        { exercise_order: 1, exercise_name: 'Jump Squats', sets: 4, reps: '8', duration_seconds: null, rest_seconds: 60, notes: 'Land soft' },
        { exercise_order: 2, exercise_name: 'Walking Lunges', sets: 3, reps: '10 each leg', duration_seconds: null, rest_seconds: 60, notes: null },
        { exercise_order: 3, exercise_name: 'Plank Shoulder Taps', sets: 3, reps: '12', duration_seconds: null, rest_seconds: 45, notes: 'Hips still' },
        { exercise_order: 4, exercise_name: 'Superman Hold', sets: 3, reps: null, duration_seconds: 30, rest_seconds: 45, notes: null },
    ],
};

// Fat Loss trains like cardio; Flexibility like mobility; anything else gets the balanced set.
function starterForTag(tag) {
    if (tag === 'Fat Loss' || tag === 'Cardio') return STARTER_BY_TAG.Cardio;
    if (tag === 'Flexibility' || tag === 'Mobility' || tag === 'Recovery') return STARTER_BY_TAG.Mobility;
    if (tag === 'Performance') return STARTER_BY_TAG.Performance;
    return STARTER_BY_TAG.Strength;
}

function humanizeGoal(goalType) {
    return String(goalType || 'Fitness').toLowerCase().split('_').map((w) => w.slice(0, 1).toUpperCase() + w.slice(1)).join(' ');
}

function tagForGoal(goalType) {
    if (goalType === 'LOSE_WEIGHT') return 'Fat Loss';
    if (goalType === 'BUILD_MUSCLE' || goalType === 'GAIN_WEIGHT') return 'Strength';
    if (goalType === 'PERFORMANCE') return 'Performance';
    return 'General';
}

function skeletonDays(durationDays, minutes) {
    const trainMins = minutes ? minutes.train : 30;
    const restMins = minutes ? minutes.rest : 15;
    const days = [];
    for (let n = 1; n <= durationDays; n += 1) {
        const recovery = n % 3 === 0;
        days.push({
            day_number: n,
            title: recovery ? `Day ${n} — Recovery` : `Day ${n} — Training`,
            activity_type: recovery ? 'Recovery' : 'Workout',
            description: recovery
                ? 'Mobility + light walk. Keep it easy.'
                : 'Main session. Warm up, train, cool down.',
            duration_mins: recovery ? restMins : trainMins,
        });
    }
    return days;
}

// Insert a personal plan + its day skeleton + focus-matched starter exercises.
// Runs inside the caller's transaction (conn), so a failure rolls everything back.
// dayMins: preferred session length from training_preferences (Module 5) —
// sizes each training day; recovery days get half. null keeps the default 30.
async function insertPersonalPlan(conn, userId, { title, tag, intensity, targetFocus, durationDays, description, imageSeed, dayMins }) {
    const [[dup]] = await conn.execute(
        'SELECT id FROM plans WHERE owner_user_id = ? AND title = ? LIMIT 1',
        [userId, title]
    );
    if (dup) {
        throw new AppError('You already have a plan with this title', 409, 'PLAN_TITLE_DUP');
    }
    let planId;
    try {
        const [result] = await conn.execute(
            `INSERT INTO plans (name, title, tag, intensity, duration, target_focus, price, image_seed, description, duration_days, difficulty, owner_user_id, is_template)
             VALUES (?, ?, ?, ?, ?, ?, 0.00, ?, ?, ?, ?, ?, 0)`,
            [title, title, tag, intensity, `${durationDays} days`, targetFocus, imageSeed || 'personal', description, durationDays, intensity, userId]
        );
        planId = result.insertId;
    } catch (e) {
        // Pre-032 database (no owner columns) — tell client to migrate instead of 500.
        if (e && (e.errno === 1054 || /Unknown column 'owner_user_id'|Unknown column 'is_template'/.test(e.message || ''))) {
            throw new AppError('Personal plans need migration 032 — run npm run db:migrate', 503, 'NEEDS_MIGRATION_032');
        }
        if (e && e.code === 'ER_DUP_ENTRY') {
            throw new AppError('Plan title already taken — try another title', 409, 'PLAN_TITLE_DUP');
        }
        throw e;
    }
    const minutes = dayMins != null ? { train: Math.max(15, Math.min(180, Math.round(dayMins))), rest: Math.max(10, Math.round((Math.min(180, dayMins)) / 2)) } : null;
    for (const d of skeletonDays(durationDays, minutes)) {
        const [contentResult] = await conn.execute(
            `INSERT INTO plan_contents (plan_id, day_number, title, activity_type, description, duration_mins)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [planId, d.day_number, d.title, d.activity_type, d.description, d.duration_mins]
        );
        // Workout days get the focus-matched starter set; recovery days stay empty.
        if (d.activity_type === 'Workout' && contentResult && contentResult.insertId) {
            for (const ex of starterForTag(tag)) {
                await conn.execute(
                    `INSERT INTO plan_exercises (plan_content_id, exercise_order, exercise_name, sets, reps, duration_seconds, rest_seconds, notes)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [contentResult.insertId, ex.exercise_order, ex.exercise_name, ex.sets, ex.reps, ex.duration_seconds, ex.rest_seconds, ex.notes]
                );
            }
        }
    }
    await conn.execute(
        'INSERT IGNORE INTO user_plans (user_id, plan_id, enrolled_at) VALUES (?, ?, NOW())',
        [userId, planId]
    );
    return planId;
}

// A plan is visible to a user when it is a shared template (no owner) or their own
// personal plan. Someone else's personal plan answers 404 so its id is not confirmable.
function canSeePlan(plan, userId) {
    return plan.owner_user_id == null || String(plan.owner_user_id) === String(userId);
}

// Enroll in a marketplace template. Identity comes from JWT (userId), never body.
async function enroll(userId, planId) {
    // 404 (not 500 FK) when plan doesn't exist or belongs to another user
    const [[plan]] = await db.execute('SELECT * FROM plans WHERE id = ? LIMIT 1', [planId]);
    if (!plan || !canSeePlan(plan, userId)) throw new AppError('Plan not found', 404, 'PLAN_NOT_FOUND');
    // Revision #4: Advanced / Extreme curated plans need the matching level.
    // Already-enrolled users hit ALREADY_ENROLLED below and keep access.
    const [[already]] = await db.execute('SELECT id FROM user_plans WHERE user_id = ? AND plan_id = ? LIMIT 1', [userId, planId]);
    if (!already) await require('./progression.service').assertCanStartPlan(userId, plan);
    try {
        await db.execute(
            `INSERT INTO user_plans (user_id, plan_id, enrolled_at) VALUES (?, ?, NOW())`,
            [userId, planId]
        );
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') throw new AppError('You already own this blueprint', 409, 'ALREADY_ENROLLED');
        throw err;
    }
}

async function completeProgress(userId, planId, dayNumber) {
    // 404 (not 500 FK) when plan doesn't exist; 409 when not enrolled.
    const [[plan]] = await db.execute('SELECT id FROM plans WHERE id = ? LIMIT 1', [planId]);
    if (!plan) throw new AppError('Plan not found', 404, 'PLAN_NOT_FOUND');
    const [[enrolled]] = await db.execute(
        'SELECT id FROM user_plans WHERE user_id = ? AND plan_id = ? LIMIT 1',
        [userId, planId]
    );
    if (!enrolled) throw new AppError('Enroll in this plan first', 409, 'NOT_ENROLLED');
    // Sequential unlock: every earlier day must be cleared first.
    const [[gap]] = await db.execute(
        `SELECT pc.day_number FROM plan_contents pc
           LEFT JOIN user_plan_progress up
             ON up.plan_id = pc.plan_id AND up.day_number = pc.day_number
            AND up.user_id = ? AND up.is_completed = 1
          WHERE pc.plan_id = ? AND pc.day_number < ? AND up.day_number IS NULL
          ORDER BY pc.day_number ASC LIMIT 1`,
        [userId, planId, dayNumber]
    );
    if (gap) throw new AppError(`Finish Day ${gap.day_number} first`, 409, 'DAY_LOCKED');
    await db.execute(
        `INSERT INTO user_plan_progress (user_id, plan_id, day_number, is_completed, completed_at)
         VALUES (?, ?, ?, 1, NOW())
         ON DUPLICATE KEY UPDATE is_completed = 1, completed_at = NOW()`,
        [userId, planId, dayNumber]
    );
}

async function getProgress(userId, planId) {
    const [rows] = await db.execute(
        'SELECT day_number, is_completed FROM user_plan_progress WHERE user_id = ? AND plan_id = ?',
        [userId, planId]
    );
    return rows;
}

async function getPlanContent(userId, planId) {
    const [[plan]] = await db.execute('SELECT id, owner_user_id FROM plans WHERE id = ? LIMIT 1', [planId]);
    if (!plan || !canSeePlan(plan, userId)) throw new AppError('Plan not found', 404, 'PLAN_NOT_FOUND');
    const [days] = await db.execute(
        `SELECT id, day_number, title, activity_type, description, duration_mins
         FROM plan_contents WHERE plan_id = ? ORDER BY day_number ASC`,
        [planId]
    );

    if (days.length === 0) {
        throw new AppError('Plan not found or has no content', 404, 'PLAN_NOT_FOUND');
    }

    const dayIds = days.map(d => d.id);
    const placeholders = dayIds.map(() => '?').join(',');
    const [exerciseRows] = await db.execute(
        `SELECT plan_content_id, exercise_order, exercise_name, sets, reps, duration_seconds, rest_seconds, notes
         FROM plan_exercises
         WHERE plan_content_id IN (${placeholders})
         ORDER BY plan_content_id ASC, exercise_order ASC`,
        dayIds
    );

    const exercisesByDay = {};
    for (const ex of exerciseRows) {
        if (!exercisesByDay[ex.plan_content_id]) exercisesByDay[ex.plan_content_id] = [];
        exercisesByDay[ex.plan_content_id].push({
            order: ex.exercise_order,
            name: ex.exercise_name,
            sets: ex.sets,
            reps: ex.reps,
            durationSeconds: ex.duration_seconds,
            restSeconds: ex.rest_seconds,
            notes: ex.notes,
        });
    }

    return days.map(day => ({
        ...day,
        exercises: exercisesByDay[day.id] || [],
    }));
}

// Personalized warm-up + cool-down for one plan day (Revision #3). Reads the
// day itself (works for generated AND curated plans) and the user's level,
// goals and safety settings; the routine logic is pure (warmupRecommender).
async function getDayRoutine(userId, planId, dayNumber) {
    const [[owned]] = await db.execute('SELECT id, owner_user_id FROM plans WHERE id = ? LIMIT 1', [planId]);
    if (!owned || !canSeePlan(owned, userId)) throw new AppError('Plan day not found', 404, 'PLAN_DAY_NOT_FOUND');
    const [[day]] = await db.execute(
        `SELECT id, day_number, title, activity_type, duration_mins
           FROM plan_contents WHERE plan_id = ? AND day_number = ? LIMIT 1`,
        [planId, dayNumber]
    );
    if (!day) throw new AppError('Plan day not found', 404, 'PLAN_DAY_NOT_FOUND');
    const [exercises] = await db.execute(
        'SELECT exercise_name AS name FROM plan_exercises WHERE plan_content_id = ? ORDER BY exercise_order ASC',
        [day.id]
    );
    const goal = await loadActiveGoal(userId);
    const prefs = await loadPrefs(userId);
    return recommendRoutine(routineInput(goal, prefs, { ...day, exercises }));
}

/** Pure: goal row + prefs + day → routine input. Missing level → BEGINNER (safest). */
function routineInput(goal, prefs, day) {
    let age = null;
    try { age = goal?.dob ? ageOn(goal.dob) : null; } catch { age = null; }
    const bmiClass = classifyBmi(goal?.bmi);
    const sedentary = goal?.activity_level === 'SEDENTARY';
    return {
        experience: goal?.experience_level || undefined,
        goals: goal ? [goal.goal_type, ...parseSecondary(goal.secondary_goals)] : [],
        day,
        excludedCategories: prefs?.excludedCategories || [],
        // Same low-impact rule as the workout recommender.
        lowImpact: Boolean(bmiClass && (bmiClass.key === 'OBESE' || (bmiClass.key === 'OVERWEIGHT' && sedentary))),
        age,
    };
}

async function getPlansForUser(userId) {
    const [rows] = await db.execute(
        `SELECT p.*, IF(up.user_id IS NULL, 0, 1) as is_enrolled
         FROM plans p
         LEFT JOIN user_plans up ON p.id = up.plan_id AND up.user_id = ?
         WHERE p.owner_user_id IS NULL OR p.owner_user_id = ?
         ORDER BY p.id ASC`,
        [userId, userId]
    );
    // Per-plan completed-day counts (separate query so list works even
    // when 032 columns/progress table differ pre-migration).
    let doneByPlan = {};
    try {
        const [counts] = await db.execute(
            `SELECT plan_id, COUNT(*) AS done FROM user_plan_progress
             WHERE user_id = ? AND is_completed = 1 GROUP BY plan_id`,
            [userId]
        );
        for (const r of counts) doneByPlan[r.plan_id] = Number(r.done || 0);
    } catch { doneByPlan = {}; }
    // Revision #4: lock state for Advanced / Extreme curated plans. Fail-open
    // for display only (enroll still enforces); pre-migration nothing locks.
    let userLevel = null;
    if (rows.some((p) => requiredLevelForPlan(p) > 1)) {
        try { userLevel = await require('./progression.service').currentLevel(userId); } catch { userLevel = null; }
    }
    return rows.map((p) => {
        const requiredLevel = requiredLevelForPlan(p);
        const total = Number(p.duration_days || 0);
        const done = Number(doneByPlan[p.id] || 0);
        const ownerId = p.owner_user_id ?? null;
        return {
            ...p,
            owner_user_id: ownerId,
            // Pre-032 rows have no is_template column → treat as template.
            is_template: p.is_template ?? 1,
            is_owner: ownerId != null && String(ownerId) === String(userId) ? 1 : 0,
            completed_days: done,
            progress_pct: total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0,
            required_level: requiredLevel,
            locked: userLevel !== null && requiredLevel > userLevel && Number(p.is_enrolled) !== 1,
        };
    });
}

// Create a personal plan (transaction: plan + contents + exercises + enroll).
async function createPersonalPlan(userId, { title, tag, intensity, targetFocus, durationDays, description }) {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();
        const planId = await insertPersonalPlan(conn, userId, {
            title, tag, intensity, targetFocus, durationDays, description,
        });
        await conn.query('COMMIT');
        return { planId };
    } catch (err) {
        try { await conn.query('ROLLBACK'); } catch { /* noop */ }
        throw err;
    } finally {
        try { conn.release(); } catch { /* noop */ }
    }
}

async function updatePersonalPlan(userId, planId, body) {
    const [[plan]] = await db.execute('SELECT id, owner_user_id FROM plans WHERE id = ? LIMIT 1', [planId]);
    if (!plan) throw new AppError('Plan not found', 404, 'PLAN_NOT_FOUND');
    if (plan.owner_user_id == null || String(plan.owner_user_id) !== String(userId)) {
        throw new AppError('Only the owner can edit this plan', 403, 'FORBIDDEN');
    }
    const patch = {};
    if (body.title !== undefined) patch.title = body.title;
    if (body.tag !== undefined) patch.tag = body.tag;
    if (body.intensity !== undefined) patch.intensity = body.intensity;
    if (body.targetFocus !== undefined) patch.target_focus = body.targetFocus;
    if (body.description !== undefined) patch.description = body.description;
    if (body.durationDays !== undefined) patch.duration_days = body.durationDays;
    if (body.title !== undefined) patch.name = body.title;
    const keys = Object.keys(patch);
    if (keys.length === 0) throw new AppError('Nothing to update', 400, 'NOTHING_TO_UPDATE');
    try {
        await db.execute(
            `UPDATE plans SET ${keys.map((k) => `\`${k}\` = ?`).join(', ')} WHERE id = ?`,
            [...keys.map((k) => patch[k]), planId]
        );
    } catch (e) {
        if (e && e.code === 'ER_DUP_ENTRY') throw new AppError('Plan title already taken — try another title', 409, 'PLAN_TITLE_DUP');
        throw e;
    }
}

async function deletePersonalPlan(userId, planId) {
    const [[plan]] = await db.execute('SELECT id, owner_user_id FROM plans WHERE id = ? LIMIT 1', [planId]);
    if (!plan) throw new AppError('Plan not found', 404, 'PLAN_NOT_FOUND');
    if (plan.owner_user_id == null || String(plan.owner_user_id) !== String(userId)) {
        throw new AppError('Only the owner can delete this plan', 403, 'FORBIDDEN');
    }
    await db.execute('DELETE FROM plans WHERE id = ?', [planId]);
}

// ── Section 3: goal-based recommended plans ───────────────────────────────────
// One generated plan per goal (primary + up to 2 extras). Each plan is built by
// utils/workoutRecommender from the health assessment (BMI, age, activity),
// experience level and training preferences (equipment, days, minutes,
// exclusions). fitness_goals.source_plan_id marks the ACTIVE plan.

const GOAL_KEYS = ['LOSE_WEIGHT', 'MAINTAIN_WEIGHT', 'GAIN_WEIGHT', 'BUILD_MUSCLE', 'PERFORMANCE'];

function parseSecondary(raw) {
    return String(raw || '').split(',').map((x) => x.trim()).filter((x) => GOAL_KEYS.includes(x)).slice(0, 2);
}

async function loadActiveGoal(userId) {
    const full = `SELECT id, goal_type, secondary_goals, experience_level, dob, bmi, activity_level,
                         daily_kcal, protein_g, carbs_g, fat_g, source_plan_id
                    FROM fitness_goals WHERE user_id = ? AND status = 'active' ORDER BY id DESC LIMIT 1`;
    const basic = `SELECT id, goal_type, dob, bmi, activity_level, daily_kcal, protein_g, carbs_g, fat_g
                     FROM fitness_goals WHERE user_id = ? AND status = 'active' ORDER BY id DESC LIMIT 1`;
    let rows;
    try {
        [rows] = await db.execute(full, [userId]);
    } catch (e) {
        if (e && e.errno !== 1054) throw e;
        [rows] = await db.execute(basic, [userId]); // pre-050 / pre-032
    }
    return rows && rows[0] ? rows[0] : null;
}

async function loadPrefs(userId) {
    try {
        return await require('./trainingPrefs.service').get(userId);
    } catch {
        return null; // missing/old schema never blocks generation
    }
}

/** Pure: turn goal row + prefs into recommender input. */
function recommenderInput(goal, prefs, goalType) {
    let age = null;
    try { age = goal.dob ? ageOn(goal.dob) : null; } catch { age = null; }
    return {
        goalType,
        experience: goal.experience_level || undefined,
        activityLevel: goal.activity_level,
        bmi: goal.bmi != null ? Number(goal.bmi) : null,
        age,
        sessionMinutes: prefs?.sessionDurationMins ?? 30,
        equipment: prefs?.equipment || [],
        preferredDays: prefs?.preferredDays || [],
        excludedCategories: prefs?.excludedCategories || [],
        excludedExercises: prefs?.excludedExercises || [],
        secondaryGoals: [goal.goal_type, ...parseSecondary(goal.secondary_goals)].filter((g) => g !== goalType),
    };
}

// Replace a plan's days + exercises with a recommender schedule (in conn's tx).
async function writeSchedule(conn, planId, schedule) {
    await conn.execute('DELETE FROM plan_contents WHERE plan_id = ?', [planId]); // cascades exercises
    for (const d of schedule) {
        const [r] = await conn.execute(
            `INSERT INTO plan_contents (plan_id, day_number, title, activity_type, description, duration_mins)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [planId, d.day_number, d.title, d.activity_type, d.description, d.duration_mins]
        );
        for (const ex of d.exercises) {
            await conn.execute(
                `INSERT INTO plan_exercises (plan_content_id, exercise_order, exercise_name, sets, reps, duration_seconds, rest_seconds, notes)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [r.insertId, ex.exercise_order, ex.exercise_name, ex.sets, ex.reps, ex.duration_seconds, ex.rest_seconds, ex.notes]
            );
        }
    }
}

async function saveGoalMeta(conn, planId, goalType, rationale) {
    try {
        await conn.execute('UPDATE plans SET goal_type = ?, rationale = ? WHERE id = ?', [goalType, JSON.stringify(rationale), planId]);
    } catch (e) {
        if (e && e.errno !== 1054) throw e; // pre-050: plan still works without the explanation
    }
}

// Generate (or refresh) the recommended plan for ONE goal.
// opts.goalType  — defaults to the primary goal; must be primary or an extra goal.
// opts.regenerate — rebuild an existing plan's days from current inputs.
// opts.makeActive — link it as the active plan (default: only for the primary
//                   goal when there is no active plan yet, or the primary plan).
async function autoCreateFromGoal(userId, opts = {}) {
    const goal = await loadActiveGoal(userId);
    if (!goal) throw new AppError('No active goal — complete onboarding first', 404, 'NO_ACTIVE_GOAL');
    const goals = [goal.goal_type, ...parseSecondary(goal.secondary_goals)];
    const goalType = opts.goalType || goal.goal_type;
    if (!goals.includes(goalType)) {
        throw new AppError('That goal is not one of your current goals.', 400, 'GOAL_NOT_SELECTED');
    }
    const isPrimary = goalType === goal.goal_type;
    const prefs = await loadPrefs(userId);
    const rec = recommendPlan(recommenderInput(goal, prefs, goalType));

    const label = humanizeGoal(goalType);
    const title = `My ${label} Plan`;
    const tag = tagForGoal(goalType);
    const nutrition = isPrimary && goal.daily_kcal != null
        ? ` Nutrition target: ${Number(goal.daily_kcal).toLocaleString()} kcal/day${goal.protein_g != null ? `, ${goal.protein_g} g protein` : ''}.`
        : '';
    const description = `Recommended for your ${label} goal: ${rec.trainingDays} training days a week, ${rec.exercisesPerSession} exercises per session, ${rec.experience.toLowerCase()} level${rec.lowImpact ? ', low-impact' : ''}.${nutrition} Edit anytime.`.slice(0, 2000);
    const intensity = { BEGINNER: 'Low', INTERMEDIATE: 'Moderate', ADVANCED: 'High' }[rec.experience] || 'Moderate';

    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();
        const [[existing]] = await conn.execute(
            'SELECT id FROM plans WHERE owner_user_id = ? AND title = ? LIMIT 1',
            [userId, title]
        );
        let planId;
        let created = false;
        let refreshed = false;
        if (existing) {
            planId = existing.id;
            const [[hasDays]] = await conn.execute('SELECT COUNT(*) AS n FROM plan_contents WHERE plan_id = ?', [planId]);
            if (opts.regenerate || !Number(hasDays?.n)) {
                await writeSchedule(conn, planId, rec.schedule);
                await conn.execute(
                    'UPDATE plans SET tag = ?, target_focus = ?, intensity = ?, difficulty = ?, description = ?, duration_days = 7 WHERE id = ?',
                    [tag, tag, intensity, intensity, description, planId]
                );
                refreshed = true;
            }
        } else {
            planId = await insertPersonalPlan(conn, userId, {
                title, tag, intensity, targetFocus: tag, durationDays: 7, description,
                imageSeed: 'personal-goal', dayMins: prefs?.sessionDurationMins ?? null,
            });
            await writeSchedule(conn, planId, rec.schedule);
            created = true;
        }
        if (created || refreshed) await saveGoalMeta(conn, planId, goalType, rec.rationale);
        await conn.execute(
            'INSERT IGNORE INTO user_plans (user_id, plan_id, enrolled_at) VALUES (?, ?, NOW())',
            [userId, planId]
        );
        const makeActive = opts.makeActive ?? (isPrimary || !goal.source_plan_id);
        if (makeActive) {
            try {
                await conn.execute('UPDATE fitness_goals SET source_plan_id = ? WHERE id = ?', [planId, goal.id]);
            } catch { /* pre-032 — non-fatal */ }
        }
        await conn.query('COMMIT');
        return { planId, created, refreshed, goalType, active: Boolean(makeActive), rationale: rec.rationale };
    } catch (err) {
        try { await conn.query('ROLLBACK'); } catch { /* noop */ }
        throw err;
    } finally {
        try { conn.release(); } catch { /* noop */ }
    }
}

// Generate plans for the primary goal and every extra goal. The primary plan
// becomes active. Used at the end of onboarding and after goal changes.
async function generateForAllGoals(userId, { regenerate = false } = {}) {
    const goal = await loadActiveGoal(userId);
    if (!goal) throw new AppError('No active goal — complete onboarding first', 404, 'NO_ACTIVE_GOAL');
    const results = [];
    for (const g of parseSecondary(goal.secondary_goals)) {
        results.push(await autoCreateFromGoal(userId, { goalType: g, regenerate, makeActive: false }));
    }
    // Primary last so it wins the active slot.
    const primary = await autoCreateFromGoal(userId, { goalType: goal.goal_type, regenerate, makeActive: true });
    return { planId: primary.planId, created: primary.created, plans: [primary, ...results] };
}

// Make one of the user's own plans the active plan for their goal.
async function setActivePlan(userId, planId) {
    const [[plan]] = await db.execute('SELECT id, owner_user_id, title FROM plans WHERE id = ? LIMIT 1', [planId]);
    if (!plan) throw new AppError('Plan not found', 404, 'PLAN_NOT_FOUND');
    const owns = plan.owner_user_id != null && String(plan.owner_user_id) === String(userId);
    if (!owns) {
        const [[enrolled]] = await db.execute('SELECT 1 AS ok FROM user_plans WHERE user_id = ? AND plan_id = ? LIMIT 1', [userId, planId]);
        if (!enrolled) throw new AppError('Join this plan before making it active.', 403, 'NOT_ENROLLED');
    }
    const goal = await loadActiveGoal(userId);
    if (!goal) throw new AppError('No active goal — complete onboarding first', 404, 'NO_ACTIVE_GOAL');
    try {
        await db.execute('UPDATE fitness_goals SET source_plan_id = ? WHERE id = ?', [planId, goal.id]);
    } catch (e) {
        if (e && e.errno === 1054) throw new AppError('Active plans need migration 032 — run npm run db:migrate', 503, 'NEEDS_MIGRATION_032');
        throw e;
    }
    return { planId: plan.id, title: plan.title };
}

// ── Module 5: one-click adaptive adjustment ───────────────────────────────────
// mode 'shorter': cap every training day at ≤30 mins (schedules, never auto-
// load). mode 'gentle': +1 set per rep exercise (≤5), +10s holds (≤120),
// +10s rest (≤120). Only the user can trigger these — the engine never
// increases intensity on its own.

const ADJUST_NOTES = {
    shorter: 'Adapted: fit to ≤30 min sessions',
    gentle: 'Adapted: +1 set / slightly longer holds',
};

async function adjustLinkedPlan(userId, mode) {
    if (!ADJUST_NOTES[mode]) {
        throw new AppError("mode must be 'shorter' or 'gentle'", 400, 'INVALID_ADJUST_MODE');
    }
    const [[goal]] = await db.execute(
        `SELECT id, source_plan_id FROM fitness_goals
          WHERE user_id = ? AND status = 'active' ORDER BY id DESC LIMIT 1`,
        [userId]
    );
    if (!goal) throw new AppError('No active goal — complete onboarding first', 404, 'NO_ACTIVE_GOAL');
    if (!goal.source_plan_id) {
        throw new AppError('No linked training plan — generate one from your goal first', 404, 'PLAN_NOT_LINKED');
    }
    const [[plan]] = await db.execute(
        `SELECT id, description, owner_user_id FROM plans WHERE id = ? LIMIT 1`,
        [goal.source_plan_id]
    );
    if (!plan) throw new AppError('Linked plan not found', 404, 'PLAN_NOT_FOUND');
    if (plan.owner_user_id == null || String(plan.owner_user_id) !== String(userId)) {
        throw new AppError('Only the plan owner can adjust it', 403, 'FORBIDDEN');
    }

    const note = ADJUST_NOTES[mode];
    // Idempotent guard: each mode may be applied once per plan. Previously
    // this check only skipped the description update while the +1 set / +10s
    // hold SQL still executed on every click — silently stacking load while
    // the API claimed "Already adjusted".
    if (String(plan.description || '').includes(note)) {
        return {
            planId: plan.id,
            mode,
            alreadyApplied: true,
            message: `Already adjusted (${note}) — apply was skipped. Edit the plan manually for further changes.`,
        };
    }
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();
        if (mode === 'shorter') {
            await conn.execute(
                `UPDATE plan_contents SET duration_mins = LEAST(duration_mins, 30) WHERE plan_id = ?`,
                [plan.id]
            );
        } else {
            // Rep-based exercises: one more set (cap 5), rest bumped for safety.
            await conn.execute(
                `UPDATE plan_exercises pe
                   JOIN plan_contents pc ON pc.id = pe.plan_content_id
                    SET pe.sets = LEAST(pe.sets + 1, 5)
                  WHERE pc.plan_id = ? AND pe.reps IS NOT NULL`,
                [plan.id]
            );
            // Hold-based exercises: longer holds (cap 120s) + extra rest.
            await conn.execute(
                `UPDATE plan_exercises pe
                   JOIN plan_contents pc ON pc.id = pe.plan_content_id
                    SET pe.duration_seconds = LEAST(pe.duration_seconds + 10, 120),
                        pe.rest_seconds = LEAST(COALESCE(pe.rest_seconds, 45) + 10, 120)
                  WHERE pc.plan_id = ? AND pe.duration_seconds IS NOT NULL`,
                [plan.id]
            );
        }
        // Always note — the guard above guarantees this path runs once.
        const desc = `${plan.description || ''} ${note}`.trim().slice(0, 2000);
        await conn.execute('UPDATE plans SET description = ? WHERE id = ?', [desc, plan.id]);
        await conn.query('COMMIT');
        return { planId: plan.id, mode, message: `Plan adjusted — ${note}` };
    } catch (err) {
        try { await conn.query('ROLLBACK'); } catch { /* noop */ }
        throw err;
    } finally {
        try { conn.release(); } catch { /* noop */ }
    }
}

// GET /api/plans/goal-status/:userId — active goal + its linked training plan.
// Connects My Plans to user goals without changing the plans list shape.
// Pre-032 databases (no source_plan_id) still return the goal with linkedPlan null.
async function getGoalStatus(userId) {
    let rows;
    try {
        [rows] = await db.execute(
            `SELECT id, goal_type, daily_kcal, protein_g, carbs_g, fat_g, target_weight_kg, source_plan_id
             FROM fitness_goals WHERE user_id = ? AND status = 'active' ORDER BY id DESC LIMIT 1`,
            [userId]
        );
    } catch (e) {
        if (e && (e.errno === 1054 || /Unknown column 'source_plan_id'/.test(e.message || ''))) {
            [rows] = await db.execute(
                `SELECT id, goal_type, daily_kcal, protein_g, carbs_g, fat_g, target_weight_kg
                 FROM fitness_goals WHERE user_id = ? AND status = 'active' ORDER BY id DESC LIMIT 1`,
                [userId]
            );
        } else {
            throw e;
        }
    }
    if (!rows || rows.length === 0) return { goal: null, linkedPlan: null };
    const g = rows[0];
    const goal = {
        id: g.id,
        goalType: g.goal_type,
        dailyKcal: g.daily_kcal != null ? Number(g.daily_kcal) : null,
        proteinG: g.protein_g != null ? Number(g.protein_g) : null,
        carbsG: g.carbs_g != null ? Number(g.carbs_g) : null,
        fatG: g.fat_g != null ? Number(g.fat_g) : null,
        targetWeightKg: g.target_weight_kg != null ? Number(g.target_weight_kg) : null,
        sourcePlanId: g.source_plan_id != null ? Number(g.source_plan_id) : null,
    };
    let linkedPlan = null;
    if (goal.sourcePlanId) {
        try {
            const [[plan]] = await db.execute('SELECT id, title FROM plans WHERE id = ? LIMIT 1', [goal.sourcePlanId]);
            if (plan) linkedPlan = { id: plan.id, title: plan.title };
        } catch { linkedPlan = null; }
    }
    // Section 3: extra goals + one generated plan per goal (fail-soft pre-050).
    goal.secondaryGoals = [];
    let goalPlans = [];
    try {
        const [[extra]] = await db.execute('SELECT secondary_goals, target_date, experience_level FROM fitness_goals WHERE id = ? LIMIT 1', [goal.id]);
        goal.secondaryGoals = parseSecondary(extra?.secondary_goals);
        goal.targetDate = extra?.target_date ? toIsoDate(extra.target_date) : null;
        goal.experienceLevel = extra?.experience_level || null;
        const [plans] = await db.execute(
            'SELECT id, title, goal_type, rationale FROM plans WHERE owner_user_id = ? AND goal_type IS NOT NULL ORDER BY id ASC',
            [userId]
        );
        const wanted = [goal.goalType, ...goal.secondaryGoals];
        goalPlans = wanted.map((gt) => {
            const p = plans.filter((x) => x.goal_type === gt).pop();
            return {
                goalType: gt,
                primary: gt === goal.goalType,
                plan: p ? { id: p.id, title: p.title, active: p.id === goal.sourcePlanId, rationale: safeJsonArray(p.rationale) } : null,
            };
        });
    } catch { /* pre-050 — goalPlans stays empty */ }
    return { goal, linkedPlan, goalPlans };
}

function safeJsonArray(v) {
    if (Array.isArray(v)) return v;
    try { const x = JSON.parse(v); return Array.isArray(x) ? x : []; } catch { return []; }
}

function toIsoDate(v) {
    if (v instanceof Date) {
        return `${v.getFullYear()}-${String(v.getMonth() + 1).padStart(2, '0')}-${String(v.getDate()).padStart(2, '0')}`;
    }
    return String(v).slice(0, 10);
}

module.exports = {
    STARTER_BY_TAG,
    starterForTag,
    humanizeGoal,
    tagForGoal,
    enroll,
    completeProgress,
    getProgress,
    getPlanContent,
    getDayRoutine,
    routineInput,
    getPlansForUser,
    createPersonalPlan,
    updatePersonalPlan,
    deletePersonalPlan,
    autoCreateFromGoal,
    generateForAllGoals,
    setActivePlan,
    recommenderInput,
    parseSecondary,
    getGoalStatus,
    adjustLinkedPlan,
};
