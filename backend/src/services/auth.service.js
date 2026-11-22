// Auth — business logic + DB access.
// HTTP concerns (cookies, status codes) stay in auth.controller.js.
const db = require("../config/db");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const UAParser = require("ua-parser-js");
const { OAuth2Client } = require("google-auth-library");
const { AppError } = require("../utils/errors");
const { sendVerificationEmail, sendEmailChangedNotice, sendWelcomeEmail } = require("./email.service");
const { frontendUrl } = require("../utils/frontendUrl");
const { normalizePhMobile, PHONE_INVALID_MSG } = require("../utils/phone");
const allergiesService = require("./allergies.service");
const { trackingToken } = require('./emailDelivery.service');

// ALLOW_DEV_LINKS=1 exposes links for local demo without SMTP (never in prod).
const DEV_VERIFY_FALLBACK =
  process.env.ALLOW_DEV_LINKS === "1" && process.env.NODE_ENV !== "production";

// Soft verification: every new account is signed in straight away and an
// unverified account can still sign in and use the app (the frontend shows a
// "confirm your email" banner). Verification is required only for account
// recovery confidence, not for access.
//
// NODE_ENV=development additionally skips sending the verify link: signups are
// created verified, and any still-unverified account is verified on its next
// sign-in. Read per call so tests can toggle it.
function skipEmailVerification() {
  return String(process.env.NODE_ENV || "").toLowerCase() === "development";
}

// SMS_VERIFY_DEV=1 opts development into the real SMS flow (with UNISMS_MOCK=1
// so nothing is actually sent). Without it, development keeps the zero-friction
// auto-verify behaviour for both channels.
function smsVerificationRequiredInDev() {
  return process.env.SMS_VERIFY_DEV === "1";
}

// Welcome email for brand-new accounts. Fire-and-forget: a mail outage must
// never fail or slow down account creation.
function queueWelcomeEmail(email, name, options) {
  Promise.resolve()
    .then(() => sendWelcomeEmail(email, name, options))
    .catch((err) => console.error("Welcome email failed:", err.message));
}

async function markVerified(user) {
  await db.execute("UPDATE users SET is_verified = 1 WHERE id = ?", [user.id]);
  user.is_verified = 1;
}

// ─── MODULE 1: consent audit + account governance ───
// Version stamp recorded with every acceptance — bump when the legal copy in
// Register/LegalModals materially changes (their "Last updated: September 2026"
// matches this value).
const CONSENT_VERSION = "2026-09";

// Seed rule: comma-separated emails auto-promoted to admin at account creation
// (e.g. ADMIN_EMAILS=admin@vitalis.io). Existing users can be promoted with
// `node scripts/set-admin.js <email> [admin|member]`.
function isSeedAdmin(email) {
  const list = String(process.env.ADMIN_EMAILS || "");
  return list
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .includes(String(email || "").toLowerCase());
}

async function createVerificationToken(userId) {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  // Resends must not invalidate links still in transit to the same inbox.
  await db.execute(
    "INSERT INTO email_verifications (user_id, token_hash, expires_at) VALUES (?, ?, ?)",
    [userId, tokenHash, expiresAt],
  );
  return { token, link: `${frontendUrl()}/verify-email?token=${token}` };
}

const googleClient = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
});

// ─── PER-EMAIL LOGIN THROTTLE (second layer; IP limiter is primary) ───
const loginAttempts = new Map();
const ATTEMPT_TTL_MS = 30 * 60 * 1000;

setInterval(() => {
  const now = Date.now();
  for (const [key, rec] of loginAttempts) {
    if (rec.lockedUntil && rec.lockedUntil <= now) loginAttempts.delete(key);
    else if (!rec.lockedUntil && now - (rec.firstSeen || now) > ATTEMPT_TTL_MS)
      loginAttempts.delete(key);
  }
  if (loginAttempts.size > 5000) {
    const oldest = [...loginAttempts.keys()].slice(0, loginAttempts.size - 5000);
    for (const k of oldest) loginAttempts.delete(k);
  }
}, 10 * 60 * 1000).unref?.();

function normEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function getRateLimit(email) {
  const key = normEmail(email);
  if (!loginAttempts.has(key)) return { count: 0, lockedUntil: null, firstSeen: Date.now() };
  return loginAttempts.get(key);
}

function recordFailedAttempt(email) {
  const key = normEmail(email);
  const record = getRateLimit(key);
  const count = record.count + 1;

  let lockedUntil = null;
  if (count >= 20) {
    lockedUntil = Date.now() + 30 * 60 * 1000;
  } else if (count >= 10) {
    lockedUntil = Date.now() + 30 * 1000;
  }

  loginAttempts.set(key, { count, lockedUntil, firstSeen: record.firstSeen || Date.now() });
  return count;
}

function clearAttempts(email) {
  loginAttempts.delete(normEmail(email));
}

function checkRateLimit(email) {
  const record = getRateLimit(email);
  if (!record.lockedUntil) return null;

  const remaining = record.lockedUntil - Date.now();
  if (remaining <= 0) {
    loginAttempts.delete(normEmail(email));
    return null;
  }

  if (record.count >= 20) {
    const mins = Math.ceil(remaining / 60000);
    return {
      error: `Too many failed attempts. Try again in ${mins} minute${mins !== 1 ? "s" : ""}.`,
      retryAfter: Math.ceil(remaining / 1000),
    };
  }
  const secs = Math.ceil(remaining / 1000);
  return {
    error: `Too many failed attempts. Try again in ${secs} second${secs !== 1 ? "s" : ""}.`,
    retryAfter: Math.ceil(remaining / 1000),
  };
}

// ─── SESSION LOGGING ───
// One row per device (device type + browser + OS). A repeat login refreshes
// that row instead of inserting a duplicate, so the Profile "Devices &
// Sessions" list and the admin session counts stay meaningful.
//
// IP is deliberately NOT part of the match: a phone switches between Wi-Fi and
// mobile data, and that must not look like a brand-new device.
//
// Returns { isNewDevice, priorSessions, deviceLabel } so the controller can
// raise an in-app security notice for a genuinely new device. Never throws.
async function logUserSession(req, userId) {
  let conn;
  let deviceLabel = "Unknown device";
  try {
    const parser = new UAParser(req.headers["user-agent"]);
    const result = parser.getResult();

    const device = result.device.type || "Desktop";
    const browser = result.browser.name || "Unknown";
    const os = result.os.name || "Unknown";
    deviceLabel =
      [browser, os].filter((v) => v && v !== "Unknown").join(" on ") ||
      "Unknown device";

    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket?.remoteAddress ||
      req.ip ||
      "Unknown";

    const location = "Unknown";

    // Transaction so concurrent logins can't leave two is_current=true rows.
    conn = await db.getConnection();
    await conn.beginTransaction();

    // Was the account already signed in anywhere before this request? A
    // first-ever login must not send a "new device" warning.
    const [[priorRow]] = await conn.execute(
      "SELECT COUNT(*) AS prior FROM user_sessions WHERE user_id = ?",
      [userId],
    );
    const priorSessions = Number(priorRow?.prior) || 0;

    // `<=>` matches NULLs too, so older rows with missing UA fields still map
    // to the same device instead of creating a duplicate.
    const [existing] = await conn.execute(
      `SELECT id FROM user_sessions
        WHERE user_id = ? AND device <=> ? AND browser <=> ? AND os <=> ?
        ORDER BY created_at DESC
        LIMIT 1`,
      [userId, device, browser, os],
    );

    await conn.execute(
      "UPDATE user_sessions SET is_current = false WHERE user_id = ?",
      [userId],
    );

    let isNewDevice = false;
    if (existing.length) {
      // Refresh the existing device row (created_at doubles as "last active").
      await conn.execute(
        `UPDATE user_sessions
            SET ip_address = ?, location = ?, is_current = true, created_at = NOW()
          WHERE id = ? AND user_id = ?`,
        [ip, location, existing[0].id, userId],
      );
    } else {
      await conn.execute(
        `INSERT INTO user_sessions
         (user_id, device, browser, os, ip_address, location, is_current)
         VALUES (?, ?, ?, ?, ?, ?, true)`,
        [userId, device, browser, os, ip, location],
      );
      isNewDevice = true;
    }

    await conn.commit();
    return { isNewDevice, priorSessions, deviceLabel };
  } catch (err) {
    try {
      await conn?.rollback();
    } catch (_) {}
    console.error("SESSION LOG ERROR:", err);
    return { isNewDevice: false, priorSessions: 0, deviceLabel };
  } finally {
    try {
      conn?.release();
    } catch (_) {}
  }
}

