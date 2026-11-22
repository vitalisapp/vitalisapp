// Auth — thin controller. Logic + DB live in services/auth.service.js.
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const { z } = require("zod");
const { COOKIE_NAME, getCookieOptions, getClearCookieOptions } = require("../utils/cookies");
const service = require("../services/auth.service");
const emailService = require("../services/email.service");
const phoneVerification = require("../services/phoneVerification.service");
const notificationController = require("./notification.controller");
const accessGroups = require("../services/accessGroups.service");

const { normEmail, DEV_VERIFY_FALLBACK } = service;

// ─── COOKIE HELPER (single source: src/utils/cookies.js) ───
function setSessionCookie(res, userId, email, req, tv = 0) {
  const { signSession } = require("../config/jwt");
  const token = signSession(jwt, { id: userId, email, tv });
  const opts = getCookieOptions(req);
  res.cookie(COOKIE_NAME, token, opts);
  if (process.env.NODE_ENV !== "production") {
    console.log(
      `[cookie] set uid=${userId} secure=${opts.secure} sameSite=${opts.sameSite} ` +
        `partitioned=${Boolean(opts.partitioned)} proto=${req.headers?.["x-forwarded-proto"] || "-"}`,
    );
  }
  return token;
}

// In-app security notice when a genuinely new device signs in. Best-effort and
// fire-and-forget: it must never delay or fail the login response. Skipped for
// the account's very first device (that is not a surprise sign-in).
function notifyNewDevice(userId, session) {
  if (!session?.isNewDevice || !(session.priorSessions > 0)) return;
  notificationController
    .notifyUser(userId, {
      message: `New sign-in from ${session.deviceLabel}. If this wasn't you, review your devices in Profile → Devices & Sessions.`,
      type: "warning",
      category: "SYSTEM",
      source: "auth",
    })
    .catch(() => {});
}

// IP-based brute-force guard (primary) — per-email Map in the service is layer 2.
const loginIpLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many login attempts. Try again in a minute." },
});

// ─── VALIDATION SCHEMAS ───
const registerSchema = z.object({
  name: z.string().trim().min(2, "Name too short").max(100),
  email: z.string().trim().toLowerCase().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
  // Module 1 — explicit consent flag must survive schema validation.
  agreed: z.boolean().optional().default(false),
  // Registration verification channel. 'email' keeps the existing link flow.
  verificationMethod: z.enum(["email", "sms"]).optional().default("email"),
  // Only required when verificationMethod === 'sms'; validated in the service
  // so both formats (09XXXXXXXXX / +639XXXXXXXXX) are accepted.
  phone: z.string().trim().max(24).optional(),
  // Optional admin access-QR code (?g=CODE). Unknown/expired codes are ignored.
  accessCode: z.string().trim().max(16).optional(),
});

const smsOtpSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email address"),
  // Optional: the code is sent to the number already stored on the account.
  phone: z.string().trim().max(24).optional(),
});

const smsVerifySchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email address"),
  code: z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit code"),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email address"),
  password: z.string().min(1, "Password is required").max(128),
});

const googleLoginSchema = z.object({
  code: z.string().trim().min(1, "Google auth code is required").max(4096),
  accessCode: z.string().trim().max(16).optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required").max(128),
  newPassword: z.string().min(8, "New password must be at least 8 characters").max(128),
});

const changeEmailSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email address"),
  password: z.string().min(1, "Password is required").max(128),
  newEmail: z.string().trim().toLowerCase().email("Invalid new email address"),
});

