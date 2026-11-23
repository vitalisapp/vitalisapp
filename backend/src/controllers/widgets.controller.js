const widgetsService = require('../services/widgets.service');

// GET /api/widgets/summary?today=YYYY-MM-DD — the signed-in user's own data only
// (no :userId param, so there is nothing to spoof). Never cached: the Windows
// widget service worker must not show one account's numbers to another.
async function getSummary(req, res, next) {
  try {
    const payload = await widgetsService.getWidgetSummary(req.user.id, req.query?.today);
    res.set('Cache-Control', 'no-store');
    res.json(payload);
  } catch (e) {
    next(e);
  }
}

module.exports = { getSummary };
