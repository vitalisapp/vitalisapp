// Zod validation wrapper — returns 400 with details instead of leaking internals.
const { AppError } = require('../utils/errors');

function validate(schema, source = 'body') {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const details = result.error.issues.map((i) => ({
        path: i.path.join('.'),
        message: i.message,
      }));
      return next(new AppError('Validation failed', 400, 'VALIDATION_ERROR', details));
    }
    req[source] = result.data;
    next();
  };
}

module.exports = { validate };
