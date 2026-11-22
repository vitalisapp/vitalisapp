const express=require('express');
const router=express.Router();
const verifyUser=require('../middleware/verifyUser');
const { writeLimiter } = require('../middleware/rateLimits');
const { requireOwner }=require('../utils/owner');
const { validate }=require('../middleware/validate');
const controller=require('../controllers/plans.controller');

// Spam guard for writes: one shared per-user bucket for this router.
const write = writeLimiter();

router.post('/', verifyUser, write, validate(controller.createPersonalSchema), controller.postCreate);
router.post('/auto-from-goal', verifyUser, write, controller.postAutoFromGoal);
// 'adjust-from-goal' must sit before '/:planId' routes for the literal to win.
router.post('/adjust-from-goal', verifyUser, write, controller.postAdjust);
router.post('/:planId/activate', verifyUser, write, controller.postActivate);
router.patch('/:planId', verifyUser, write, validate(controller.updatePersonalSchema), controller.patchPlanId);
router.delete('/:planId', verifyUser, write, controller.deletePlanId);
router.post('/enroll', verifyUser, write, validate(controller.enrollSchema), controller.postenroll);
router.post('/progress/complete', verifyUser, write, validate(controller.progressCompleteSchema), controller.postprogressComplete);
router.get('/goal-status/:userId', verifyUser, requireOwner('userId'), controller.getGoalStatusUserId);
router.get('/progress/:userId/:planId', verifyUser, requireOwner('userId'), controller.getprogressUserIdPlanId);
router.get('/content/:planId', verifyUser, controller.getcontentPlanId);
router.get('/:userId', verifyUser, requireOwner('userId'), controller.getUserId);

module.exports=router;
