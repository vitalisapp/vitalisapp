
const db = require('../config/db');
const log = require('../utils/logger');
const bcrypt     = require('bcryptjs');
const crypto     = require('crypto');
// Reuse canonical mailer (timeouts + TLS guard + graceful no-key handling)
const { getTransporter } = require('../config/mailer');
const transporter = getTransporter();

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function normEmail(email) {
  return String(email || '').trim().toLowerCase();
}

// Per-email OTP brute-force guard (second layer behind IP rate-limit).
// 6-digit OTP must not be guessable by rotating IPs.
const otpFailures = new Map();
const OTP_LOCK_AFTER = 10;
const OTP_LOCK_MS = 15 * 60 * 1000;
function checkOtpLock(email) {
  const rec = otpFailures.get(normEmail(email));
  if (!rec) return null;
  if (rec.lockedUntil && rec.lockedUntil > Date.now()) {
    return Math.ceil((rec.lockedUntil - Date.now()) / 1000);
  }
  if (rec.lockedUntil && rec.lockedUntil <= Date.now()) otpFailures.delete(normEmail(email));
  return null;
}
function recordOtpFailure(email) {
  const key = normEmail(email);
  const rec = otpFailures.get(key) || { count: 0 };
  rec.count += 1;
  if (rec.count >= OTP_LOCK_AFTER) rec.lockedUntil = Date.now() + OTP_LOCK_MS;
  otpFailures.set(key, rec);
}
function clearOtpFailures(email) {
  otpFailures.delete(normEmail(email));
}

async function postsendOtp(req,res,next){
  try{
      const email = normEmail(req.body?.email);
    
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: 'Valid email is required.' });
      }
    
      try {
        const [users] = await db.execute(
          'SELECT id, name FROM users WHERE email = ?',
          [email]
        );
    
        // Always return success (anti-enumeration)
        if (users.length === 0) {
          return res.json({ success: true, message: 'If that email exists, a code was sent.' });
        }
    
        const user = users[0];
    
        // Invalidate any existing unused OTPs for this user
        await db.execute(
          'UPDATE password_reset_otps SET used = 1 WHERE user_id = ? AND used = 0',
          [user.id]
        );
    
        // Generate 6-digit OTP with a CSPRNG (Math.random is predictable)
        const otp       = crypto.randomInt(100000, 1000000).toString();
        const otpHash   = crypto.createHash('sha256').update(otp).digest('hex');
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
        await db.execute(
          'INSERT INTO password_reset_otps (user_id, otp_hash, expires_at) VALUES (?, ?, ?)',
          [user.id, otpHash, expiresAt]
        );
    
        // Send email (throws → outer catch → next(err); OTP row stays valid for retry)
        await transporter.sendMail({
          from:    `"Vitalis" <${process.env.EMAIL_USER}>`,
          to:      email,
          subject: 'Your Vitalis Password Reset Code',
          html: `
            <div style="background:#0e0e0e;padding:40px 32px;font-family:'DM Sans',Arial,sans-serif;max-width:480px;margin:0 auto;border-radius:16px;border:1px solid rgba(255,255,255,0.06);">
              <div style="display:flex;align-items:center;gap:10px;margin-bottom:28px;">
                <div style="width:34px;height:34px;background:#c7f248;border-radius:8px;display:flex;align-items:center;justify-content:center;">
                  <span style="color:#161f00;font-weight:900;font-size:16px;">V</span>
                </div>
                <span style="color:#e5e2e1;font-size:18px;font-weight:700;letter-spacing:0.1em;">VITALIS</span>
              </div>
              <h2 style="color:#e5e2e1;font-size:22px;margin:0 0 8px;font-weight:700;">Password Reset</h2>
              <p style="color:rgba(196,201,176,0.5);font-size:13px;margin:0 0 28px;line-height:1.6;">
                Hey ${escapeHtml(user.name)}, use the code below to reset your password. It expires in <strong style="color:#c7f248;">10 minutes</strong>.
              </p>
              <div style="background:rgba(199,242,72,0.06);border:1px solid rgba(199,242,72,0.15);border-radius:12px;padding:24px;text-align:center;margin-bottom:28px;">
                <span style="font-size:42px;font-weight:900;letter-spacing:0.3em;color:#c7f248;">${otp}</span>
              </div>
              <p style="color:rgba(196,201,176,0.35);font-size:11px;text-align:center;margin:0;line-height:1.6;">
                If you didn't request this, you can safely ignore this email.<br/>
                Never share this code with anyone.
              </p>
            </div>
          `,
        });
    
        res.json({ success: true, message: 'If that email exists, a code was sent.' });
    
      } catch (err) {
        log.error('SEND OTP ERROR:', err);
        next(err);
      }
  }catch(e){ next(e); }
}

