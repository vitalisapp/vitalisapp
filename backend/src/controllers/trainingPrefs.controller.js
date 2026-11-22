// Training preferences — thin controller. Logic in services/trainingPrefs.service.js.
const svc = require('../services/trainingPrefs.service');

const { EQUIPMENT_OPTIONS, LOCATION_OPTIONS, DAY_NAMES } = svc;
const { EXCLUSION_CATEGORIES, EXPERIENCE_LEVELS, exerciseGuide } = require('../utils/workoutRecommender');

async function get(req, res, next) {
  try {
    const prefs = await svc.get(req.user.id);
    res.json({
      preferences: prefs,
      options: {
        equipment: EQUIPMENT_OPTIONS,
        locations: LOCATION_OPTIONS,
        days: DAY_NAMES,
        exclusions: EXCLUSION_CATEGORIES,
        experienceLevels: EXPERIENCE_LEVELS,
      },
    });
  } catch (e) {
    next(e);
  }
}

async function put(req, res, next) {
  try {
    const preferences = await svc.save(req.user.id, req.body || {});
    res.json({ preferences });
  } catch (e) {
    next(e);
  }
}

// POST /api/training-preferences/exclude-exercise — { name, excluded: boolean }
async function postExcludeExercise(req, res, next) {
  try {
    const { name, excluded = true } = req.body || {};
    const preferences = await svc.setExerciseExcluded(req.user.id, name, Boolean(excluded));
    res.json({ preferences });
  } catch (e) {
    next(e);
  }
}

// GET /api/training-preferences/exercise-guide — instructions for the
// recommender exercise pool (steps, form cues, common mistakes).
function getExerciseGuide(_req, res) {
  res.set('Cache-Control', 'private, max-age=3600');
  res.json({ exercises: exerciseGuide() });
}

module.exports = { get, put, postExcludeExercise, getExerciseGuide };
