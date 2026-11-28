// Plans controller — thin. Zod validation + HTTP response shape only;
// all business logic and DB access live in services/plans.service.js.
const { z } = require('zod');
const plansService = require('../services/plans.service');
const { AppError } = require('../utils/errors');

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

// Domain errors thrown by the service carry their own HTTP status + message.
// Only these two codes are surfaced to clients (client-actionable) — every
// other error keeps the original { error } shape or falls through to next().
function sendPlanError(err, res, next) {
    if (err instanceof AppError) {
        const body = { error: err.message };
        if (err.code === 'NO_ACTIVE_GOAL' || err.code === 'NEEDS_MIGRATION_032' || err.code === 'LEVEL_LOCKED') body.code = err.code;
        if (err.code === 'LEVEL_LOCKED' && err.details) body.details = err.details;
        return res.status(err.statusCode).json(body);
    }
    return next(err);
}

async function postenroll(req, res, next) {
    const parsed = enrollSchema.safeParse(req.body || {});
    if (!parsed.success) {
        return res.status(400).json({ error: 'Valid planId is required', details: parsed.error.flatten().fieldErrors });
    }
    const { planId } = parsed.data;
    // Identity comes from JWT — never trust a body userId
    const userId = req.user.id;
    try {
        await plansService.enroll(userId, planId);
        res.json({ success: true, message: "Blueprint added to your library" });
    } catch (err) {
        if (err instanceof AppError) return sendPlanError(err, res, next);
        console.error("Enrollment Error:", err);
        next(err);
    }
}

async function postprogressComplete(req, res, next) {
    const parsed = progressCompleteSchema.safeParse(req.body || {});
    if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid progress payload', details: parsed.error.flatten().fieldErrors });
    }
    const { planId, dayNumber } = parsed.data;
    const userId = req.user.id;
    try {
        await plansService.completeProgress(userId, planId, dayNumber);
        res.json({ success: true });
    } catch (err) {
        if (err instanceof AppError) return sendPlanError(err, res, next);
        console.error("Complete Day Error:", err);
        next(err);
    }
}

async function getprogressUserIdPlanId(req, res, next) {
    try {
        const { userId, planId } = req.params;
        const rows = await plansService.getProgress(userId, planId);
        res.json(rows);
    } catch (err) {
        console.error("Progress Fetch Error:", err);
        next(err);
    }
}

async function getcontentPlanId(req, res, next) {
    try {
        const { planId } = req.params;
        const result = await plansService.getPlanContent(req.user.id, planId);
        res.json(result);
    } catch (err) {
        if (err instanceof AppError) return sendPlanError(err, res, next);
        console.error("Plan Content Error:", err);
        next(err);
    }
}

// GET /api/plans/:planId/days/:dayNumber/routine — warm-up + cool-down.
const routineParams = z.object({
    planId: z.coerce.number().int().positive(),
    dayNumber: z.coerce.number().int().min(1).max(366),
});
async function getDayRoutine(req, res, next) {
    const parsed = routineParams.safeParse(req.params || {});
    if (!parsed.success) return res.status(400).json({ error: 'Valid planId and dayNumber are required' });
    try {
        const routine = await plansService.getDayRoutine(req.user.id, parsed.data.planId, parsed.data.dayNumber);
        res.set('Cache-Control', 'private, no-store');
        res.json(routine);
    } catch (err) {
        if (err instanceof AppError) return sendPlanError(err, res, next);
        next(err);
    }
}

async function getUserId(req, res, next) {
    try {
        const { userId } = req.params;
        const out = await plansService.getPlansForUser(userId);
        res.json(out);
    } catch (err) {
        console.error("Marketplace Fetch Error:", err);
        next(err);
    }
}

async function postCreate(req, res, next) {
    const userId = req.user.id;
    const { title, tag, intensity, targetFocus, durationDays, description } = req.body || {};
    try {
        const { planId } = await plansService.createPersonalPlan(userId, {
            title, tag, intensity, targetFocus, durationDays, description,
        });
        res.status(201).json({ success: true, planId });
    } catch (err) {
        sendPlanError(err, res, next);
    }
}

async function patchPlanId(req, res, next) {
    const userId = req.user.id;
    const planId = Number(req.params.planId);
    if (!Number.isInteger(planId) || planId <= 0) return res.status(400).json({ error: 'Invalid plan id' });
    try {
        await plansService.updatePersonalPlan(userId, planId, req.body || {});
        res.json({ success: true });
    } catch (err) {
        sendPlanError(err, res, next);
    }
}

async function deletePlanId(req, res, next) {
    const userId = req.user.id;
    const planId = Number(req.params.planId);
    if (!Number.isInteger(planId) || planId <= 0) return res.status(400).json({ error: 'Invalid plan id' });
    try {
        await plansService.deletePersonalPlan(userId, planId);
        res.json({ success: true });
    } catch (err) {
        sendPlanError(err, res, next);
    }
}

async function postAutoFromGoal(req, res, next) {
    const userId = req.user.id;
    try {
        // Body (all optional): { goalType, regenerate, all, makeActive }.
        // all=true builds one plan per goal (primary + extras); primary active.
        const body = req.body || {};
        const regenerate = body.regenerate === true;
        if (body.all === true) {
            const out = await plansService.generateForAllGoals(userId, { regenerate });
            return res.status(out.created ? 201 : 200).json({ success: true, ...out });
        }
        const goalType = typeof body.goalType === 'string' ? body.goalType : undefined;
        const makeActive = typeof body.makeActive === 'boolean' ? body.makeActive : undefined;
        const out = await plansService.autoCreateFromGoal(userId, { goalType, regenerate, makeActive });
        res.status(out.created ? 201 : 200).json({ success: true, ...out });
    } catch (err) {
        sendPlanError(err, res, next);
    }
}

// POST /api/plans/:planId/activate — make this plan the active plan for the goal.
async function postActivate(req, res, next) {
    try {
        const planId = Number(req.params.planId);
        if (!Number.isInteger(planId) || planId <= 0) return res.status(400).json({ error: 'Invalid plan id', code: 'INVALID_PLAN_ID' });
        const out = await plansService.setActivePlan(req.user.id, planId);
        res.json({ success: true, ...out });
    } catch (err) {
        sendPlanError(err, res, next);
    }
}

async function getGoalStatusUserId(req, res, next) {
    try {
        const { userId } = req.params;
        const result = await plansService.getGoalStatus(userId);
        res.json(result);
    } catch (e) { next(e); }
}

// POST /api/plans/adjust-from-goal — one-click adaptive adjustment from the
// insights card. Body: { mode: 'shorter' | 'gentle' }. User-initiated only —
// the system never adjusts intensity on its own.
async function postAdjust(req, res, next) {
    try {
        const mode = req.body?.mode;
        const result = await plansService.adjustLinkedPlan(req.user.id, mode);
        res.json({ success: true, ...result });
    } catch (err) {
        sendPlanError(err, res, next);
    }
}

module.exports = {
    postenroll,
    postprogressComplete,
    getprogressUserIdPlanId,
    getcontentPlanId,
    getDayRoutine,
    getUserId,
    getGoalStatusUserId,
    postCreate,
    patchPlanId,
    deletePlanId,
    postAutoFromGoal,
    postActivate,
    postAdjust,
    humanizeGoal: plansService.humanizeGoal,
    tagForGoal: plansService.tagForGoal,
    starterForTag: plansService.starterForTag,
    enrollSchema,
    progressCompleteSchema,
    createPersonalSchema,
    updatePersonalSchema,
};
