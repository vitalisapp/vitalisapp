const express=require('express');
const router=express.Router();
const verifyUser=require('../middleware/verifyUser');
const { writeLimiter } = require('../middleware/rateLimits');
const { requireOwner }=require('../utils/owner');
const controller=require('../controllers/bmi.controller');

// Spam guard for writes: one shared per-user bucket for this router.
const write = writeLimiter();

router.post('/:userId', verifyUser, write, requireOwner('userId'), controller.postUserId);
// Yearly BMI monitoring (one row per calendar year + re-check reminder).
router.get('/:userId/yearly', verifyUser, requireOwner('userId'), controller.getYearly);
router.get('/:userId', verifyUser, requireOwner('userId'), controller.getUserId);

module.exports=router;
