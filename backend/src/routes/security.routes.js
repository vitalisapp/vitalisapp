const express=require('express');
const router=express.Router();
const verifyUser=require('../middleware/verifyUser');
const { writeLimiter }=require('../middleware/rateLimits');
const controller=require('../controllers/security.controller');

router.get('/', verifyUser, controller.get);
router.delete('/:sessionId', verifyUser, writeLimiter(), controller.deleteSessionId);

module.exports=router;