// ─── GET /api/auth/me ───
// Session probe. Returns 401 (not 200-null) for missing/dead sessions so the
// frontend 401-funnel fires and stale cookies are dropped.
async function getme(req, res, next) {
  try {
    const token = req.cookies?.[COOKIE_NAME];

    // Codes distinguish "browser never sent the cookie" (NO_COOKIE) from
    // "cookie sent but dead" (INVALID_SESSION).
    if (!token) {
      if (process.env.NODE_ENV !== "production") {
        const h = req.headers || {};
        console.log(
          `[me] NO_COOKIE origin=${h.origin || "-"} referer=${String(h.referer || "-").slice(0, 80)} ` +
            `cookieHeader=${req.headers.cookie ? `present(${req.headers.cookie.length}c)` : "absent"}`,
        );
      }
      return res.status(401).json({ error: "Unauthorized", code: "NO_COOKIE", user: null });
    }

    try {
      const { verifySession } = require("../config/jwt");
      const decoded = verifySession(jwt, token);

      const user = await service.getMe(decoded.id);

      if (!user) {
        res.clearCookie(COOKIE_NAME, getClearCookieOptions(req));
        return res
          .status(401)
          .json({ error: "Invalid session", code: "INVALID_SESSION", user: null });
      }

      // Revocation gate (mirrors verifyUser). is_verified is intentionally NOT
      // enforced — unverified users get 200 with isVerified:false.
      if (Number(user.token_version || 0) !== Number(decoded.tv || 0)) {
        res.clearCookie(COOKIE_NAME, getClearCookieOptions(req));
        return res.status(401).json({
          error: "Session revoked. Please sign in again.",
          code: "SESSION_REVOKED",
          user: null,
        });
      }
      res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          goal: user.fitness_goal,
          isVerified: Boolean(user.is_verified),
          onboardingCompleted: Boolean(user.onboarding_completed),
          // Module 1 — governance fields surfaced to the Profile page.
          role: user.role,
          status: user.status,
          acceptedTermsAt: user.accepted_terms_at,
          acceptedTermsVersion: user.accepted_terms_version,
        },
      });
    } catch (err) {
      res.clearCookie(COOKIE_NAME, getClearCookieOptions(req));
      return res
        .status(401)
        .json({ error: "Invalid session", code: "INVALID_SESSION", user: null });
    }
  } catch (e) {
    next(e);
  }
}

async function postregister(req, res, next) {
  try {
    const { name, password } = req.body;
    // Normalize email BEFORE any DB touch — never trust raw casing.
    const email = normEmail(req.body?.email);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "Invalid email address" });
    }
    // Module 1 — consent is a hard requirement, recorded server-side with a
    // version stamp; the client checkbox alone is not an audit trail.
    if (req.body?.agreed !== true) {
      return res.status(400).json({ error: "You must accept the Terms of Use and Privacy Policy" });
    }

    try {
      const { link, emailed, deliveryToken, autoVerified, user, verificationMethod } = await service.register({
        name,
        email,
        password,
        phone: req.body?.phone,
        verificationMethod: req.body?.verificationMethod || "email",
      });

      // Admin access QR: tag the new account with its group (fail-soft).
      if (req.body?.accessCode) await accessGroups.tagUser(user.id, req.body.accessCode);

      // SMS branch: send the 6-digit code now. A provider outage must not
      // destroy the account — the user can request another code from the
      // verification screen.
      let smsDelivery = null;
      if (!autoVerified && verificationMethod === "sms") {
        try {
          smsDelivery = await phoneVerification.sendCode({ email, phone: user.phone });
        } catch (smsErr) {
          // Operational provider errors are reported on the verification
          // screen, not as a failed registration.
          console.error("SMS verification send failed:", smsErr.code || smsErr.message);
        }
      }

      // Verification is a hard gate: only auto-verified accounts (development)
      // get a session now. Everyone else must confirm the email link or the
      // SMS code first, then sign in.
      if (autoVerified) {
        setSessionCookie(res, user.id, user.email, req, user.token_version);
        await service.logUserSession(req, user.id);
      }

      /** @type {{ success: boolean, message: string, id: number, name: string, email: string, avatar: string|null, goal: string, isVerified: boolean, onboardingCompleted: boolean, role: string, status: string, acceptedTermsAt: string|null, acceptedTermsVersion: number|null, needsVerification: boolean, verificationMethod: string, phoneMasked?: string, devVerificationLink?: string }} */
      const payload = {
        success: true,
        message: autoVerified
          ? "Account created. You're signed in."
          : verificationMethod === "sms"
            ? "Account created. Enter the code we texted you to activate it."
            : "Account created. Check your inbox and confirm your email to activate it.",
        // Same shape /login and /me return so AuthContext stays consistent.
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar_url || null,
        goal: user.fitness_goal,
        isVerified: Boolean(user.is_verified),
        onboardingCompleted: Boolean(user.onboarding_completed),
        role: user.role,
        status: user.status,
        acceptedTermsAt: user.accepted_terms_at,
        acceptedTermsVersion: user.accepted_terms_version,
        // true → no session was issued; the client opens the verify screen.
        needsVerification: !autoVerified,
        verificationMethod: autoVerified ? null : verificationMethod,
        deliveryToken,
        // Email signups: the welcome/verify email is sent in the background.
        deliveryStatus: autoVerified ? 'skipped' : verificationMethod === "sms" ? (smsDelivery ? 'accepted' : 'failed') : emailed ? 'queued' : 'failed',
      };
      if (smsDelivery) {
        payload.phoneMasked = smsDelivery.phoneMasked;
        payload.retryAfter = smsDelivery.retryAfter;
        payload.expiresIn = smsDelivery.expiresIn;
        payload.smsMocked = smsDelivery.mocked;
      }
      if (!autoVerified && verificationMethod === "email" && DEV_VERIFY_FALLBACK) {
        payload.devVerificationLink = link;
      }
      res.status(201).json(payload);
    } catch (err) {
      if (err.isOperational) return res.status(err.status).json({ error: err.message, code: err.code, details: err.details });
      console.error("Register error:", err.code || err.message);
      next(err);
    }
  } catch (e) {
    next(e);
  }
}

