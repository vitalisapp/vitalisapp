const db = require('../config/db');
const { AppError } = require('../utils/errors');
const { normalize, rankByName } = require('../utils/fuzzyName');
const { SENT_TS_COL, toWireMessage } = require('../utils/messageTime');

const FRIEND_STATUSES = ['accepted', 'close_friend'];

// SQL string literals here MUST use single quotes: managed MySQL (Aiven) runs
// with sql_mode=ANSI, where "pending" is a column name, not a string.

// Contacts = accepted/close-friend rows where the user is on either side.
async function getContacts(userId) {
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
  return rows;
}

async function getMessagesBetween(userId, contactId, { limit, before, beforeValid }) {
  const params = [userId, userId, contactId, contactId, userId];
  let sql = `SELECT id, sender_id, receiver_id, content, latitude, longitude, is_read,
                 ${SENT_TS_COL},
                 IF(sender_id = ?, 1, 0) as isMe
                 FROM messages 
                 WHERE ((sender_id = ? AND receiver_id = ?)
                    OR (sender_id = ? AND receiver_id = ?))`;
  if (beforeValid) {
    sql += ` AND sent_at < ?`;
    params.push(before);
  }
  // mysql2 prepared statements reject a numeric LIMIT placeholder
  // (ER_WRONG_ARGUMENTS), so the clamped integer is inlined instead.
  const safeLimit = Math.min(100, Math.max(1, Math.trunc(Number(limit)) || 50));
  sql += ` ORDER BY sent_at DESC LIMIT ${safeLimit}`;
  const [rowsDesc] = await db.execute(sql, params);
  return rowsDesc.reverse().map(toWireMessage);
}

// Returns the created message row, or null when the recipient does not exist.
// Sender display name for message notifications (fail-soft — never block a send).
async function getDisplayName(userId) {
  try {
    const [[row]] = await db.execute('SELECT name FROM users WHERE id = ?', [userId]);
    return row?.name || 'Someone';
  } catch (_) {
    return 'Someone';
  }
}

async function createMessage(senderId, receiverId, content) {
  const [[receiver]] = await db.execute('SELECT id FROM users WHERE id = ? LIMIT 1', [
    receiverId,
  ]);
  if (!receiver) return null;
  const [result] = await db.execute(
    `INSERT INTO messages (sender_id, receiver_id, content, sent_at, is_read)
                 VALUES (?, ?, ?, NOW(), 0)`,
    [senderId, receiverId, content]
  );
  const [rows] = await db.execute(
    `SELECT id, sender_id, receiver_id, content,
                 ${SENT_TS_COL},
                 IF(sender_id = ?, 1, 0) as isMe
                 FROM messages WHERE id = ?`,
    [senderId, result.insertId]
  );
  if (!rows[0]) throw new AppError('Could not send message', 500, 'MESSAGE_SEND_FAILED');
  return toWireMessage(rows[0]);
}

// User search with the viewer's relationship folded in so the UI can show
// Add / Requested / Respond / Friends without extra round-trips.
// Fuzzy: SQL pulls a broad candidate pool (any word contains a query token, or
// a name word starts with a token's first letter — catches typos like
// "usr2"/"jhon"), then rankByName scores and keeps the best 10.
const SEARCH_CANDIDATES = 300;
const SEARCH_RESULTS = 10;

async function searchUsers(rawQuery, viewerId) {
  const tokens = [...new Set(normalize(rawQuery).split(' ').filter(Boolean))].slice(0, 5);
  if (tokens.length === 0) return [];
  // Tokens are [a-z0-9] only after normalize(), so no LIKE escaping is needed.
  // The unicode_ci collation makes these accent- and case-insensitive.
  const clauses = [];
  const likeParams = [];
  for (const tok of tokens) {
    clauses.push('u.name LIKE ?', 'u.name LIKE ?', 'u.name LIKE ?');
    likeParams.push(`%${tok}%`, `${tok[0]}%`, `% ${tok[0]}%`);
  }
  const [rows] = await db.execute(
    `SELECT u.id, u.name, COALESCE(p.avatar_url, u.avatar_url) AS avatar_url, u.is_online,
            (SELECT f.status FROM friendships f
               WHERE f.user_id = ? AND f.friend_id = u.id LIMIT 1) AS outgoing_status,
            (SELECT f.status FROM friendships f
               WHERE f.user_id = u.id AND f.friend_id = ? LIMIT 1) AS incoming_status
     FROM users u
     LEFT JOIN user_profiles p ON p.user_id = u.id
     WHERE (${clauses.join(' OR ')}) AND u.id != ?
     ORDER BY u.is_online DESC, u.id ASC
     LIMIT ${SEARCH_CANDIDATES}`,
    [viewerId, viewerId, ...likeParams, viewerId]
  );
  return rankByName(rawQuery, rows).slice(0, SEARCH_RESULTS);
}

