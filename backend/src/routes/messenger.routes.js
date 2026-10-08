const express=require('express');
const router=express.Router();
const verifyUser=require('../middleware/verifyUser');
const { requireOwner }=require('../utils/owner');
const { messageLimiter, writeLimiter }=require('../middleware/rateLimits');
const controller=require('../controllers/messenger.controller');

router.get('/contacts/:userId', verifyUser, requireOwner('userId'), controller.getcontactsUserId);
router.get('/messages/:userId/:contactId', verifyUser, requireOwner('userId'), controller.getmessagesUserIdContactId);
router.post('/messages', verifyUser, messageLimiter(), controller.postmessages);
router.get('/users/search', verifyUser, controller.getusersSearch);
router.post('/friends/add', verifyUser, writeLimiter(), controller.postfriendsAdd);

module.exports=router;
