const express=require('express');
const router=express.Router();
const verifyUser=require('../middleware/verifyUser');
const { requireOwner }=require('../utils/owner');
const controller=require('../controllers/bmi.controller');

router.post('/:userId', verifyUser, requireOwner('userId'), controller.postUserId);
// Yearly BMI monitoring (one row per calendar year + re-check reminder).
router.get('/:userId/yearly', verifyUser, requireOwner('userId'), controller.getYearly);
router.get('/:userId', verifyUser, requireOwner('userId'), controller.getUserId);

module.exports=router;
