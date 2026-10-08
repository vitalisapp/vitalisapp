const express = require('express');
const router = express.Router();
const controller = require('../controllers/public.controller');
const { makeLimiter } = require('../middleware/rateLimits');

// Generous but bounded: landing hammers this on every visit.
const landingLimiter = makeLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  message: 'Too many requests. Try again later.',
});

// One hit per page view; sessionStorage guard on the client keeps this low.
// Higher budget than landing-stats since every first-view fires it.
const visitLimiter = makeLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 120,
  message: 'Too many requests. Try again later.',
});

router.get('/landing-stats', landingLimiter, controller.getlandingStats);
router.post('/landing-visit', visitLimiter, controller.postVisit);

module.exports = router;
