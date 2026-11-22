const express=require('express');
const router=express.Router();
const verifyUser=require('../middleware/verifyUser');
const { writeLimiter } = require('../middleware/rateLimits');
const { requireOwner }=require('../utils/owner');
const controller=require('../controllers/profile.controller');

// Spam guard for writes: one shared per-user bucket for this router.
const write = writeLimiter();

router.put('/update', verifyUser, write, controller.putupdate);
router.get('/:userId', verifyUser, requireOwner('userId'), controller.getUserId);

module.exports=router;