// ─── ME ───
async function getMe(userId) {
  const [rows] = await db.execute(
    `SELECT
       u.id, u.name, u.email, u.fitness_goal, u.is_verified,
       u.onboarding_completed, u.token_version,
       u.accepted_terms_at, u.accepted_terms_version, u.status, u.role,
       COALESCE(p.avatar_url, u.avatar_url) AS avatar
     FROM users u
     LEFT JOIN user_profiles p ON p.user_id = u.id
     WHERE u.id = ?`,
    [userId],
  );
  return rows[0] || null;
}

// ─── ACCOUNT GOVERNANCE (Module 1) ───
// Soft deactivation: verify the password, flip status, and bump token_version
// so every issued session (any device) is dead the moment verifyUser next runs.
// Data is untouched — reactivate resumes exactly where life left off.
async function deactivateAccount(userId, password) {
  const [rows] = await db.execute("SELECT password, status FROM users WHERE id = ?", [userId]);
  if (rows.length === 0) {
    throw new AppError("Account not found", 404, "USER_NOT_FOUND");
  }
  if (rows[0].status === "deactivated") {
    throw new AppError("This account is already deactivated", 400, "ALREADY_DEACTIVATED");
  }
  const isMatch = await bcrypt.compare(password || "", rows[0].password);
  if (!isMatch) {
    throw new AppError("Current password is incorrect", 401, "INVALID_PASSWORD");
  }
  await db.execute(
    "UPDATE users SET status = 'deactivated', token_version = token_version + 1, is_online = 0 WHERE id = ?",
    [userId],
  );
  return { success: true };
}

// Reactivation: same credential gate as login (never reveals whether the
// email exists). Only a deactivated account passes — active accounts get
// told to just sign in.
async function reactivateAccount({ email, password }) {
  const [users] = await db.execute("SELECT id, password, status FROM users WHERE email = ?", [email]);
  if (users.length === 0) {
    throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");
  }
  const user = users[0];
  const isMatch = await bcrypt.compare(password || "", user.password);
  if (!isMatch) {
    throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");
  }
  if (user.status !== "deactivated") {
    throw new AppError("This account is already active — just sign in", 400, "NOT_DEACTIVATED");
  }
  await db.execute(
    "UPDATE users SET status = 'active', is_online = 0 WHERE id = ?",
    [user.id],
  );
  return { success: true };
}

