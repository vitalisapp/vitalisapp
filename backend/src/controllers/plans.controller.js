
const db = require('../config/db');
const { z } = require('zod');

const enrollSchema = z.object({
  planId: z.coerce.number().int().positive('Valid planId is required'),
});

const progressCompleteSchema = z.object({
  planId: z.coerce.number().int().positive('Valid planId is required'),
  dayNumber: z.coerce.number().int().min(1).max(365, 'dayNumber out of range'),
});

const TAG_OPTIONS = ['Strength', 'Cardio', 'Fat Loss', 'Mobility', 'Flexibility', 'Performance', 'General'];
const INTENSITY_OPTIONS = ['Low', 'Moderate', 'High'];
const FOCUS_OPTIONS = ['Strength', 'Cardio', 'Fat Loss', 'Mobility', 'Recovery', 'General'];

const createPersonalSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(100),
  tag: z.enum(TAG_OPTIONS).optional().default('General'),
  intensity: z.enum(INTENSITY_OPTIONS).optional().default('Moderate'),
  targetFocus: z.enum(FOCUS_OPTIONS).optional().default('General'),
  durationDays: z.coerce.number().int().min(1).max(84).optional().default(7),
  description: z.string().trim().max(2000).optional().default(''),
});

const updatePersonalSchema = z.object({
  title: z.string().trim().min(1).max(100).optional(),
  tag: z.enum(TAG_OPTIONS).optional(),
  intensity: z.enum(INTENSITY_OPTIONS).optional(),
  targetFocus: z.enum(FOCUS_OPTIONS).optional(),
  durationDays: z.coerce.number().int().min(1).max(84).optional(),
  description: z.string().trim().max(2000).optional(),
}).refine((v) => Object.keys(v).length > 0, { message: 'Nothing to update' });

async function postenroll(req,res,next){
        const parsed = enrollSchema.safeParse(req.body || {});
        if (!parsed.success) {
          return res.status(400).json({ error: 'Valid planId is required', details: parsed.error.flatten().fieldErrors });
        }
        const { planId } = parsed.data;
        // Identity comes from JWT — never trust a body userId
        const userId = req.user.id;
        try {
            // 404 (not 500 FK) when plan doesn't exist
            const [[plan]] = await db.execute('SELECT id FROM plans WHERE id = ? LIMIT 1', [planId]);
            if (!plan) return res.status(404).json({ error: 'Plan not found' });
            await db.execute(
                `INSERT INTO user_plans (user_id, plan_id, enrolled_at) VALUES (?, ?, NOW())`,
                [userId, planId]
            );
            res.json({ success: true, message: "Blueprint added to your library" });
        } catch (err) {
            if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: "You already own this blueprint" });
            console.error("Enrollment Error:", err);
            next(err);
        }
}

async function postprogressComplete(req,res,next){
        const parsed = progressCompleteSchema.safeParse(req.body || {});
        if (!parsed.success) {
          return res.status(400).json({ error: 'Invalid progress payload', details: parsed.error.flatten().fieldErrors });
        }
        const { planId, dayNumber } = parsed.data;
        const userId = req.user.id;
        try {
            // 404 (not 500 FK) when plan doesn't exist; 409 when not enrolled.
            const [[plan]] = await db.execute('SELECT id FROM plans WHERE id = ? LIMIT 1', [planId]);
            if (!plan) return res.status(404).json({ error: 'Plan not found' });
            const [[enrolled]] = await db.execute(
                'SELECT id FROM user_plans WHERE user_id = ? AND plan_id = ? LIMIT 1',
                [userId, planId]
            );
            if (!enrolled) return res.status(409).json({ error: 'Enroll in this plan first' });
            await db.execute(
                `INSERT INTO user_plan_progress (user_id, plan_id, day_number, is_completed, completed_at)
                 VALUES (?, ?, ?, 1, NOW())
                 ON DUPLICATE KEY UPDATE is_completed = 1, completed_at = NOW()`,
                [userId, planId, dayNumber]
            );
            res.json({ success: true });
        } catch (err) {
            console.error("Complete Day Error:", err);
            next(err);
        }
}

async function getprogressUserIdPlanId(req,res,next){
  try{
        const { userId, planId } = req.params;
        try {
            const [rows] = await db.execute(
                'SELECT day_number, is_completed FROM user_plan_progress WHERE user_id = ? AND plan_id = ?',
                [userId, planId]
            );
            res.json(rows);
        } catch (err) {
            console.error("Progress Fetch Error:", err);
            next(err);
        }
  }catch(e){ next(e); }
}

