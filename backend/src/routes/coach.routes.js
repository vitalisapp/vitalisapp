const express=require('express');
const { makeLimiter }=require('../middleware/rateLimits');
const router=express.Router();
const verifyUser=require('../middleware/verifyUser');
const aiQuota=require('../middleware/aiQuota');
const controller=require('../controllers/coach.controller');
const weekController=require('../controllers/coachPlan.controller');

const coachRouteLimiter = makeLimiter({
  windowMs: 5 * 60 * 1000,
  limit: 30,
  message: 'AI coach is busy. Try again in a bit.',
});

router.post('/', verifyUser, coachRouteLimiter, aiQuota, controller.post);

// Section 4 — personal coach week (rules decide; Gemini only rewords, cached).
const weekLimiter = makeLimiter({ windowMs: 5 * 60 * 1000, limit: 60, message: 'Too many coach requests. Try again in a bit.' });
router.get('/week', verifyUser, weekLimiter, weekController.getWeek);
router.post('/week/adjust', verifyUser, weekLimiter, weekController.postAdjust);
router.post('/week/reset', verifyUser, weekLimiter, weekController.postReset);

module.exports=router;
