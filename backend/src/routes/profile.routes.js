const express=require('express');
const router=express.Router();
const verifyUser=require('../middleware/verifyUser');
const { requireOwner }=require('../utils/owner');
const controller=require('../controllers/profile.controller');

router.put('/update', verifyUser, controller.putupdate);
router.get('/:userId', verifyUser, requireOwner('userId'), controller.getUserId);

module.exports=router;