async function getcontentPlanId(req,res,next){
  try{
        const { planId } = req.params;
        try {
            const [[plan]] = await db.execute('SELECT id FROM plans WHERE id = ? LIMIT 1', [planId]);
            if (!plan) return res.status(404).json({ error: 'Plan not found' });
            const [days] = await db.execute(
                `SELECT id, day_number, title, activity_type, description, duration_mins
                 FROM plan_contents WHERE plan_id = ? ORDER BY day_number ASC`,
                [planId]
            );
    
            if (days.length === 0) {
                return res.status(404).json({ error: 'Plan not found or has no content' });
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
    
            const result = days.map(day => ({
                ...day,
                exercises: exercisesByDay[day.id] || [],
            }));
    
            res.json(result);
        } catch (err) {
            console.error("Plan Content Error:", err);
            next(err);
        }
  }catch(e){ next(e); }
}

async function getUserId(req,res,next){
  try{
        const { userId } = req.params;
        try {
            const [rows] = await db.execute(
                `SELECT p.*, IF(up.user_id IS NULL, 0, 1) as is_enrolled
                 FROM plans p
                 LEFT JOIN user_plans up ON p.id = up.plan_id AND up.user_id = ?
                 ORDER BY p.id ASC`,
                [userId]
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
            const out = rows.map((p) => {
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
                };
            });
            res.json(out);
        } catch (err) {
            console.error("Marketplace Fetch Error:", err);
            next(err);
        }
  }catch(e){ next(e); }
}

function skeletonDays(durationDays) {
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
            duration_mins: recovery ? 15 : 30,
        });
    }
    return days;
}

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

async function insertPersonalPlan(conn, userId, { title, tag, intensity, targetFocus, durationDays, description, imageSeed }) {
    const [[dup]] = await conn.execute(
        'SELECT id FROM plans WHERE owner_user_id = ? AND title = ? LIMIT 1',
        [userId, title]
    );
    if (dup) {
        const err = new Error('You already have a plan with this title');
        err.code = 'PLAN_TITLE_DUP';
        throw err;
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
            const err = new Error('Personal plans need migration 032 — run npm run db:migrate');
            err.code = 'NEEDS_MIGRATION_032';
            throw err;
        }
        if (e && e.code === 'ER_DUP_ENTRY') {
            const err = new Error('Plan title already taken — try another title');
            err.code = 'PLAN_TITLE_DUP';
            throw err;
        }
        throw e;
    }
    for (const d of skeletonDays(durationDays)) {
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

function sendPlanError(err, req, res, next) {
    if (err && err.code === 'PLAN_TITLE_DUP') return res.status(409).json({ error: err.message });
    if (err && err.code === 'NEEDS_MIGRATION_032') return res.status(503).json({ error: err.message, code: 'NEEDS_MIGRATION_032' });
    return next(err);
}

async function postCreate(req, res, next) {
    const userId = req.user.id;
    const { title, tag, intensity, targetFocus, durationDays, description } = req.body || {};
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();
        const planId = await insertPersonalPlan(conn, userId, {
            title, tag, intensity, targetFocus, durationDays, description,
        });
        await conn.query('COMMIT');
        res.status(201).json({ success: true, planId });
    } catch (err) {
        try { await conn.query('ROLLBACK'); } catch { /* noop */ }
        sendPlanError(err, req, res, next);
    } finally {
        try { conn.release(); } catch { /* noop */ }
    }
}

