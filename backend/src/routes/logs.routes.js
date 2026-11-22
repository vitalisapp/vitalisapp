const express=require('express');
const router=express.Router();
const verifyUser=require('../middleware/verifyUser');
const { writeLimiter } = require('../middleware/rateLimits');
const { requireOwner }=require('../utils/owner');
const controller=require('../controllers/logs.controller');

// Spam guard for writes: one shared per-user bucket for this router.
const write = writeLimiter();

router.post('/:userId', verifyUser, write, requireOwner('userId'), controller.postUserId);
router.get('/history/:userId', verifyUser, requireOwner('userId'), controller.gethistoryUserId);

module.exports=router;
