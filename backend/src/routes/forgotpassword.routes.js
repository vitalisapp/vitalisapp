const express=require('express');
const router=express.Router();
const { makeLimiter }=require('../middleware/rateLimits');
const { z }=require('zod');
const { validate }=require('../middleware/validate');
const controller=require('../controllers/forgotpassword.controller');

// OTP/email spam guard: 5 sends per 10 min per IP
const otpSendLimiter = makeLimiter({
  windowMs: 10 * 60 * 1000,
  limit: 5,
  message: 'Too many OTP requests. Try again later.',
});

// Brute-force guard: 6-digit OTP is only 1M combos — throttle verify + reset
const otpVerifyLimiter = makeLimiter({
  windowMs: 10 * 60 * 1000,
  limit: 10,
  message: 'Too many code attempts. Try again later.',
});

const passwordResetLimiter = makeLimiter({
  windowMs: 10 * 60 * 1000,
  limit: 10,
  message: 'Too many reset attempts. Try again later.',
});

const emailSchema = z.object({ email: z.string().trim().toLowerCase().email('Invalid email address') });
const verifySchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email address'),
  otp: z.string().trim().min(4).max(10),
});
const resetSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email address'),
  resetToken: z.string().trim().min(4).max(512),
  newPassword: z.string().min(8, 'Password must be at least 8 characters').max(128),
});

router.post('/send-otp', otpSendLimiter, validate(emailSchema), controller.postsendOtp);
router.post('/verify-otp', otpVerifyLimiter, validate(verifySchema), controller.postverifyOtp);
router.post('/reset-password', passwordResetLimiter, validate(resetSchema), controller.postresetPassword);

module.exports=router;