// ─── FRIENDSHIPS ───────────────────────────────────────────────────────────
// Legacy instant add (kept for compatibility). New flows use request/accept.
async function addFriend(userId, friendId) {
  const [[friend]] = await db.execute('SELECT id FROM users WHERE id = ? LIMIT 1', [friendId]);
  if (!friend) return false;
  await db.execute(
    `INSERT INTO friendships (user_id, friend_id, status) VALUES (?, ?, 'close_friend')
     ON DUPLICATE KEY UPDATE status = 'close_friend'`,
    [userId, friendId]
  );
  return true;
}

// Send (or re-send) a friend request. Returns the resulting relationship
// state so the controller can notify the right person.
async function sendFriendRequest(userId, friendId) {
  const [[friend]] = await db.execute('SELECT id, name FROM users WHERE id = ? LIMIT 1', [friendId]);
  if (!friend) return { ok: false, reason: 'not_found' };
  const [[me]] = await db.execute('SELECT name FROM users WHERE id = ? LIMIT 1', [userId]);

  const [existing] = await db.execute(
    `SELECT id, user_id, friend_id, status FROM friendships
     WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)
     LIMIT 2`,
    [userId, friendId, friendId, userId]
  );

  if (existing.some((r) => FRIEND_STATUSES.includes(r.status))) {
    return { ok: true, status: 'already_friends', friendName: friend.name, requesterName: me?.name };
  }

  const incoming = existing.find(
    (r) => Number(r.user_id) === Number(friendId) && r.status === 'pending'
  );
  // They already asked us — mutual intent means accept immediately.
  if (incoming) {
    await db.execute("UPDATE friendships SET status = 'accepted' WHERE id = ?", [incoming.id]);
    return { ok: true, status: 'accepted', friendName: friend.name, requesterName: me?.name };
  }

  const outgoing = existing.find(
    (r) => Number(r.user_id) === Number(userId) && Number(r.friend_id) === Number(friendId)
  );
  if (outgoing) {
    await db.execute("UPDATE friendships SET status = 'pending' WHERE id = ?", [outgoing.id]);
  } else {
    await db.execute(
      "INSERT INTO friendships (user_id, friend_id, status) VALUES (?, ?, 'pending')",
      [userId, friendId]
    );
  }
  return { ok: true, status: 'pending', friendName: friend.name, requesterName: me?.name };
}

async function getIncomingRequests(userId) {
  const [rows] = await db.execute(
    `SELECT f.id AS request_id, f.created_at,
            u.id, u.name, COALESCE(p.avatar_url, u.avatar_url) AS avatar_url,
            u.is_online, u.fitness_goal
     FROM friendships f
     INNER JOIN users u ON u.id = f.user_id
     LEFT JOIN user_profiles p ON p.user_id = u.id
     WHERE f.friend_id = ? AND f.status = 'pending'
     ORDER BY f.created_at DESC`,
    [userId]
  );
  return rows;
}

async function acceptFriendRequest(userId, requesterId) {
  const [rows] = await db.execute(
    "SELECT id FROM friendships WHERE user_id = ? AND friend_id = ? AND status = 'pending' LIMIT 1",
    [requesterId, userId]
  );
  if (rows.length === 0) return false;
  await db.execute("UPDATE friendships SET status = 'accepted' WHERE id = ?", [rows[0].id]);
  return true;
}

async function declineFriendRequest(userId, requesterId) {
  const [result] = await db.execute(
    "DELETE FROM friendships WHERE user_id = ? AND friend_id = ? AND status = 'pending'",
    [requesterId, userId]
  );
  return result.affectedRows > 0;
}

// none | pending_out (I asked them) | pending_in (they asked me) | friends
async function getFriendStatus(viewerId, friendId) {
  const [rows] = await db.execute(
    `SELECT user_id, friend_id, status FROM friendships
     WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?) LIMIT 2`,
    [viewerId, friendId, friendId, viewerId]
  );
  if (rows.some((r) => FRIEND_STATUSES.includes(r.status))) return 'friends';
  if (rows.some((r) => Number(r.user_id) === Number(viewerId) && r.status === 'pending')) return 'pending_out';
  if (rows.some((r) => Number(r.user_id) === Number(friendId) && r.status === 'pending')) return 'pending_in';
  return 'none';
}

module.exports = {
  getContacts,
  getMessagesBetween,
  getDisplayName,
  createMessage,
  searchUsers,
  addFriend,
  sendFriendRequest,
  getIncomingRequests,
  acceptFriendRequest,
  declineFriendRequest,
  getFriendStatus,
};