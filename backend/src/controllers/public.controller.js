// Landing page needs REAL numbers (athletes, active users, workouts, meals,
// posts, plans, site visits) without leaking any PII. Only COUNT(*) +
// public plan catalog rows. Clauses are hardcoded (never user input).
// Short in-memory cache (60s) so the landing can't hammer the DB.
const crypto = require('crypto');
const db = require('../config/db');

const CACHE_TTL_MS = 60 * 1000;
let cache = { at: 0, payload: null };

async function safeCount(table) {
  try {
    const [[row]] = await db.execute(`SELECT COUNT(*) AS n FROM \`${table}\``);
    return Number(row?.n || 0);
  } catch {
    return 0;
  }
}

// Active users = verified accounts (past email verification, actually able to
// use the system). Hardcoded clause — never built from request input.
async function safeActiveUserCount() {
  try {
    const [[row]] = await db.execute(
      'SELECT COUNT(*) AS n FROM `users` WHERE `is_verified` = 1'
    );
    return Number(row?.n || 0);
  } catch {
    return 0;
  }
}

async function getlandingStats(req, res, next) {
  try {
    if (cache.payload && Date.now() - cache.at < CACHE_TTL_MS) {
      return res.json(cache.payload);
    }

    const [athletes, activeUsers, plans, workouts, activities, meals, posts, checkins, visits] = await Promise.all([
      safeCount('users'),
      safeActiveUserCount(),
      safeCount('plans'),
      safeCount('workout_logs'),
      safeCount('activity_logs'),
      safeCount('food_logs'),
      safeCount('community_posts'),
      safeCount('daily_checkins'),
      safeCount('landing_visits'),
    ]);

    let featuredPlans = [];
    try {
      const [rows] = await db.execute(
        'SELECT id, COALESCE(title, name) AS title, tag, difficulty, duration_days FROM plans ORDER BY id ASC LIMIT 6'
      );
      featuredPlans = rows;
    } catch {
      featuredPlans = [];
    }

    const payload = {
      stats: { athletes, activeUsers, plans, workouts, activities, meals, posts, checkins, visits },
      plans: featuredPlans,
      time: new Date().toISOString(),
    };
    cache = { at: Date.now(), payload };
    res.json(payload);
  } catch (e) { next(e); }
}

// POST /api/public/landing-visit — record one unique-per-day site visit.
// Privacy-friendly: only a salted SHA-256 of the client IP + current date is
// stored (UNIQUE(ip_hash, visit_date) dedupes refreshes / repeat views).
// Returns the running total so the landing can show a real visitor count.
async function postVisit(req, res, next) {
  try {
    const rawIp = String(req.ip || req.headers['x-forwarded-for']?.split(',')[0] || 'unknown').trim().slice(0, 128);
    // Dedicated salt first (set IP_HASH_SALT in prod); fallback keeps old hashes working.
    const salt = String(process.env.IP_HASH_SALT || process.env.JWT_SECRET || 'vitalis-visit-salt').slice(0, 32);
    const ipHash = crypto.createHash('sha256').update(`${rawIp}|${salt}`).digest('hex');
    try {
      await db.execute(
        'INSERT IGNORE INTO `landing_visits` (`ip_hash`, `visit_date`) VALUES (?, CURDATE())',
        [ipHash]
      );
    } catch {
      // Table missing (migration not run yet) — still return a usable payload.
    }
    const visits = await safeCount('landing_visits');
    // Visit writes change the total — bust the stats cache so the next
    // landing-stats fetch includes this visit.
    cache = { at: 0, payload: null };
    res.json({ success: true, visits });
  } catch (e) { next(e); }
}

module.exports = { getlandingStats, postVisit };
