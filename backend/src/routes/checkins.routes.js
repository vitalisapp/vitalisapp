const express = require('express');
const router = express.Router();
const verifyUser = require('../middleware/verifyUser');
const { requireOwner } = require('../utils/owner');
const controller = require('../controllers/checkins.controller');

router.post('/:userId', verifyUser, requireOwner('userId'), controller.postUserId);
router.get('/:userId/today', verifyUser, requireOwner('userId'), controller.gettodayUserId);
router.get('/:userId/history', verifyUser, requireOwner('userId'), controller.gethistoryUserId);

module.exports = router;
