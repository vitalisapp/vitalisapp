// Zod validation wrapper — returns 400 with details instead of leaking internals.
// The top-level `error` is a plain-language sentence (the frontend shows it
// as-is); per-field `details` stay available for forms that map them.
const { AppError } = require('../utils/errors');

// Zod's built-in messages ("Expected string, received number", "Required",
// "String must contain at least 2 character(s)") read like developer output.
// Custom schema messages ("Invalid email address", "Enter the 6-digit code")
// are already user-facing and are kept verbatim.
const DEFAULT_MSG_RE = /^(Required|Expected |Invalid input|Invalid enum value|String must|Number must|Array must|Too (small|big)|Invalid literal|Unrecognized key)/i;

function fieldLabel(path) {
  const last = [...path].reverse().find((p) => typeof p === 'string') || 'value';
  const words = String(last)
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .trim();
  return words || 'value';
}

function friendlyMessage(issue) {
  if (issue.message && !DEFAULT_MSG_RE.test(issue.message)) return issue.message;
  const label = fieldLabel(issue.path || []);
  const Label = label.charAt(0).toUpperCase() + label.slice(1);
  switch (issue.code) {
    case 'invalid_type':
      return issue.received === 'undefined' || issue.received === 'null'
        ? `${Label} is required.`
        : `Please enter a valid ${label}.`;
    case 'too_small':
      if (issue.type === 'string') {
        return Number(issue.minimum) <= 1
          ? `${Label} is required.`
          : `${Label} must be at least ${issue.minimum} characters.`;
      }
      if (issue.type === 'number') return `${Label} must be at least ${issue.minimum}.`;
      return `Please check the ${label} field.`;
    case 'too_big':
      if (issue.type === 'string') return `${Label} must be ${issue.maximum} characters or fewer.`;
      if (issue.type === 'number') return `${Label} must be ${issue.maximum} or less.`;
      return `Please check the ${label} field.`;
    case 'invalid_enum_value':
      return `Please choose a valid option for ${label}.`;
    default:
      return `Please check the ${label} field.`;
  }
}

function validate(schema, source = 'body') {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const details = result.error.issues.map((i) => ({
        path: i.path.join('.'),
        message: friendlyMessage(i),
      }));
      return next(new AppError(details[0]?.message || 'Please check the highlighted fields.', 400, 'VALIDATION_ERROR', details));
    }
    req[source] = result.data;
    next();
  };
}

module.exports = { validate, friendlyMessage };
