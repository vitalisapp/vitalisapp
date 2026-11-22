// AI personal coach (Section 4) — thin controller. Logic: services/coachPlan.service.js.
const service = require('../services/coachPlan.service');

// GET /api/coach/week — this week's schedule, missed-workout proposal,
// nutrition tips and the coach message for the dashboard card.
async function getWeek(req, res, next) {
  try {
    res.set('Cache-Control', 'no-store');
    res.json(await service.getWeek(req.user.id));
  } catch (e) {
    next(e);
  }
}

// POST /api/coach/week/adjust — { choice: 'reschedule' | 'lighter' | 'skip' }
async function postAdjust(req, res, next) {
  try {
    const choice = typeof req.body?.choice === 'string' ? req.body.choice.trim().toLowerCase() : '';
    res.json(await service.applyChoice(req.user.id, choice));
  } catch (e) {
    next(e);
  }
}

// POST /api/coach/week/reset — undo this week's adjustment.
async function postReset(req, res, next) {
  try {
    res.json(await service.resetWeek(req.user.id));
  } catch (e) {
    next(e);
  }
}

module.exports = { getWeek, postAdjust, postReset };
