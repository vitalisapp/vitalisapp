const express = require('express');
const router = express.Router();
const verifyUser = require('../middleware/verifyUser');
const { requireMember } = require('../middleware/verifyUser');
const { meLimiter } = require('../middleware/rateLimits');
const controller = require('../controllers/widgets.controller');

// Windows Widgets Board (installed PWA). Cookie session only, read-only.
router.get('/summary', verifyUser, requireMember, meLimiter(), controller.getSummary);

module.exports = router;