// ─── REGISTER ───
// Account creation only — fitness/goal data is collected later in onboarding
// (see goals.service), so it is never client-supplied at signup.
//
// verificationMethod: 'email' (default, unchanged) or 'sms'. With 'sms' the
// phone is stored up front (unique) and the caller sends the code; no email
// token is issued. Development still auto-verifies both channels.
async function register({ name, email, password, phone, verificationMethod = 'email' }) {
  const [existing] = await db.execute("SELECT email FROM users WHERE email = ?", [email]);
  if (existing.length > 0) {
    throw new AppError("Email already registered in Vitalis labs.", 400, "EMAIL_EXISTS");
  }

  const wantsSms = verificationMethod === "sms";
  const normalizedPhone = wantsSms ? normalizePhMobile(phone) : "";
  if (wantsSms && !normalizedPhone) {
    throw new AppError(PHONE_INVALID_MSG, 400, "PHONE_INVALID");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPw = await bcrypt.hash(password, salt);

  const autoVerified = skipEmailVerification() && !(wantsSms && smsVerificationRequiredInDev());

  let insertResult;
  try {
    [insertResult] = await db.execute(
      "INSERT INTO users (name, email, phone, password, fitness_goal, is_online, is_verified, onboarding_completed, role, accepted_terms_at, accepted_terms_version) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, NOW(), ?)",
      [name, email, normalizedPhone || null, hashedPw, "general fitness", autoVerified ? 1 : 0, autoVerified ? 1 : 0, isSeedAdmin(email) ? "admin" : "member", CONSENT_VERSION],
    );
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      if (/uq_users_phone|phone/i.test(String(err.sqlMessage || err.message))) {
        throw new AppError(
          "That mobile number is already linked to another account.",
          409,
          "PHONE_TAKEN",
        );
      }
      throw new AppError("Email already registered in Vitalis labs.", 400, "EMAIL_EXISTS");
    }
    throw err;
  }
  const newUserId = insertResult.insertId;

  // Password accounts require confirmation outside development.
  const [userRows] = await db.execute(
    "SELECT id, name, email, phone, fitness_goal, avatar_url, token_version, is_verified, onboarding_completed, role, status, accepted_terms_at, accepted_terms_version FROM users WHERE id = ?",
    [newUserId],
  );
  const user = userRows[0];

  if (autoVerified) {
    queueWelcomeEmail(email, name, { provider: wantsSms ? "sms" : "email" });
    return {
      newUserId,
      link: null,
      emailed: false,
      deliveryToken: null,
      autoVerified: true,
      verificationMethod: wantsSms ? "sms" : "email",
      user,
    };
  }

  // SMS: the controller sends the code right after this returns, so a provider
  // outage cannot roll back an account that was otherwise created correctly.
  if (wantsSms) {
    queueWelcomeEmail(email, name, { provider: "sms" });
    return {
      newUserId,
      link: null,
      emailed: false,
      deliveryToken: null,
      autoVerified: false,
      verificationMethod: "sms",
      user,
    };
  }

  // Email verification: the welcome email carries the verify link, so a new
  // user gets one message instead of two. Never block registration on SMTP.
  const { link } = await createVerificationToken(newUserId);
  queueWelcomeEmail(email, name, { provider: "email", verifyUrl: link });

  return {
    newUserId,
    link,
    emailed: true,
    deliveryToken: null,
    autoVerified: false,
    verificationMethod: "email",
    user,
  };
}

// ─── LOGIN ───
const LOGIN_USER_SELECT =
  "SELECT id, name, email, phone, password, fitness_goal, avatar_url, is_verified, onboarding_completed, is_online, token_version, status, role FROM users WHERE email = ?";

async function login({ email, password }) {
  const lockStatus = checkRateLimit(email);
  if (lockStatus) {
    throw new AppError(lockStatus.error, 429, "RATE_LIMITED", {
      retryAfter: lockStatus.retryAfter,
    });
  }

  const [users] = await db.execute(LOGIN_USER_SELECT, [email]);
  if (users.length === 0) {
    // Explicit "not found" is a product decision: /register already reveals
    // taken emails (EMAIL_EXISTS), so this leaks nothing new. Probing stays
    // throttled by loginLimiter (10/min/IP) and the per-email attempt counter.
    recordFailedAttempt(email);
    throw new AppError(
      "User not found. No account uses this email — sign up to create one.",
      404,
      "USER_NOT_FOUND",
    );
  }

  const user = users[0];
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    const attempts = recordFailedAttempt(email);
    let hint = "Invalid credentials";
    if (attempts >= 20) hint = "Too many failed attempts. Try again in 30 minutes.";
    else if (attempts >= 10) hint = "Too many failed attempts. Try again in 30 seconds.";
    throw new AppError(hint, 401, "INVALID_CREDENTIALS");
  }

  clearAttempts(email);

  // Soft-deactivated accounts: the password is correct, but the login is
  // refused so stale sessions can't sneak back in. The login screen offers
  // one-click reactivation (POST /api/auth/reactivate + normal login).
  if (user.status === "deactivated") {
    throw new AppError(
      "This account is deactivated. Your data is safe — reactivate it to continue.",
      403,
      "ACCOUNT_DEACTIVATED",
      { email: user.email },
    );
  }

  if (!user.is_verified && skipEmailVerification()) {
    await markVerified(user);
  }

  // Hard verification gate: a correct password is not enough until the email
  // link or SMS code has been confirmed. No session is issued here; the client
  // sends the user to the matching verification screen.
  if (!user.is_verified) {
    const verificationMethod = user.phone ? "sms" : "email";
    throw new AppError(
      verificationMethod === "sms"
        ? "Verify your phone number to sign in. Enter the code we texted you."
        : "Verify your email to sign in. Check your inbox for the confirmation link.",
      403,
      "NEEDS_VERIFICATION",
      { email: user.email, verificationMethod },
    );
  }

  await db.execute("UPDATE users SET is_online = 1 WHERE id = ?", [user.id]);

  const [profileRows] = await db.execute("SELECT avatar_url FROM user_profiles WHERE user_id = ?", [
    user.id,
  ]);
  const latestAvatar = profileRows[0]?.avatar_url || user.avatar_url || null;

  return { user, latestAvatar };
}

