const express = require('express');
const router = express.Router();
const verifyUser = require('../middleware/verifyUser');
const { requireOwner } = require('../utils/owner');
const controller = require('../controllers/activity.controller');

router.post('/save', verifyUser, controller.save);
router.get('/stats/:userId', verifyUser, requireOwner('userId'), controller.stats);
router.get('/detail/:id', verifyUser, controller.detail);
router.get('/:userId', verifyUser, requireOwner('userId'), controller.list);
router.post('/:id/kudos', verifyUser, controller.toggleKudos);
router.delete('/:id', verifyUser, controller.remove);

module.exports = router;
