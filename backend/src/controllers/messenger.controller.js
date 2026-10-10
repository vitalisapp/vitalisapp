const db = require('../config/db');
const log = require('../utils/logger');
const { validId } = require('../utils/ids');
const { AppError } = require('../utils/errors');

async function getcontactsUserId(req, res, next) {
  try {
    const userId = validId(req.params.userId);
    if (!userId) return res.status(400).json({ error: 'Invalid user id' });
    if (userId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    try {
      const query = `
                SELECT DISTINCT u.id, u.name, COALESCE(p.avatar_url, u.avatar_url) AS avatar_url, u.is_online, u.fitness_goal
                FROM users u
                LEFT JOIN user_profiles p ON p.user_id = u.id
                INNER JOIN friendships f ON (f.friend_id = u.id OR f.user_id = u.id)
                WHERE (f.user_id = ? OR f.friend_id = ?)
                AND f.status IN ('accepted', 'close_friend')
                AND u.id != ?
            `;
      const [rows] = await db.execute(query, [userId, userId, userId]);
      res.json(rows);
    } catch (err) {
      log.error('Contacts Error:', err);
      next(err);
    }
  } catch (e) {
    next(e);
  }
}

async function getmessagesUserIdContactId(req, res, next) {
  try {
    const userId = validId(req.params.userId);
    const contactId = validId(req.params.contactId);
    if (!userId || !contactId) return res.status(400).json({ error: 'Invalid user or contact id' });
    if (userId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 50) || 50));
    const beforeRaw = req.query.before;
    let before = null;
    let beforeValid = false;
    if (beforeRaw !== undefined && beforeRaw !== null && beforeRaw !== '') {
      before = new Date(beforeRaw);
      beforeValid = before instanceof Date && !isNaN(before);
      if (!beforeValid)
        return res.status(400).json({ error: 'Invalid before date (must be ISO datetime)' });
    }
    try {
      const params = [userId, userId, contactId, contactId, userId];
      let sql = `SELECT id, sender_id, receiver_id, content, latitude, longitude, is_read,
                 DATE_FORMAT(sent_at, '%H:%i') as time,
                 sent_at as sent_at_raw,
                 IF(sender_id = ?, 1, 0) as isMe
                 FROM messages 
                 WHERE (sender_id = ? AND receiver_id = ?) 
                    OR (sender_id = ? AND receiver_id = ?)`;
      if (beforeValid) {
        sql += ` AND sent_at < ?`;
        params.push(before);
      }
      sql += ` ORDER BY sent_at DESC LIMIT ?`;
      params.push(Number(limit));
      const [rowsDesc] = await db.execute(sql, params);
      const rows = rowsDesc.reverse();
      res.json(rows);
    } catch (err) {
      log.error('History Error:', err);
      next(err);
    }
  } catch (e) {
    next(e);
  }
}

async function postmessages(req, res, next) {
  try {
    const sender_id = validId(req.body?.sender_id);
    const receiver_id = validId(req.body?.receiver_id);
    const content = typeof req.body?.content === 'string' ? req.body.content.trim() : '';
    if (!sender_id || !receiver_id || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (content.length > 2000) {
      return res.status(400).json({ error: 'Message too long (max 2000 chars)' });
    }
    // Sender must be the logged-in user — prevents impersonation
    if (sender_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    try {
      const [[receiver]] = await db.execute('SELECT id FROM users WHERE id = ? LIMIT 1', [
        receiver_id,
      ]);
      if (!receiver) return res.status(404).json({ error: 'Recipient not found' });
      const [result] = await db.execute(
        `INSERT INTO messages (sender_id, receiver_id, content, sent_at, is_read)
                 VALUES (?, ?, ?, NOW(), 0)`,
        [sender_id, receiver_id, content]
      );
      const [rows] = await db.execute(
        `SELECT id, sender_id, receiver_id, content,
                 DATE_FORMAT(sent_at, '%H:%i') as time,
                 IF(sender_id = ?, 1, 0) as isMe
                 FROM messages WHERE id = ?`,
        [sender_id, result.insertId]
      );
      if (!rows[0]) throw new AppError('Could not send message', 500, 'MESSAGE_SEND_FAILED');
      res.status(201).json(rows[0]);
    } catch (err) {
      log.error('Send Message Error:', err);
      next(err);
    }
  } catch (e) {
    next(e);
  }
}

async function getusersSearch(req, res, next) {
  try {
    const rawQuery = typeof req.query?.query === 'string' ? req.query.query.trim() : '';
    if (!rawQuery) return res.json([]);
    if (rawQuery.length > 50)
      return res.status(400).json({ error: 'Search too long (max 50 chars)' });
    const excludeId = validId(req.query?.excludeId) ?? req.user.id;
    // Escape LIKE wildcards so %/_ are literal
    const escaped = rawQuery.replace(/[\\%_]/g, (c) => `\\${c}`);
    try {
      const [rows] = await db.execute(
        "SELECT u.id, u.name, COALESCE(p.avatar_url, u.avatar_url) AS avatar_url, u.is_online FROM users u LEFT JOIN user_profiles p ON p.user_id = u.id WHERE u.name LIKE ? ESCAPE '\\\\' AND u.id != ? LIMIT 10",
        [`%${escaped}%`, excludeId]
      );
      res.json(rows);
    } catch (err) {
      log.error('Search Error:', err);
      next(err);
    }
  } catch (e) {
    next(e);
  }
}

async function postfriendsAdd(req, res, next) {
  try {
    const userId = validId(req.body?.userId);
    const friendId = validId(req.body?.friendId);
    if (!userId || !friendId) {
      return res.status(400).json({ error: 'Missing userId or friendId' });
    }
    if (userId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    if (userId === friendId) {
      return res.status(400).json({ error: 'Cannot add yourself' });
    }
    try {
      const [[friend]] = await db.execute('SELECT id FROM users WHERE id = ? LIMIT 1', [friendId]);
      if (!friend) return res.status(404).json({ error: 'User not found' });
      await db.execute(
        'INSERT INTO friendships (user_id, friend_id, status) VALUES (?, ?, "close_friend") ON DUPLICATE KEY UPDATE status="close_friend"',
        [userId, friendId]
      );
      res.json({ success: true, message: 'Added to Close Friends' });
    } catch (err) {
      log.error('Add Friend Error:', err);
      next(err);
    }
  } catch (e) {
    next(e);
  }
}

module.exports = {
  getcontactsUserId,
  getmessagesUserIdContactId,
  postmessages,
  getusersSearch,
  postfriendsAdd,
};
