// AI controller barrel — thin re-export over src/services/ai* modules.
//
// Split from a 583-line single file (Batch 12b) with zero behavior change:
// every handler name and signature is preserved so src/routes/ai.routes.js
// keeps working untouched. New code should import the service directly.
const { postanalyzePose } = require('../services/aiPose');
const { postaiChat } = require('../services/aiChat');
const { postaiClinicalAnalysis, getaiHistoryUserId, getlogsLatestUserId } = require('../services/aiClinical');
const { postaiCoach } = require('../services/aiCoach');
const { postaiRunAnalysis } = require('../services/aiRunAnalysis');

module.exports = { postanalyzePose, postaiChat, postaiClinicalAnalysis, postaiCoach, getaiHistoryUserId, getlogsLatestUserId, postaiRunAnalysis };
