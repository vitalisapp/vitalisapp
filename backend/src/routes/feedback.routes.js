const express=require('express');
const { feedbackLimiter }=require('../middleware/rateLimits');
const router=express.Router();
const controller=require('../controllers/feedback.controller');

// Public form — spam guard: 5 submissions per hour per IP (central preset)
router.post('/', feedbackLimiter(), controller.post);

module.exports=router;
