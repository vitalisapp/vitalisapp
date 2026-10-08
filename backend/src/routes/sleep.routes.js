const express=require('express');
const router=express.Router();
const verifyUser=require('../middleware/verifyUser');
const { requireOwner }=require('../utils/owner');
const controller=require('../controllers/sleep.controller');

router.post('/:userId', verifyUser, requireOwner('userId'), controller.postUserId);
router.get('/:userId/today', verifyUser, requireOwner('userId'), controller.getUserIdToday);
router.get('/:userId', verifyUser, requireOwner('userId'), controller.getUserId);
router.get('/:userId/analysis', verifyUser, requireOwner('userId'), controller.getUserIdAnalysis);
router.get('/:userId/scatter', verifyUser, requireOwner('userId'), controller.getUserIdScatter);

module.exports=router;
