// SMS OTP verification for registration.
//
// Rules (kept deliberately boring):
//   • 6-digit code from a CSPRNG, stored only as a sha256 hash
//   • expires after 5 minutes
//   • 60-second resend cooldown per account
//   • 5 wrong attempts per code, then the code is dead
//   • one active code per account; issuing a new one retires the old one
//   • a successful code is consumed inside a transaction, so two devices
//     cannot both verify with the same code
//
// The raw code only ever travels to the SMS provider. It is never returned to
// the client, logged, or stored.

const crypto = require('crypto');
const db = require('../config/db');
const { AppError } = require('../utils/errors');
const { normalizePhMobile, maskPhone, PHONE_INVALID_MSG } = require('../utils/phone');
const sms = require('./sms.service');

const OTP_TTL_MS = 5 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_ATTEMPTS = 5;
const MAX_SENDS_PER_HOUR = 5;

function hashValue(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

function safeEqualHex(a, b) {
  const left = Buffer.from(String(a), 'utf8');
  const right = Buffer.from(String(b), 'utf8');
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

function secondsUntil(dateLike) {
  const at = new Date(dateLike).getTime();
  if (!Number.isFinite(at)) return 0;
  return Math.max(0, Math.ceil((at + RESEND_COOLDOWN_MS - Date.now()) / 1000));
}

function buildMessage(code) {
  return `Your Vitalis verification code is ${code}. It expires in 5 minutes. Never share this code with anyone.`;
}

/**
 * Create + send a code for an unverified account.
 * @param {{ email: string, phone?: string }} params
 */
async function sendCode({ email, phone }) {
  const [userRows] = await db.execute(
    'SELECT id, name, email, phone, is_verified FROM users WHERE email = ? LIMIT 1',
    [email],
  );
  const user = userRows[0];
  if (!user) {
    // Registration-only flow: mirror the email flow's "request a new one"
    // wording without confirming whether the address exists elsewhere.
    throw new AppError(
      'No pending SMS verification was found for that account. Sign in to request a new one.',
      404,
      'SMS_NOT_PENDING',
    );
  }
  if (user.is_verified) {
    throw new AppError('This account is already verified. Sign in instead.', 400, 'ALREADY_VERIFIED');
  }

  const target = normalizePhMobile(phone || user.phone);
  if (!target) {
    throw new AppError(PHONE_INVALID_MSG, 400, 'PHONE_INVALID');
  }

  const [taken] = await db.execute(
    'SELECT id FROM users WHERE phone = ? AND id <> ? LIMIT 1',
    [target, user.id],
  );
  if (taken.length > 0) {
    throw new AppError(
      'That mobile number is already linked to another account.',
      409,
      'PHONE_TAKEN',
    );
  }

  const [recent] = await db.execute(
    'SELECT last_sent_at FROM phone_verifications WHERE user_id = ? AND used = 0 ORDER BY id DESC LIMIT 1',
    [user.id],
  );
  if (recent.length > 0) {
    const retryAfter = secondsUntil(recent[0].last_sent_at);
    if (retryAfter > 0) {
      throw new AppError(
        `Please wait ${retryAfter}s before requesting another code.`,
        429,
        'RESEND_COOLDOWN',
        { retryAfter },
      );
    }
  }

  const [sentThisHour] = await db.execute(
    'SELECT COUNT(*) AS total FROM phone_verifications WHERE user_id = ? AND created_at > (NOW() - INTERVAL 1 HOUR)',
    [user.id],
  );
  if (Number(sentThisHour[0]?.total || 0) >= MAX_SENDS_PER_HOUR) {
    throw new AppError(
      'Too many codes requested for this account. Try again later.',
      429,
      'SMS_HOURLY_LIMIT',
      { retryAfter: 900 },
    );
  }

  // One active code at a time — the newest request always wins.
  await db.execute('UPDATE phone_verifications SET used = 1 WHERE user_id = ? AND used = 0', [user.id]);

  // In mock mode the fixed code 000000 is used so the flow is testable without
  // ever sending or revealing a real one-time secret.
  const code = sms.isMock() ? "000000" : String(crypto.randomInt(100000, 1000000));
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  const [insert] = await db.execute(
    'INSERT INTO phone_verifications (user_id, phone, otp_hash, expires_at, last_sent_at) VALUES (?, ?, ?, ?, NOW())',
    [user.id, target, hashValue(code), expiresAt],
  );
  const rowId = insert.insertId;

  try {
    const receipt = await sms.sendSms({
      to: target,
      content: buildMessage(code),
      metadata: { purpose: 'signup_verification', user_id: String(user.id) },
    });
    if (receipt.referenceId) {
      await db.execute('UPDATE phone_verifications SET reference_id = ? WHERE id = ?', [
        receipt.referenceId,
        rowId,
      ]);
    }
    return {
      phoneMasked: maskPhone(target),
      retryAfter: Math.floor(RESEND_COOLDOWN_MS / 1000),
      expiresIn: Math.floor(OTP_TTL_MS / 1000),
      mocked: receipt.mocked,
    };
  } catch (err) {
    // Do not leave a code behind that the user never received.
    await db.execute('DELETE FROM phone_verifications WHERE id = ?', [rowId]).catch(() => {});
    throw err;
  }
}

/**
 * Verify a code and mark the account verified.
 * @param {{ email: string, code: string }} params
 * @returns {Promise<object>} the verified user row
 */
async function verifyCode({ email, code }) {
  const submitted = String(code || '').replace(/\D/g, '');
  if (submitted.length !== 6) {
    throw new AppError('Enter the 6-digit code from the SMS.', 400, 'OTP_INVALID');
  }

  const conn = await db.getConnection();
  let committed = false;
  try {
    await conn.beginTransaction();

    const [userRows] = await conn.execute(
      'SELECT id, name, email, phone, is_verified FROM users WHERE email = ? LIMIT 1 FOR UPDATE',
      [email],
    );
    const user = userRows[0];
    if (!user) {
      throw new AppError('That code is incorrect or has expired.', 400, 'OTP_INVALID');
    }
    if (user.is_verified) {
      throw new AppError('This account is already verified. Sign in instead.', 400, 'ALREADY_VERIFIED');
    }

    const [rows] = await conn.execute(
      'SELECT id, phone, otp_hash, expires_at, attempts FROM phone_verifications WHERE user_id = ? AND used = 0 ORDER BY id DESC LIMIT 1 FOR UPDATE',
      [user.id],
    );
    const record = rows[0];
    if (!record) {
      throw new AppError(
        'That code is incorrect or has expired. Request a new one.',
        400,
        'OTP_EXPIRED',
      );
    }

    if (new Date(record.expires_at).getTime() <= Date.now()) {
      await conn.execute('UPDATE phone_verifications SET used = 1 WHERE id = ?', [record.id]);
      await conn.commit();
      committed = true;
      throw new AppError('That code has expired. Request a new one.', 400, 'OTP_EXPIRED');
    }

    if (Number(record.attempts) >= MAX_ATTEMPTS) {
      await conn.execute('UPDATE phone_verifications SET used = 1 WHERE id = ?', [record.id]);
      await conn.commit();
      committed = true;
      throw new AppError(
        'Too many incorrect attempts. Request a new code.',
        429,
        'OTP_LOCKED',
      );
    }

    if (!safeEqualHex(hashValue(submitted), record.otp_hash)) {
      await conn.execute('UPDATE phone_verifications SET attempts = attempts + 1 WHERE id = ?', [
        record.id,
      ]);
      await conn.commit();
      committed = true;
      const remaining = MAX_ATTEMPTS - Number(record.attempts) - 1;
      throw new AppError(
        remaining > 0
          ? `That code is incorrect. ${remaining} ${remaining === 1 ? 'attempt' : 'attempts'} left.`
          : 'Too many incorrect attempts. Request a new code.',
        400,
        'OTP_INVALID',
        { attemptsRemaining: Math.max(0, remaining) },
      );
    }

    // Success: consume this code (and any other outstanding one) atomically.
    await conn.execute('UPDATE phone_verifications SET used = 1 WHERE id = ?', [record.id]);
    await conn.execute('UPDATE phone_verifications SET used = 1 WHERE user_id = ? AND used = 0', [
      user.id,
    ]);
    await conn.execute(
      'UPDATE users SET phone = ?, phone_verified_at = NOW(), is_verified = 1 WHERE id = ?',
      [record.phone, user.id],
    );

    await conn.commit();
    committed = true;
  } catch (err) {
    if (!committed) {
      try {
        await conn.rollback();
      } catch {
        /* connection already gone */
      }
    }
    // Another account claimed this number between send and verify.
    if (err?.code === 'ER_DUP_ENTRY') {
      throw new AppError(
        'That mobile number is already linked to another account.',
        409,
        'PHONE_TAKEN',
      );
    }
    throw err;
  } finally {
    conn.release();
  }

  const [verified] = await db.execute(
    'SELECT id, name, email, phone, avatar_url, fitness_goal, token_version, is_verified, onboarding_completed, role, status, accepted_terms_at, accepted_terms_version FROM users WHERE email = ? LIMIT 1',
    [email],
  );
  const user = verified[0];
  return {
    ...user,
    phone_masked: maskPhone(user?.phone),
  };
}

module.exports = {
  sendCode,
  verifyCode,
  OTP_TTL_MS,
  RESEND_COOLDOWN_MS,
  MAX_ATTEMPTS,
  MAX_SENDS_PER_HOUR,
};
