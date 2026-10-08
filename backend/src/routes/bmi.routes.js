const express=require('express');
const router=express.Router();
const verifyUser=require('../middleware/verifyUser');
const { requireOwner }=require('../utils/owner');
const controller=require('../controllers/bmi.controller');

router.post('/:userId', verifyUser, requireOwner('userId'), controller.postUserId);
router.get('/:userId', verifyUser, requireOwner('userId'), controller.getUserId);

module.exports=router;