async function patchPlanId(req, res, next) {
    const userId = req.user.id;
    const planId = Number(req.params.planId);
    if (!Number.isInteger(planId) || planId <= 0) return res.status(400).json({ error: 'Invalid plan id' });
    try {
        const [[plan]] = await db.execute('SELECT id, owner_user_id FROM plans WHERE id = ? LIMIT 1', [planId]);
        if (!plan) return res.status(404).json({ error: 'Plan not found' });
        if (plan.owner_user_id == null || String(plan.owner_user_id) !== String(userId)) {
            return res.status(403).json({ error: 'Only the owner can edit this plan' });
        }
        const patch = {};
        const body = req.body || {};
        if (body.title !== undefined) patch.title = body.title;
        if (body.tag !== undefined) patch.tag = body.tag;
        if (body.intensity !== undefined) patch.intensity = body.intensity;
        if (body.targetFocus !== undefined) patch.target_focus = body.targetFocus;
        if (body.description !== undefined) patch.description = body.description;
        if (body.durationDays !== undefined) patch.duration_days = body.durationDays;
        if (body.title !== undefined) patch.name = body.title;
        const keys = Object.keys(patch);
        if (keys.length === 0) return res.status(400).json({ error: 'Nothing to update' });
        try {
            await db.execute(
                `UPDATE plans SET ${keys.map((k) => `\`${k}\` = ?`).join(', ')} WHERE id = ?`,
                [...keys.map((k) => patch[k]), planId]
            );
        } catch (e) {
            if (e && e.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Plan title already taken — try another title' });
            throw e;
        }
        res.json({ success: true });
    } catch (err) {
        next(err);
    }
}

async function deletePlanId(req, res, next) {
    const userId = req.user.id;
    const planId = Number(req.params.planId);
    if (!Number.isInteger(planId) || planId <= 0) return res.status(400).json({ error: 'Invalid plan id' });
    try {
        const [[plan]] = await db.execute('SELECT id, owner_user_id FROM plans WHERE id = ? LIMIT 1', [planId]);
        if (!plan) return res.status(404).json({ error: 'Plan not found' });
        if (plan.owner_user_id == null || String(plan.owner_user_id) !== String(userId)) {
            return res.status(403).json({ error: 'Only the owner can delete this plan' });
        }
        await db.execute('DELETE FROM plans WHERE id = ?', [planId]);
        res.json({ success: true });
    } catch (err) {
        next(err);
    }
}

async function postAutoFromGoal(req, res, next) {
    const userId = req.user.id;
    try {
        const [[goal]] = await db.execute(
            `SELECT id, goal_type, daily_kcal, protein_g, carbs_g, fat_g, activity_level
             FROM fitness_goals WHERE user_id = ? AND status = 'active' ORDER BY id DESC LIMIT 1`,
            [userId]
        );
        if (!goal) return res.status(404).json({ error: 'No active goal — complete onboarding first', code: 'NO_ACTIVE_GOAL' });
        const label = humanizeGoal(goal.goal_type);
        const title = `My ${label} Plan`;
        const kcal = goal.daily_kcal != null ? `${Number(goal.daily_kcal).toLocaleString()} kcal/day` : 'balanced nutrition';
        const macros = (goal.protein_g != null && goal.carbs_g != null && goal.fat_g != null)
            ? ` (P${goal.protein_g}g C${goal.carbs_g}g F${goal.fat_g}g)` : '';
        const tag = tagForGoal(goal.goal_type);
        const conn = await db.getConnection();
        try {
            await conn.beginTransaction();
            const [[existing]] = await conn.execute(
                'SELECT id FROM plans WHERE owner_user_id = ? AND title = ? LIMIT 1',
                [userId, title]
            );
            let planId;
            let created = true;
            if (existing) {
                planId = existing.id;
                created = false;
                try {
                    await conn.execute(
                        'UPDATE plans SET tag = ?, target_focus = ?, duration_days = 7 WHERE id = ?',
                        [tag, tag === 'General' ? 'General' : tag, planId]
                    );
                } catch { /* pre-032 or no-op — still enroll below */ }
            } else {
                planId = await insertPersonalPlan(conn, userId, {
                    title,
                    tag,
                    intensity: 'Moderate',
                    targetFocus: tag,
                    durationDays: 7,
                    description: `Auto-generated from your ${label} goal — ${kcal}${macros}. 7-day starter: alternate training + recovery; edit anytime.`,
                    imageSeed: 'personal-goal',
                });
            }
            await conn.execute(
                'INSERT IGNORE INTO user_plans (user_id, plan_id, enrolled_at) VALUES (?, ?, NOW())',
                [userId, planId]
            );
            // Link back to goal when 032 has run; ignore when column missing.
            try {
                await conn.execute('UPDATE fitness_goals SET source_plan_id = ? WHERE id = ?', [planId, goal.id]);
            } catch { /* pre-032 — non-fatal */ }
            await conn.query('COMMIT');
            res.status(created ? 201 : 200).json({ success: true, planId, created });
        } catch (err) {
            try { await conn.query('ROLLBACK'); } catch { /* noop */ }
            sendPlanError(err, req, res, next);
        } finally {
            try { conn.release(); } catch { /* noop */ }
        }
    } catch (err) {
        next(err);
    }
}

// GET /api/plans/goal-status/:userId — active goal + its linked training plan.
// Connects My Plans to user goals without changing the plans list shape.
// Pre-032 databases (no source_plan_id) still return the goal with linkedPlan null.
async function getGoalStatusUserId(req, res, next) {
    try {
        const { userId } = req.params;
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
        if (!rows || rows.length === 0) return res.json({ goal: null, linkedPlan: null });
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
        res.json({ goal, linkedPlan });
    } catch (e) { next(e); }
}

module.exports = { postenroll, postprogressComplete, getprogressUserIdPlanId, getcontentPlanId, getUserId, getGoalStatusUserId, postCreate, patchPlanId, deletePlanId, postAutoFromGoal, humanizeGoal, tagForGoal, starterForTag, enrollSchema, progressCompleteSchema, createPersonalSchema, updatePersonalSchema };
