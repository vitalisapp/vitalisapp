const express=require('express');
const router=express.Router();
const verifyUser=require('../middleware/verifyUser');
const { requireOwner }=require('../utils/owner');
const { writeLimiter }=require('../middleware/rateLimits');
const controller=require('../controllers/notification.controller');

router.get('/stream/:userId', verifyUser, requireOwner('userId'), controller.stream);
router.get('/:userId', verifyUser, requireOwner('userId'), controller.getUserId);
router.post('/', verifyUser, writeLimiter(), controller.post);
router.put('/:id/read', verifyUser, writeLimiter(), controller.putIdRead);
router.put('/read-all/:userId', verifyUser, requireOwner('userId'), controller.putreadAllUserId);

module.exports=router;