async function postlogin(req, res, next) {
  try {
    const { password } = req.body;
    const email = normEmail(req.body?.email);

    try {
      const { user, latestAvatar } = await service.login({ email, password });

      setSessionCookie(res, user.id, user.email, req, user.token_version);
      const session = await service.logUserSession(req, user.id);
      notifyNewDevice(user.id, session);

      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: latestAvatar,
        goal: user.fitness_goal,
        isVerified: Boolean(user.is_verified),
        onboardingCompleted: Boolean(user.onboarding_completed),
        // Module 1 — keep the auth-context user shape identical to /me.
        role: user.role,
        status: user.status,
        acceptedTermsAt: user.accepted_terms_at,
        acceptedTermsVersion: user.accepted_terms_version,
      });
    } catch (err) {
      if (err.isOperational) {
        const body = { error: err.message };
        if (err.code === "RATE_LIMITED" && err.details?.retryAfter) {
          body.retryAfter = err.details.retryAfter;
        }
        if (err.code === "NEEDS_VERIFICATION") {
          body.code = "NEEDS_VERIFICATION";
          body.email = err.details?.email;
          body.verificationMethod = err.details?.verificationMethod;
          body.details = { email: body.email, verificationMethod: body.verificationMethod };
        }
        if (err.code === "ACCOUNT_DEACTIVATED") {
          body.code = "ACCOUNT_DEACTIVATED";
        }
        return res.status(err.status).json(body);
      }
      console.error("Login error:", err.code || err.message);
      next(err);
    }
  } catch (e) {
    next(e);
  }
}

async function postgoogleLogin(req, res, next) {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: "Missing authorization code" });
    }

    try {
      const { user, latestAvatar, isNewUser } = await service.googleLogin(code);
      // Only brand-new Google accounts join an access group.
      if (isNewUser && req.body?.accessCode) await accessGroups.tagUser(user.id, req.body.accessCode);

      setSessionCookie(res, user.id, user.email, req, user.token_version);
      const session = await service.logUserSession(req, user.id);
      notifyNewDevice(user.id, session);

      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: latestAvatar,
        goal: user.fitness_goal,
        isVerified: Boolean(user.is_verified),
        onboardingCompleted: Boolean(user.onboarding_completed),
        role: user.role,
        status: user.status,
        isNewUser: Boolean(isNewUser),
      });
    } catch (err) {
      // Known provider states keep their specific message; anything else is
      // masked so tokens/audience details never leak to the client.
      if (err.isOperational && err.code !== "GOOGLE_AUTH_FAILED") {
        return res.status(err.status).json({ error: err.message });
      }
      console.error("Google Login Error:", err.code || err.message);
      return res
        .status(401)
        .json({ error: "Google authentication failed", code: "GOOGLE_AUTH_FAILED" });
    }
  } catch (e) {
    next(e);
  }
}

