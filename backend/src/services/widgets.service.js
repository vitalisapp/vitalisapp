// Windows Widgets Board summary (PWA widgets, Phase 0: Today's Activity).
// Read-only aggregate over services that already back the dashboard, so the
// widget shows exactly the numbers the Dashboard shows — one request per
// refresh instead of one per data source.
const dashboardService = require('./dashboard.service');
const settingsService = require('./settings.service');

const DEFAULT_STEP_GOAL = settingsService.DEFAULTS?.step_goal || 8000;

const toInt = (value) => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.round(n) : 0;
};

/** Pure shaping step (unit-tested): dashboard + settings rows -> widget payload. */
function shapeWidgetSummary({ dashboard, settingsRows, today }) {
  const stats = dashboard?.stats || {};
  const streak = dashboard?.streak || null;
  const settings = Array.isArray(settingsRows) ? settingsRows[0] : null;
  const stepGoal = toInt(settings?.step_goal) || DEFAULT_STEP_GOAL;

  return {
    today: today || null,
    stats: {
      steps: toInt(stats.steps),
      calories: toInt(stats.calories_burned),
      minutes: toInt(stats.workout_duration_mins),
    },
    stepGoal,
    streak: streak ? { current: toInt(streak.current), activeToday: Boolean(streak.activeToday) } : null,
  };
}

async function getWidgetSummary(userId, clientToday) {
  const [dashboard, settingsRows] = await Promise.all([
    dashboardService.getDashboard(userId, clientToday),
    settingsService.getSettings(userId).catch(() => []),
  ]);
  const today = /^\d{4}-\d{2}-\d{2}$/.test(String(clientToday || '')) ? clientToday : null;
  return shapeWidgetSummary({ dashboard, settingsRows, today });
}

module.exports = { getWidgetSummary, shapeWidgetSummary };
