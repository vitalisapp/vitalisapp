const express=require('express');
const router=express.Router();
const verifyUser=require('../middleware/verifyUser');
const { requireOwner }=require('../utils/owner');
const c=require('../controllers/nutrientGoals.controller');
router.get('/:userId', verifyUser, requireOwner('userId'), c.getUserId);
router.post('/:userId', verifyUser, requireOwner('userId'), c.postUserId);
router.delete('/:userId/:nutrient', verifyUser, requireOwner('userId'), c.deleteUserIdNutrient);
module.exports=router;
