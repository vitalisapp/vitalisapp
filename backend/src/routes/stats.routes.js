const express=require('express');
const router=express.Router();
const verifyUser=require('../middleware/verifyUser');
const { requireOwner }=require('../utils/owner');
const controller=require('../controllers/stats.controller');

router.get('/daily/:userId', verifyUser, requireOwner('userId'), controller.getdailyUserId);

module.exports=router;
