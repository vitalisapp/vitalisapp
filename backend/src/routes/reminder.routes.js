const express = require('express');
const { makeLimiter, writeLimiter } = require('../middleware/rateLimits');
const verifyUser = require('../middleware/verifyUser');
const controller = require('../controllers/reminder.controller');

const router = express.Router();
const testLimiter = makeLimiter({ windowMs: 60 * 60 * 1000, limit: 10, message: 'Too many test reminders. Try again later.' });

// Spam guard for writes: one shared per-user bucket for this router.
const write = writeLimiter();

router.get('/prefs', verifyUser, controller.getPrefs);
router.put('/prefs', verifyUser, write, controller.putPrefs);
router.post('/test', verifyUser, testLimiter, controller.postTest);

module.exports = router;
