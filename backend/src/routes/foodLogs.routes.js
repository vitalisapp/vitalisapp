const express=require('express');
const router=express.Router();
const verifyUser=require('../middleware/verifyUser');
const { requireOwner }=require('../utils/owner');
const { aiLimiter, writeLimiter }=require('../middleware/rateLimits');
const aiQuota=require('../middleware/aiQuota');
const controller=require('../controllers/foodLogs.controller');

router.post('/analyze-pic', verifyUser, aiLimiter(), aiQuota, controller.postanalyzePic);
router.post('/:userId/suggest-plan', verifyUser, requireOwner('userId'), aiLimiter(), aiQuota, controller.postUserIdSuggestPlan);
router.post('/:userId', verifyUser, requireOwner('userId'), writeLimiter(), controller.postUserId);
router.get('/:userId', verifyUser, requireOwner('userId'), controller.getUserId);
router.delete('/:userId/:mealId', verifyUser, requireOwner('userId'), controller.deleteUserIdMealId);

module.exports=router;
