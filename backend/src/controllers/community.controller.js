const db = require('../config/db');
const { z } = require('zod');
const { validId } = require('../utils/ids');

const ALLOWED_TAGS = ['General', 'Training', 'Nutrition', 'Recovery'];

const createPostSchema = z.object({
  text: z.string().trim().min(1, 'Post text is required.').max(1000, 'Post text must be 1000 characters or less.'),
  tag: z.enum(ALLOWED_TAGS).optional().default('General'),
});

const createCommentSchema = z.object({
  text: z.string().trim().min(1, 'Comment text is required.').max(500, 'Comment must be 500 characters or less.'),
});

const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

// GET /api/community?limit=20&offset=0 — public feed with like/comment counts + liked_by_me
async function list(req, res, next) {
  try {
    // Validated by paginationSchema (query): coerced ints, limit 1..50, offset >= 0.
    // Clamp again here so the SQL below is safe even if validation is bypassed.
    const limit = Math.min(50, Math.max(1, Number(req.query.limit ?? 20) || 20));
    const offset = Math.max(0, Number(req.query.offset ?? 0) || 0);
    const me = req.user.id;
    // NOTE: db.query (not execute) — mysql2 server-side prepares reject
    // placeholders in LIMIT/OFFSET on some MySQL versions.
    // Optimized: single GROUP BY pass instead of 2x correlated COUNT per row.
    const [rows] = await db.query(
      `SELECT p.id, p.user_id, p.author_name, p.text, p.tag, p.created_at,
              COUNT(DISTINCT l.id) AS likes,
              COUNT(DISTINCT c.id) AS comments,
              MAX(CASE WHEN l2.user_id = ? THEN 1 ELSE 0 END) AS liked_by_me
       FROM community_posts p
       LEFT JOIN community_likes l ON l.post_id = p.id
       LEFT JOIN community_comments c ON c.post_id = p.id
       LEFT JOIN community_likes l2 ON l2.post_id = p.id AND l2.user_id = ?
       GROUP BY p.id, p.user_id, p.author_name, p.text, p.tag, p.created_at
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
      [me, me, Number(limit), Number(offset)]
    );
    const [[{ total }]] = await db.execute('SELECT COUNT(*) AS total FROM community_posts');
    const posts = rows.map((r) => ({
      ...r,
      likes: Number(r.likes),
      comments: Number(r.comments),
      liked_by_me: Number(r.liked_by_me) === 1,
    }));
    res.json({ posts, total: Number(total), limit, offset });
  } catch (e) { next(e); }
}

// POST /api/community {text, tag} — create post as JWT user (validated by Zod)
async function create(req, res, next) {
  try {
    const { text, tag } = req.body;
    const [userRows] = await db.execute('SELECT name FROM users WHERE id = ?', [req.user.id]);
    const author = userRows[0]?.name?.split(' ')[0] || 'You';
    const [result] = await db.execute(
      'INSERT INTO community_posts (user_id, author_name, text, tag) VALUES (?,?,?,?)',
      [req.user.id, author, text, tag ?? 'General']
    );
    const [rows] = await db.execute(
      'SELECT id, user_id, author_name, text, tag, created_at FROM community_posts WHERE id = ?',
      [result.insertId]
    );
    res.status(201).json({ success: true, post: { ...rows[0], likes: 0, comments: 0, liked_by_me: false } });
  } catch (e) { next(e); }
}

// POST /api/community/:id/like — idempotent like (no toggle-off; use DELETE to unlike)
async function toggleLike(req, res, next) {
  try {
    const postId = validId(req.params.id);
    if (!postId) return res.status(400).json({ error: 'Invalid post id' });
    const [exists] = await db.execute('SELECT id FROM community_posts WHERE id = ?', [postId]);
    if (!exists.length) return res.status(404).json({ error: 'Post not found' });
    await db.execute('INSERT IGNORE INTO community_likes (post_id, user_id) VALUES (?,?)', [postId, req.user.id]);
    const [[{ likes }]] = await db.execute('SELECT COUNT(*) AS likes FROM community_likes WHERE post_id=?', [postId]);
    res.json({ success: true, liked: true, likes: Number(likes) });
  } catch (e) { next(e); }
}

// DELETE /api/community/:id/like — unlike (404 if post missing)
async function unlike(req, res, next) {
  try {
    const postId = validId(req.params.id);
    if (!postId) return res.status(400).json({ error: 'Invalid post id' });
    const [exists] = await db.execute('SELECT id FROM community_posts WHERE id = ?', [postId]);
    if (!exists.length) return res.status(404).json({ error: 'Post not found' });
    await db.execute('DELETE FROM community_likes WHERE post_id=? AND user_id=?', [postId, req.user.id]);
    const [[{ likes }]] = await db.execute('SELECT COUNT(*) AS likes FROM community_likes WHERE post_id=?', [postId]);
    res.json({ success: true, liked: false, likes: Number(likes) });
  } catch (e) { next(e); }
}

// GET /api/community/:id/comments — list comments (404 if post missing)
async function listComments(req, res, next) {
  try {
    const postId = validId(req.params.id);
    if (!postId) return res.status(400).json({ error: 'Invalid post id' });
    const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 30) || 30));
    const offset = Math.max(0, Number(req.query.offset ?? 0) || 0);
    const [exists] = await db.execute('SELECT id FROM community_posts WHERE id = ?', [postId]);
    if (!exists.length) return res.status(404).json({ error: 'Post not found' });
    const [rows] = await db.query(
      'SELECT id, user_id, author_name, text, created_at FROM community_comments WHERE post_id=? ORDER BY created_at ASC LIMIT ? OFFSET ?',
      [postId, Number(limit), Number(offset)]
    );
    res.json({ comments: rows, limit, offset });
  } catch (e) { next(e); }
}

// POST /api/community/:id/comments {text} (validated by Zod)
async function addComment(req, res, next) {
  try {
    const postId = validId(req.params.id);
    if (!postId) return res.status(400).json({ error: 'Invalid post id' });
    const { text } = req.body;
    const [exists] = await db.execute('SELECT id FROM community_posts WHERE id=?', [postId]);
    if (!exists.length) return res.status(404).json({ error: 'Post not found' });
    const [userRows] = await db.execute('SELECT name FROM users WHERE id=?', [req.user.id]);
    const author = userRows[0]?.name?.split(' ')[0] || 'You';
    const [result] = await db.execute(
      'INSERT INTO community_comments (post_id, user_id, author_name, text) VALUES (?,?,?,?)',
      [postId, req.user.id, author, text]
    );
    const [rows] = await db.execute('SELECT id, user_id, author_name, text, created_at FROM community_comments WHERE id=?', [result.insertId]);
    res.status(201).json({ success: true, comment: rows[0] });
  } catch (e) { next(e); }
}

// DELETE /api/community/:id — owner only
async function remove(req, res, next) {
  try {
    const postId = validId(req.params.id);
    if (!postId) return res.status(400).json({ error: 'Invalid post id' });
    const [rows] = await db.execute('SELECT user_id FROM community_posts WHERE id=?', [postId]);
    if (!rows.length) return res.status(404).json({ error: 'Post not found' });
    if (Number(rows[0].user_id) !== Number(req.user.id)) return res.status(403).json({ error: 'Forbidden' });
    await db.execute('DELETE FROM community_posts WHERE id=?', [postId]);
    res.json({ success: true });
  } catch (e) { next(e); }
}

module.exports = { list, create, toggleLike, unlike, listComments, addComment, remove, ALLOWED_TAGS, createPostSchema, createCommentSchema, paginationSchema };
