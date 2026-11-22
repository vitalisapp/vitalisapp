const express = require('express');
const router = express.Router();
const verifyUser = require('../middleware/verifyUser');
const { writeLimiter } = require('../middleware/rateLimits');
const { requireOwner } = require('../utils/owner');
const controller = require('../controllers/activity.controller');

// Spam guard for writes: one shared per-user bucket for this router.
const write = writeLimiter();

router.post('/save', verifyUser, write, controller.save);
router.get('/stats/:userId', verifyUser, requireOwner('userId'), controller.stats);
router.get('/detail/:id', verifyUser, controller.detail);
router.get('/:userId', verifyUser, requireOwner('userId'), controller.list);
router.post('/:id/kudos', verifyUser, write, controller.toggleKudos);
router.delete('/:id', verifyUser, write, controller.remove);

module.exports = router;
