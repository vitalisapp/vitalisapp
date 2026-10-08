const express=require('express');
const { makeLimiter }=require('../middleware/rateLimits');
const router=express.Router();
const verifyUser=require('../middleware/verifyUser');
const aiQuota=require('../middleware/aiQuota');
const controller=require('../controllers/coach.controller');

const coachRouteLimiter = makeLimiter({
  windowMs: 5 * 60 * 1000,
  limit: 30,
  message: 'AI coach is busy. Try again in a bit.',
});

router.post('/', verifyUser, coachRouteLimiter, aiQuota, controller.post);

module.exports=router;
