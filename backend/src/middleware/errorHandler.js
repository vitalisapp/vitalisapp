const { AppError } = require('../utils/errors');

function errorHandler(err, req, res, _next) {
  if (err && err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ error: 'Duplicate entry', code: 'DUPLICATE_ENTRY' });
  }
  if (err && err.code === 'ER_BAD_FIELD_ERROR') {
    console.error('[DB SCHEMA]', req.method, req.originalUrl, err.message);
    return res.status(500).json({ error: 'Internal server error', code: 'SCHEMA_MISMATCH' });
  }
  // Actionable 400/409 instead of opaque 500.
  if (err && (err.code === 'ER_NO_REFERENCED_ROW_2' || err.code === 'ER_ROW_IS_REFERENCED_2')) {
    return res.status(409).json({ error: 'Referenced record does not exist or is in use.', code: 'FK_CONSTRAINT' });
  }
  if (err && (err.code === 'ER_DATA_TOO_LONG' || err.code === 'ER_TRUNCATED_WRONG_VALUE_FOR_FIELD' || err.code === 'ER_BAD_NULL_ERROR')) {
    return res.status(400).json({ error: 'Invalid data: value too long or wrong type.', code: 'BAD_DATA' });
  }
  // 503 so clients retry with backoff.
  if (err && (err.code === 'ECONNREFUSED' || err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ETIMEDOUT' || err.code === 'ENOTFOUND')) {
    console.error('[DB CONN]', req.method, req.originalUrl, err.code || err.message);
    return res.status(503).json({ error: 'Database temporarily unavailable. Try again.', code: 'DB_UNAVAILABLE' });
  }
  if (err && (err.type === 'entity.too.large' || err.status === 413)) {
    return res.status(413).json({ error: 'Payload too large. Request bodies are capped at 2MB (10MB on image-analysis routes).', code: 'PAYLOAD_TOO_LARGE' });
  }
  const status = err.status || 500;
  const isAppError = err instanceof AppError;
  const message = isAppError ? err.message : (status === 500 ? 'Internal server error' : err.message);
  if (status >= 500) {
    const uid = req.user?.id ?? '-';
    console.error('[SERVER ERROR]', req.method, req.originalUrl, `uid=${uid}`, err.message, err.stack?.split('\n')[1] || '');
  }
  const payload = { error: message };
  if (err.code && isAppError) payload.code = err.code;
  if (err.details && isAppError) payload.details = err.details;
  res.status(status).json(payload);
}

module.exports = errorHandler;
