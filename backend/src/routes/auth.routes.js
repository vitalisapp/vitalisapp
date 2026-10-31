const express=require('express');
const router=express.Router();
const { validate }=require('../middleware/validate');
const controller=require('../controllers/auth.controller');

const verifyUser = require('../middleware/verifyUser');
const { meLimiter, makeLimiter, loginLimiter, logoutLimiter } = require('../middleware/rateLimits');

// Own bucket for the email-change flow (was misleadingly named verificationLimiter).
const changeEmailLimiter = makeLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  message: 'Too many email-change requests. Try again later.',
});

// Separate buckets so send-spam can't starve verify attempts
const sendVerificationLimiter = makeLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  message: 'Too many verification emails. Try again later.',
});

// Keyed per link TOKEN, not just per IP. The old shared bucket (20/15 min
// per IP) let unrelated traffic exhaust it before a fresh account's FIRST
// click: a hosted backend sees mobile-carrier CGNAT IPs (thousands of users
// behind one address) and public-endpoint scanners, so new users inherited a
// dead bucket. Per-token buckets can't starve other users, and successful
// verifications never count, so accidental double-clicks don't burn attempts
// either. Brute force is unaffected — tokens are 256-bit single-use values,
// so guessing happens in the DB, not via this endpoint's budget.
const verifyEmailLimiter = makeLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  message: 'Too many verification attempts. Try again later.',
  keyGenerator: (req) => `${req.ip}:${String(req.query?.token || '').slice(0, 64) || 'none'}`,
  skipSuccessfulRequests: true,
});

const googleLoginLimiter = makeLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  message: 'Too many Google login attempts. Try again later.',
});

const registerLimiter = makeLimiter({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  message: 'Too many accounts created. Try again later.',
});

router.get('/me', meLimiter(), controller.getme);
router.post('/register', registerLimiter, validate(controller.registerSchema), controller.postregister);
// Central IP limiter is primary; controller.loginIpLimiter kept as identical
// second layer for backward compat (same 10/min budget).
router.post('/login', loginLimiter(), controller.loginIpLimiter, validate(controller.loginSchema), controller.postlogin);
router.post('/google-login', googleLoginLimiter, validate(controller.googleLoginSchema), controller.postgoogleLogin);
router.post('/change-password', verifyUser, validate(controller.changePasswordSchema), controller.postchangePassword);
router.post('/logout', logoutLimiter(), controller.postlogout);
router.post('/send-verification', sendVerificationLimiter, controller.postsendVerification);
const deliveryController = require('../controllers/emailDelivery.controller');
router.post('/verification-delivery', makeLimiter({ windowMs: 60000, limit: 60, message: 'Too many delivery checks. Please wait.' }), deliveryController.getStatus);
router.post('/email-delivery-webhook', deliveryController.webhook);
router.get('/verify-email', verifyEmailLimiter, controller.getverifyEmail);
router.patch('/change-email', changeEmailLimiter, validate(controller.changeEmailSchema), controller.patchchangeEmail);
router.post('/complete-onboarding', meLimiter(), verifyUser, controller.postcompleteOnboarding);
// Module 1 — governance: soft deactivation (password-confirmed) + credential-
// gated reactivation. Deactivate is pricier (bcrypt + side effects) than reads.
const deactivateLimiter = makeLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  message: 'Too many deactivate attempts. Try again later.',
});
const reactivateLimiter = makeLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: 'Too many reactivate attempts. Try again later.',
});
router.post('/deactivate', deactivateLimiter, verifyUser, controller.postDeactivate);
router.post('/reactivate', reactivateLimiter, controller.postReactivate);
// Read-only: current allergy list for Profile > Personalization.
router.get('/allergies', meLimiter(), verifyUser, controller.getallergies);

module.exports=router;
