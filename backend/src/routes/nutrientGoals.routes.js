const express=require('express');
const router=express.Router();
const verifyUser=require('../middleware/verifyUser');
const { writeLimiter } = require('../middleware/rateLimits');
const { requireOwner }=require('../utils/owner');
const c=require('../controllers/nutrientGoals.controller');
// Spam guard for writes: one shared per-user bucket for this router.
const write = writeLimiter();

router.get('/:userId', verifyUser, requireOwner('userId'), c.getUserId);
router.post('/:userId', verifyUser, write, requireOwner('userId'), c.postUserId);
router.delete('/:userId/:nutrient', verifyUser, write, requireOwner('userId'), c.deleteUserIdNutrient);
module.exports=router;