async function postverifyOtp(req,res,next){
  try{
      const email = normEmail(req.body?.email);
      const otp = req.body?.otp != null ? String(req.body.otp).trim() : '';
    
      if (!email || !otp) {
        return res.status(400).json({ error: 'Email and code are required.' });
      }
      const lockedSecs = checkOtpLock(email);
      if (lockedSecs) {
        return res.status(429).json({ error: `Too many incorrect codes. Try again in ${Math.ceil(lockedSecs / 60)} minutes.` });
      }
    
      try {
        const [users] = await db.execute(
          'SELECT id FROM users WHERE email = ?',
          [email]
        );
    
        if (users.length === 0) {
          recordOtpFailure(email);
          // Identical message as wrong-code path (anti-enumeration)
          return res.status(400).json({ error: 'Invalid or expired code.' });
        }
    
        const user    = users[0];
        const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
    
        const [otps] = await db.execute(
          `SELECT id FROM password_reset_otps
           WHERE user_id = ? AND otp_hash = ? AND used = 0 AND expires_at > NOW()
           ORDER BY created_at DESC LIMIT 1`,
          [user.id, otpHash]
        );
    
        if (otps.length === 0) {
          recordOtpFailure(email);
          return res.status(400).json({ error: 'Invalid or expired code.' });
        }
        clearOtpFailures(email);
    
        // OTP is valid — swap its hash for a short-lived reset token (5 min).
        // The row stays usable until reset consumes it (used = 1), so one OTP
        // yields one password reset. (Prior OTPs were already invalidated at send.)
        const resetToken     = crypto.randomBytes(32).toString('hex');
        const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
        const resetExpiry    = new Date(Date.now() + 5 * 60 * 1000);
    
        await db.execute(
          'UPDATE password_reset_otps SET otp_hash = ?, expires_at = ?, used = 0 WHERE id = ? AND used = 0',
          [resetTokenHash, resetExpiry, otps[0].id]
        );
    
        res.json({ success: true, resetToken });
    
      } catch (err) {
        log.error('VERIFY OTP ERROR:', err);
        next(err);
      }
  }catch(e){ next(e); }
}

async function postresetPassword(req,res,next){
  try{
      const email = normEmail(req.body?.email);
      const resetToken = req.body?.resetToken != null ? String(req.body.resetToken).trim() : '';
      const newPassword = req.body?.newPassword;
    
      if (!email || !resetToken || !newPassword) {
        return res.status(400).json({ error: 'All fields are required.' });
      }
    
      if (typeof newPassword !== 'string' || newPassword.length < 8 || newPassword.length > 128) {
        return res.status(400).json({ error: 'Password must be 8–128 characters.' });
      }
    
      try {
        const [users] = await db.execute(
          'SELECT id FROM users WHERE email = ?',
          [email]
        );
    
        if (users.length === 0) {
          return res.status(400).json({ error: 'Invalid request.' });
        }
    
        const user      = users[0];
        const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    
        const [otps] = await db.execute(
          `SELECT id FROM password_reset_otps
           WHERE user_id = ? AND otp_hash = ? AND used = 0 AND expires_at > NOW()
           ORDER BY created_at DESC LIMIT 1`,
          [user.id, tokenHash]
        );
    
        if (otps.length === 0) {
          return res.status(400).json({ error: 'Reset session expired. Please start over.' });
        }
    
        // Hash and update the new password
        const salt   = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(newPassword, salt);
    
        // Bump token_version: a password reset kills every existing session.
        await db.execute('UPDATE users SET password = ?, token_version = token_version + 1 WHERE id = ?', [hashed, user.id]);
    
        // Consume the reset token
        await db.execute(
          'UPDATE password_reset_otps SET used = 1 WHERE id = ?',
          [otps[0].id]
        );
    
        // Invalidate all active sessions
        await db.execute(
          'UPDATE user_sessions SET is_current = 0 WHERE user_id = ?',
          [user.id]
        );
    
        res.json({ success: true, message: 'Password updated successfully.' });
    
      } catch (err) {
        log.error('RESET PASSWORD ERROR:', err);
        next(err);
      }
  }catch(e){ next(e); }
}

module.exports = { postsendOtp, postverifyOtp, postresetPassword };