// ─── GOOGLE LOGIN ───
async function googleLogin(code) {
  const { tokens } = await googleClient.getToken({ code, redirect_uri: "postmessage" });
  if (!tokens.id_token) {
    throw new AppError("No ID token returned from Google", 401, "GOOGLE_AUTH_FAILED");
  }

  const ticket = await googleClient.verifyIdToken({
    idToken: tokens.id_token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  const { name } = payload;
  const email = normEmail(payload.email);
  if (!email) {
    throw new AppError("Google account has no email", 401, "GOOGLE_AUTH_FAILED");
  }
  if (payload.email_verified !== true) {
    throw new AppError("Google email is not verified", 401, "GOOGLE_AUTH_FAILED");
  }

  const [users] = await db.execute(LOGIN_USER_SELECT, [email]);

  let user;
  let isNewUser = false;
  if (users.length === 0) {
    // Password is a random bcrypt secret (never known, never used for login) —
    // recovery goes through the email-OTP forgot-password flow.
    const salt = await bcrypt.genSalt(10);
    const randomHashedPw = await bcrypt.hash(crypto.randomBytes(16).toString("hex"), salt);
    const defaultGoal = "Unspecified (Google Auth)";

    const [insertResult] = await db.execute(
      "INSERT INTO users (name, email, password, fitness_goal, is_online, avatar_url, is_verified, onboarding_completed, role, accepted_terms_at, accepted_terms_version) VALUES (?, ?, ?, ?, ?, ?, 1, 0, ?, NOW(), ?)",
      [name, email, randomHashedPw, defaultGoal, 0, null, isSeedAdmin(email) ? "admin" : "member", CONSENT_VERSION],
    );

    const [newUsers] = await db.execute(
      "SELECT id, name, email, fitness_goal, avatar_url, is_verified, onboarding_completed, token_version, status, role FROM users WHERE id = ?",
      [insertResult.insertId],
    );
    user = newUsers[0];
    isNewUser = true;
    queueWelcomeEmail(email, name, { provider: "google" });
  } else {
    user = users[0];
  }

  // Google already proved ownership of this address (email_verified checked
  // above), so a pending email-signup account is verified by a Google sign-in.
  if (!user.is_verified) {
    await markVerified(user);
  }

  await db.execute("UPDATE users SET is_online = 1 WHERE id = ?", [user.id]);

  const [profileRows] = await db.execute("SELECT avatar_url FROM user_profiles WHERE user_id = ?", [
    user.id,
  ]);
  const profileAvatar = profileRows[0]?.avatar_url || null;
  // Avatars are the user's own upload or, by default, a lettered circle. The
  // Google account photo is deliberately NOT adopted (often Google's generic
  // placeholder, and never something the user chose inside Vitalis).
  const latestAvatar = profileAvatar || user.avatar_url || null;

  return { user, latestAvatar, isNewUser };
}

// ─── CHANGE PASSWORD ───
// Shared behavior with the forgot-password reset: same hashing, same
// token_version bump (revoke every previously issued cookie) and the same
// "sign out all devices" bookkeeping. Difference: the caller re-issues the
// CURRENT device's cookie afterwards, so this device stays signed in.
async function changePassword(userId, currentPassword, newPassword) {
  const [rows] = await db.execute("SELECT password FROM users WHERE id = ?", [userId]);
  if (rows.length === 0) throw new AppError("User not found", 404, "USER_NOT_FOUND");

  const isMatch = await bcrypt.compare(currentPassword, rows[0].password);
  if (!isMatch) {
    throw new AppError("Current password is incorrect", 401, "INVALID_PASSWORD");
  }

  const salt = await bcrypt.genSalt(10);
  const newHash = await bcrypt.hash(newPassword, salt);
  // Bump token_version: every previously issued cookie is rejected by
  // verifyUser from this point on (true revocation, not just flags).
  await db.execute("UPDATE users SET password = ?, token_version = token_version + 1 WHERE id = ?", [
    newHash,
    userId,
  ]);
  await db.execute("UPDATE user_sessions SET is_current = 0 WHERE user_id = ?", [userId]);

  // Fresh identity for the re-issued session cookie + the security email.
  const [[fresh]] = await db.execute(
    "SELECT name, email, token_version FROM users WHERE id = ?",
    [userId],
  );
  return { name: fresh.name, email: fresh.email, tokenVersion: Number(fresh.token_version) };
}

// ─── LOGOUT ───
async function logout(userId) {
  if (!userId) return;
  // Bump token_version so the logged-out cookie can never be replayed.
  await db.execute("UPDATE users SET is_online = 0, token_version = token_version + 1 WHERE id = ?", [
    userId,
  ]);
  await db.execute("UPDATE user_sessions SET is_current = 0 WHERE user_id = ?", [userId]);
}

// ─── RESEND VERIFICATION ───
// Returns null when nothing should be sent (unknown / already verified) so the
// controller can keep the response identical (anti-enumeration).
async function resendVerification(email) {
  const [users] = await db.execute("SELECT id, name, is_verified FROM users WHERE email = ?", [
    email,
  ]);
  if (users.length === 0) return null;
  const user = users[0];
  if (user.is_verified) return null;

  const { link } = await createVerificationToken(user.id);
  let emailed = false;
  let deliveryToken = null;
  try {
    const receipt = await sendVerificationEmail(email, link);
    emailed = true;
    deliveryToken = trackingToken(receipt?.messageId);
  } catch (mailErr) {
    console.error("Verification email failed:", mailErr.message);
  }
  return { link, emailed, deliveryToken };
}

// ─── VERIFY EMAIL ───
async function verifyEmail(token) {
  const tokenHash = crypto.createHash("sha256").update(String(token)).digest("hex");
  const [rows] = await db.execute(
    `SELECT v.id, v.user_id, v.used, v.expires_at <= NOW() AS expired, u.is_verified
     FROM email_verifications v JOIN users u ON u.id = v.user_id
     WHERE v.token_hash = ? LIMIT 1`,
    [tokenHash],
  );
  if (rows.length === 0) {
    throw new AppError(
      "This verification link is invalid. Request a new one.",
      400,
      "INVALID_TOKEN",
    );
  }
  const verification = rows[0];
  // A known link for an already-confirmed account is safe to open again, but
  // only the click that actually verifies the account may start a session.
  if (verification.is_verified) return { userId: verification.user_id, justVerified: false };
  if (verification.used) {
    throw new AppError("This verification link was replaced. Request a new one.", 400, "INVALID_TOKEN");
  }
  if (verification.expired) {
    throw new AppError("This verification link has expired. Request a new one.", 400, "EXPIRED_TOKEN");
  }
  // Recheck validity in the write so an email change cannot race this lookup.
  const [result] = await db.execute(
    `UPDATE users u JOIN email_verifications v ON v.user_id = u.id
     SET u.is_verified = 1
     WHERE v.id = ? AND v.used = 0 AND v.expires_at > NOW() AND u.is_verified = 0`,
    [verification.id],
  );
  if (!result.affectedRows) {
    // Lost a race with another click (or an email change): never a session.
    const current = await getMe(verification.user_id);
    if (current?.is_verified) return { userId: verification.user_id, justVerified: false };
    throw new AppError("This verification link is no longer valid. Request a new one.", 400, "INVALID_TOKEN");
  }
  return { userId: verification.user_id, justVerified: true };
}

// ─── CHANGE EMAIL (typo fix, unverified accounts only) ───
async function changeEmail({ email, password, newEmail }) {
  const genericFail = () => new AppError("Invalid credentials or account state.", 400, "GENERIC_FAIL");

  const [users] = await db.execute(
    "SELECT id, email, password, is_verified FROM users WHERE email = ?",
    [String(email).toLowerCase()],
  );
  if (users.length === 0) throw genericFail();
  const user = users[0];
  if (user.is_verified) throw genericFail();

  const isMatch = await bcrypt.compare(password, user.password);
  // Anti-enumeration: wrong password returns the same generic 400 as
  // unknown account / already-verified.
  if (!isMatch) throw genericFail();

  const normalized = String(newEmail).toLowerCase().trim();
  const oldEmail = String(user.email).toLowerCase();
  if (normalized === oldEmail) throw genericFail();

  try {
    // Retire old-inbox links before changing the address. Resends alone do not.
    await db.execute("DELETE FROM email_verifications WHERE user_id = ?", [user.id]);
    await db.execute("UPDATE users SET email = ? WHERE id = ?", [normalized, user.id]);
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      throw new AppError("That email is already registered.", 400, "EMAIL_EXISTS");
    }
    throw err;
  }

  // Notify the OLD inbox best-effort (typo address may bounce — never fail).
  try {
    await sendEmailChangedNotice(oldEmail, normalized);
  } catch (noticeErr) {
    console.warn("Change-email notice to old address failed:", noticeErr.message);
  }

  const { link } = await createVerificationToken(user.id);
  let emailed = false;
  let deliveryToken = null;
  try {
    const receipt = await sendVerificationEmail(normalized, link);
    emailed = true;
    deliveryToken = trackingToken(receipt?.messageId);
  } catch (mailErr) {
    console.error("Verification email failed:", mailErr.message);
  }

  return { normalized, link, emailed, deliveryToken };
}

// ─── COMPLETE ONBOARDING ───
// `allergies` (optional array from the onboarding wizard) replaces the user's
// allergy list. It is auxiliary data: if the table is missing (pre-migration)
// we log loudly instead of throwing, so the onboarding flag still gets set.
async function completeOnboarding(userId, allergies) {
  await db.execute("UPDATE users SET onboarding_completed = 1 WHERE id = ?", [userId]);
  if (Array.isArray(allergies)) {
    try {
      await allergiesService.setAllergies(userId, allergies);
    } catch (e) {
      console.error("[allergies] save failed — run db:migrate (033_user_allergies):", e.message);
    }
  }
}

// Read-only passthrough so Profile > Personalization can display current
// allergies. Best-effort by design: getAllergies returns [] on any DB failure.
async function getAllergies(userId) {
  return allergiesService.getAllergies(userId);
}

module.exports = {
  // helpers
  normEmail,
  resolveFrontendUrl: frontendUrl,
  frontendUrl,
  DEV_VERIFY_FALLBACK,
  skipEmailVerification,
  createVerificationToken,
  checkRateLimit,
  recordFailedAttempt,
  clearAttempts,
  logUserSession,
  // handlers
  getMe,
  register,
  login,
  deactivateAccount,
  reactivateAccount,
  googleLogin,
  changePassword,
  logout,
  resendVerification,
  verifyEmail,
  changeEmail,
  completeOnboarding,
  getAllergies,
};
