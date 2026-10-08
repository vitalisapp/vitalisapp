const express=require('express');
const router=express.Router();
const verifyUser=require('../middleware/verifyUser');
const { requireOwner }=require('../utils/owner');
const controller=require('../controllers/analytics.controller');

router.get('/summary/:userId', verifyUser, requireOwner('userId'), controller.getsummaryUserId);
router.get('/zones/:userId', verifyUser, requireOwner('userId'), controller.getzonesUserId);
router.get('/vo2/:userId', verifyUser, requireOwner('userId'), controller.getvo2UserId); // legacy alias, see recovery
router.get('/recovery/:userId', verifyUser, requireOwner('userId'), controller.getrecoveryUserId);
router.get('/progress/:userId', verifyUser, requireOwner('userId'), controller.getprogressUserId);

module.exports=router;
