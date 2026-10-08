const express = require('express');
const { settingsLimiter } = require('../middleware/rateLimits');
const router = express.Router();
const verifyUser = require('../middleware/verifyUser');
const { validate } = require('../middleware/validate');
const c = require('../controllers/settings.controller');

router.get('/', verifyUser, c.get);
router.put('/', verifyUser, settingsLimiter(), validate(c.putSettingsSchema), c.put);

module.exports = router;
