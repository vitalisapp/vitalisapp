const express=require('express');
const router=express.Router();
const verifyUser=require('../middleware/verifyUser');
const controller=require('../controllers/trainingPrefs.controller');

// One user's training preferences: identity from JWT, never the body.
router.get('/', verifyUser, controller.get);
router.put('/', verifyUser, controller.put);
router.post('/exclude-exercise', verifyUser, controller.postExcludeExercise);
router.get('/exercise-guide', verifyUser, controller.getExerciseGuide);

module.exports=router;
