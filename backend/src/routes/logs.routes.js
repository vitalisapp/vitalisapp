const express=require('express');
const router=express.Router();
const verifyUser=require('../middleware/verifyUser');
const { requireOwner }=require('../utils/owner');
const controller=require('../controllers/logs.controller');

router.post('/:userId', verifyUser, requireOwner('userId'), controller.postUserId);
router.get('/history/:userId', verifyUser, requireOwner('userId'), controller.gethistoryUserId);

module.exports=router;
