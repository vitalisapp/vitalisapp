
const db = require('../config/db');
const log = require('../utils/logger');
// GET /api/security - fetch all sessions for the logged in user

async function get(req,res,next){
  try{
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ error: 'Not authenticated' });
    
        try {
            let rows;
            try {
              [rows] = await db.execute(`
                SELECT
                    id,
                    device      AS device_type,
                    browser,
                    os,
                    ip_address,
                    location    AS city,
                    ''          AS country,
                    created_at  AS last_active,
                    is_current
                FROM user_sessions
                WHERE user_id = ?
                ORDER BY created_at DESC
                LIMIT 50
              `, [userId]);
            } catch (e) {
              // Fallback for DBs where location column also missing (defensive)
              if (e.code === 'ER_BAD_FIELD_ERROR') {
                const [fallback] = await db.execute(`
                  SELECT
                      id,
                      device      AS device_type,
                      browser,
                      os,
                      ip_address,
                      ''          AS city,
                      ''          AS country,
                      created_at  AS last_active,
                      is_current
                  FROM user_sessions
                  WHERE user_id = ?
                  ORDER BY created_at DESC
                  LIMIT 50
                `, [userId]);
                rows = fallback;
              } else throw e;
            }
    
            res.json(rows);
    
        } catch (err) {
            log.error('fetch sessions error:', err.message);
            next(err);
        }
  }catch(e){ next(e); }
}

async function deleteSessionId(req,res,next){
  try{
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ error: 'Not authenticated' });
        const sessionId = Number(req.params.sessionId);
        if (!Number.isInteger(sessionId) || sessionId <= 0) {
          return res.status(400).json({ error: 'Invalid session id' });
        }
    
        try {
            // user_id check makes sure you can only delete your own sessions.
            // JWTs are stateless and carry only {id, email, tv} — no session id —
            // so deleting the row alone cannot kill that device's cookie.
            // Fail closed: bump token_version FIRST (revokes every cookie, same
            // as logout-everywhere), then remove the row. The caller is revoked
            // too and must sign in again — the message says exactly that.
            // True single-device revocation (kill one cookie, keep the rest)
            // needs a session-id ↔ JWT binding = schema + payload change,
            // deliberately not done here.
            // Existence check first: a bogus id must be a side-effect-free
            // 404, never a token_version bump (fail closed, no-op safe).
            const [existing] = await db.execute(
              'SELECT id FROM user_sessions WHERE id = ? AND user_id = ? LIMIT 1',
              [sessionId, userId]
            );
            if (existing.length === 0) {
              return res.status(404).json({ error: 'Session not found' });
            }
            await db.execute(`
                UPDATE users SET token_version = token_version + 1 WHERE id = ?
            `, [userId]);
            await db.execute(`
                DELETE FROM user_sessions
                WHERE id = ? AND user_id = ?
            `, [sessionId, userId]);

            res.json({ success: true, message: 'Session removed. All sessions were revoked for safety — sign in again on your devices.' });
    
        } catch (err) {
            log.error('delete session error:', err.message);
            next(err);
        }
  }catch(e){ next(e); }
}

module.exports = { get, deleteSessionId };