async function postchangePassword(req, res, next) {
  try {
    // verifyUser middleware already populated req.user — use it as source of truth.
    const userId = req.user?.id || null;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: "New password must be at least 8 characters" });
    }

    try {
      const result = await service.changePassword(userId, currentPassword, newPassword);
      const changedAt = new Date().toISOString();

      // Keep THIS device signed in: re-issue the session cookie with the fresh
      // token_version (all other devices were just revoked by the bump).
      setSessionCookie(res, userId, result.email, req, result.tokenVersion);

      // 1) In-app notification — fail-soft, never blocks the response.
      try {
        await notificationController.notifyUser(userId, {
          message: "Your password was changed. All other devices were signed out — if this wasn't you, secure your account now.",
          type: "warning",
          category: "SYSTEM",
        });
      } catch (notifErr) {
        console.error("[change-password] notification failed:", notifErr.message);
      }

      // 2) Security-alert email — distinct reusable template; fail-soft so a
      // mail hiccup can never undo a completed password change.
      let emailSent = false;
      try {
        await emailService.sendPasswordChangedEmail(
          result.email,
          result.name,
          service.frontendUrl(),
          changedAt,
        );
        emailSent = true;
      } catch (mailErr) {
        console.error("[change-password] security email failed:", mailErr.message);
      }

      res.json({
        success: true,
        message: "Password updated — other devices were signed out",
        emailSent,
      });
    } catch (err) {
      if (err.isOperational) return res.status(err.status).json({ error: err.message });
      console.error("Change Password Error:", err.code || err.message);
      next(err);
    }
  } catch (e) {
    next(e);
  }
}

async function postlogout(req, res, next) {
  try {
    const token = req.cookies?.[COOKIE_NAME];

    if (token) {
      try {
        const { verifySession } = require("../config/jwt");
        const decoded = verifySession(jwt, token);
        if (decoded?.id) await service.logout(decoded.id);
      } catch (_) {}
    }

    res.clearCookie(COOKIE_NAME, getClearCookieOptions(req));
    res.json({ success: true, message: "User logged out." });
  } catch (e) {
    next(e);
  }
}

// ─── POST /api/auth/send-verification { email } — (re)send verification link
async function postsendVerification(req, res, next) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });
    const normalized = String(email).toLowerCase().trim();

    // Anti-enumeration: identical response whether or not the account exists.
    const generic = {
      success: true,
      message: "If this account needs verification, a delivery request has been made. Check your inbox.",
      email: normalized,
    };

    const result = await service.resendVerification(normalized);
    if (!result) return res.json(generic);

    /** @type {{ success: boolean, message: string, email: string, devVerificationLink?: string }} */
    const payload = { ...generic, deliveryToken: result.deliveryToken, deliveryStatus: result.emailed ? 'accepted' : 'failed' };
    if (!result.emailed && DEV_VERIFY_FALLBACK) payload.devVerificationLink = result.link;
    res.json(payload);
  } catch (e) {
    next(e);
  }
}

// ─── POST /api/auth/sms-otp { email, phone? } — send a 6-digit SMS code
// Used by the registration screen and its "resend" button. Rate limiting is
// layered: IP limiter in the route, per-account cooldown/hourly cap in the
// service. The code itself never appears in this response.
async function postsmsOtp(req, res, next) {
  try {
    const email = normEmail(req.body?.email);
    const result = await phoneVerification.sendCode({ email, phone: req.body?.phone });
    res.json({
      success: true,
      message: `We sent a 6-digit code to ${result.phoneMasked}.`,
      phoneMasked: result.phoneMasked,
      retryAfter: result.retryAfter,
      expiresIn: result.expiresIn,
      mocked: result.mocked,
    });
  } catch (err) {
    if (err.isOperational) {
      return res.status(err.status).json({ error: err.message, code: err.code, details: err.details });
    }
    console.error("SMS OTP send error:", err.code || err.message);
    next(err);
  }
}

// ─── POST /api/auth/sms-verify { email, code } — verify the SMS code
// Registration-only flow: a successful code activates the account but does
// not create a session — the user then signs in with email + password.
async function postsmsVerify(req, res, next) {
  try {
    const email = normEmail(req.body?.email);
    const user = await phoneVerification.verifyCode({ email, code: req.body?.code });
    res.json({
      success: true,
      message: "Phone verified. Your Vitalis account is now active — sign in to continue.",
      email: user.email,
      phoneMasked: user.phone_masked,
    });
  } catch (err) {
    if (err.isOperational) {
      return res.status(err.status).json({ error: err.message, code: err.code, details: err.details });
    }
    console.error("SMS OTP verify error:", err.code || err.message);
    next(err);
  }
}

