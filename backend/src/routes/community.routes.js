const express = require('express');
const { makeLimiter } = require('../middleware/rateLimits');
const router = express.Router();
const verifyUser = require('../middleware/verifyUser');
const { validate } = require('../middleware/validate');
const c = require('../controllers/community.controller');

// Abuse guards: public feed writes are the easiest spam vector
const createPostLimiter = makeLimiter({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  message: 'Too many posts. Try again later.',
});

const commentLimiter = makeLimiter({
  windowMs: 60 * 60 * 1000,
  limit: 50,
  message: 'Too many comments. Try again later.',
});

const likeLimiter = makeLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  message: 'Too many likes. Try again later.',
});

router.get('/', verifyUser, validate(c.paginationSchema, 'query'), c.list);
router.post('/', verifyUser, createPostLimiter, validate(c.createPostSchema), c.create);
router.post('/:id/like', verifyUser, likeLimiter, c.toggleLike);
router.delete('/:id/like', verifyUser, likeLimiter, c.unlike);
router.get('/:id/comments', verifyUser, c.listComments);
router.post('/:id/comments', verifyUser, commentLimiter, validate(c.createCommentSchema), c.addComment);
router.delete('/:id', verifyUser, c.remove);

module.exports = router;
