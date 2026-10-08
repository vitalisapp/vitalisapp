const express=require('express');
const router=express.Router();
const verifyUser=require('../middleware/verifyUser');
const { requireOwner }=require('../utils/owner');
const controller=require('../controllers/dashboard.controller');

router.get('/dashboard/:userId', verifyUser, requireOwner('userId'), controller.getdashboardUserId);
router.get('/search', verifyUser, controller.getsearch);

module.exports=router;
