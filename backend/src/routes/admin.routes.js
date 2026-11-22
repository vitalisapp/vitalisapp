const express = require('express');
const router = express.Router();
const verifyUser = require('../middleware/verifyUser');
const { requireAdmin } = verifyUser;
const { writeLimiter, meLimiter } = require('../middleware/rateLimits');
const controller = require('../controllers/admin.controller');
const access = require('../controllers/accessGroups.controller');
const reminders = require('../controllers/reminder.controller');

// Module 7 — admin panel, backend only. EVERY route requires a verified
// session AND role='admin' (requireAdmin). Read endpoints use the light
// meLimiter; mutating endpoints use writeLimiter.
const read = meLimiter();

// 1. Overview stats.
router.get('/overview', verifyUser, requireAdmin, read, controller.getOverview);
// Section 5: run the reminder scheduler now (optional { hour, weekday, userIds } for demos).
router.post('/reminders/run', verifyUser, requireAdmin, writeLimiter(), reminders.postAdminRun);

// 2. User management.
router.get('/users', verifyUser, requireAdmin, read, controller.getUsers);
// Section 10 — color-coded activity monitoring + report (GREEN / YELLOW / RED).
router.get('/monitoring', verifyUser, requireAdmin, read, controller.getMonitoring);
router.get('/users/:id', verifyUser, requireAdmin, read, controller.getUserDetail);
router.post('/users/:id/role', verifyUser, requireAdmin, writeLimiter(), controller.postUserRole);
router.post('/users/:id/status', verifyUser, requireAdmin, writeLimiter(), controller.postUserStatus);
router.post('/users/:id/signout', verifyUser, requireAdmin, writeLimiter(), controller.postUserSignout);
router.delete('/users/:id', verifyUser, requireAdmin, writeLimiter(), controller.deleteUser);

// 3. Content oversight (plans read-only, community moderation).
router.get('/plans', verifyUser, requireAdmin, read, controller.getPlans);
router.get('/community/posts', verifyUser, requireAdmin, read, controller.getCommunityPosts);
router.delete('/community/posts/:id', verifyUser, requireAdmin, writeLimiter(), controller.deleteCommunityPost);

// 4. Activity & AI usage ledger.
router.get('/ai-usage', verifyUser, requireAdmin, read, controller.getAiUsage);
// SMS: live UniSMS credit balance + daily verification sends.
router.get('/sms', verifyUser, requireAdmin, read, controller.getSms);

// 5. Audit trail.
router.get('/audit', verifyUser, requireAdmin, read, controller.getAudit);

// 6. Access QR codes for designated groups (evaluators, panel, Day 1 testers).
router.get('/access-groups', verifyUser, requireAdmin, read, access.getList);
router.post('/access-groups', verifyUser, requireAdmin, writeLimiter(), access.postCreate);
router.patch('/access-groups/:id', verifyUser, requireAdmin, writeLimiter(), access.patchUpdate);
router.delete('/access-groups/:id', verifyUser, requireAdmin, writeLimiter(), access.deleteOne);
router.get('/access-groups/:id/members', verifyUser, requireAdmin, read, access.getMembers);

module.exports = router;
