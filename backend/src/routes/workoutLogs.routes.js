const express=require('express');
const router=express.Router();
const verifyUser=require('../middleware/verifyUser');
const controller=require('../controllers/workoutLogs.controller');

router.post('/start', verifyUser, controller.poststart);
router.patch('/:id/end', verifyUser, controller.patchIdEnd);
router.get('/', verifyUser, controller.get);

module.exports=router;
