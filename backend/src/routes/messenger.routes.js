const express=require('express');
const router=express.Router();
const verifyUser=require('../middleware/verifyUser');
const { requireMember }=require('../middleware/verifyUser');
const { requireOwner }=require('../utils/owner');
const { messageLimiter, writeLimiter }=require('../middleware/rateLimits');
const controller=require('../controllers/messenger.controller');

router.get('/contacts/:userId', verifyUser, requireMember, requireOwner('userId'), controller.getcontactsUserId);
router.get('/messages/:userId/:contactId', verifyUser, requireMember, requireOwner('userId'), controller.getmessagesUserIdContactId);
router.post('/messages', verifyUser, requireMember, messageLimiter(), controller.postmessages);
router.get('/users/search', verifyUser, requireMember, controller.getusersSearch);
router.post('/friends/add', verifyUser, requireMember, writeLimiter(), controller.postfriendsAdd);
router.post('/friends/request', verifyUser, requireMember, writeLimiter(), controller.postfriendsRequest);
router.get('/friends/requests/:userId', verifyUser, requireMember, requireOwner('userId'), controller.getfriendsRequests);
router.post('/friends/accept', verifyUser, requireMember, writeLimiter(), controller.postfriendsAccept);
router.post('/friends/decline', verifyUser, requireMember, writeLimiter(), controller.postfriendsDecline);
router.get('/friends/status', verifyUser, requireMember, controller.getfriendsStatus);

module.exports=router;