// ─── GET /api/auth/verify-email?token=... — activate account via link
async function getverifyEmail(req, res, next) {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ error: "Verification token is required" });
    try {
      await service.verifyEmail(token);
      res.json({
        success: true,
        message: "Email verified. Your Vitalis account is now active.",
      });
    } catch (err) {
      if (err.isOperational) return res.status(err.status).json({ error: err.message, code: err.code });
      next(err);
    }
  } catch (e) {
    next(e);
  }
}

// ─── PATCH /api/auth/change-email — fix a typo before verifying
async function patchchangeEmail(req, res, next) {
  try {
    const { email, password, newEmail } = req.body;
    if (!email || !password || !newEmail) {
      return res
        .status(400)
        .json({ error: "Current email, password and new email are required" });
    }

    try {
      const { normalized, link, emailed, deliveryToken } = await service.changeEmail({
        email,
        password,
        newEmail,
      });
      /** @type {{ success: boolean, message: string, email: string, devVerificationLink?: string }} */
      const payload = {
        success: true,
        message: "Email updated. Check your new inbox to verify.",
        email: normalized,
        deliveryToken,
        deliveryStatus: emailed ? 'accepted' : 'failed',
      };
      if (!emailed && DEV_VERIFY_FALLBACK) payload.devVerificationLink = link;
      res.json(payload);
    } catch (err) {
      if (err.isOperational) return res.status(err.status).json({ error: err.message });
      console.error("Change Email Error:", err.code || err.message);
      next(err);
    }
  } catch (e) {
    next(e);
  }
}

// ─── POST /api/auth/complete-onboarding — mark onboarding done
async function postcompleteOnboarding(req, res, next) {
  try {
    // Body may carry the wizard's allergy list; absent/{} means "don't touch it".
    const { allergies } = req.body || {};
    await service.completeOnboarding(req.user.id, allergies);
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
}

// ─── MODULE 1 — ACCOUNT GOVERNANCE ───
// POST /api/auth/deactivate — password-confirmed soft deactivation. The server
// bumps token_version so every session (this device included) dies instantly;
// the cookie is cleared so the browser drops the session too. Data is kept.
async function postDeactivate(req, res, next) {
  try {
    const { password } = req.body || {};
    if (!password) {
      return res.status(400).json({ error: "Password confirmation is required" });
    }
    await service.deactivateAccount(req.user.id, password);
    // Session is already revoked server-side — drop the cookie client-side.
    res.clearCookie(COOKIE_NAME, getClearCookieOptions(req));
    res.json({
      success: true,
      message: "Account deactivated. Your data is safe — sign in again to reactivate.",
    });
  } catch (err) {
    if (err.isOperational) {
      return res.status(err.status).json({ error: err.message, code: err.code });
    }
    next(err);
  }
}

// POST /api/auth/reactivate — credential-verified flip back to active. Does
// NOT log the user in; the client follows up with a normal login so session
// logging/cookies stay on the happy path.
async function postReactivate(req, res, next) {
  try {
    const { email: rawEmail, password } = req.body || {};
    if (!rawEmail || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    await service.reactivateAccount({ email: normEmail(rawEmail), password });
    res.json({ success: true, message: "Account reactivated. Sign in to continue." });
  } catch (err) {
    if (err.isOperational) {
      const body = { error: err.message, code: err.code };
      return res.status(err.status).json(body);
    }
    next(err);
  }
}

// ─── GET /api/auth/allergies — read the saved allergy list (read-only).
// Lets Profile > Personalization show current allergies; writes still go
// through POST /complete-onboarding (setAllergies = whole-list replace).
async function getallergies(req, res, next) {
  try {
    const allergies = await service.getAllergies(req.user.id);
    res.json({ allergies });
  } catch (e) {
    next(e);
  }
}

module.exports = {
  getme,
  postregister,
  postlogin,
  postgoogleLogin,
  postchangePassword,
  postlogout,
  postsendVerification,
  postsmsOtp,
  postsmsVerify,
  getverifyEmail,
  patchchangeEmail,
  postcompleteOnboarding,
  getallergies,
  postDeactivate,
  postReactivate,
  registerSchema,
  loginSchema,
  googleLoginSchema,
  smsOtpSchema,
  smsVerifySchema,
  changePasswordSchema,
  changeEmailSchema,
  loginIpLimiter,
};
