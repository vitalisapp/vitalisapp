const express = require('express');
const { makeLimiter } = require('../middleware/rateLimits');
const verifyUser = require('../middleware/verifyUser');
const controller = require('../controllers/reminder.controller');

const router = express.Router();
const testLimiter = makeLimiter({ windowMs: 60 * 60 * 1000, limit: 10, message: 'Too many test reminders. Try again later.' });

router.get('/prefs', verifyUser, controller.getPrefs);
router.put('/prefs', verifyUser, controller.putPrefs);
router.post('/test', verifyUser, testLimiter, controller.postTest);

module.exports = router;
