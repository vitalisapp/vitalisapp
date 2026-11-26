const express = require('express');
const router = express.Router();
const verifyUser = require('../middleware/verifyUser');
const { writeLimiter } = require('../middleware/rateLimits');
const controller = require('../controllers/progression.controller');

const write = writeLimiter();

router.get('/', verifyUser, controller.get);
router.post('/seen', verifyUser, write, controller.postSeen);
router.post('/challenges/:key/complete', verifyUser, write, controller.postCompleteChallenge);

module.exports = router;
