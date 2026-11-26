const express=require('express');
const router=express.Router();
const verifyUser=require('../middleware/verifyUser');
const { requireMember }=require('../middleware/verifyUser');
const { requireOwner }=require('../utils/owner');
const controller=require('../controllers/dashboard.controller');

// Week calendar (current week Mon–Sun) + read-only day snapshot. MUST be
// registered before '/dashboard/:userId' or ':userId' would swallow them.
router.get('/dashboard/week-calendar', verifyUser, requireMember, controller.getWeekCalendar);
router.get('/dashboard/calendar/:date', verifyUser, requireMember, controller.getDaySnapshot);

router.get('/dashboard/:userId', verifyUser, requireMember, requireOwner('userId'), controller.getdashboardUserId);
router.get('/search', verifyUser, requireMember, controller.getsearch);

module.exports=router;
