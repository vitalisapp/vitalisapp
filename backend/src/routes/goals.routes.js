const express = require('express');
const router = express.Router();
const verifyUser = require('../middleware/verifyUser');
const { writeLimiter } = require('../middleware/rateLimits');
const { requireOwner } = require('../utils/owner');
const controller = require('../controllers/goals.controller');

// Spam guard for writes: one shared per-user bucket for this router.
const write = writeLimiter();

router.post('/:userId', verifyUser, write, requireOwner('userId'), controller.postUserId);
router.patch('/active/:userId', verifyUser, write, requireOwner('userId'), controller.patchActiveUserId);
router.get('/active/:userId', verifyUser, requireOwner('userId'), controller.getactiveUserId);
router.post('/active/:userId/recalibrate', verifyUser, write, requireOwner('userId'), controller.postActiveRecalibrate);
router.patch('/:userId/change', verifyUser, write, requireOwner('userId'), controller.patchchangeUserId);

module.exports = router;
