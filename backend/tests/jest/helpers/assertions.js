const SENSITIVE_KEYS = [
  "password", "password_hash", "passwordHash", "hash", "salt",
  "api_key", "apiKey", "jwt_secret", "jwtSecret", "db_pass", "dbPassword",
  "connectionString", "secret", "token_hash", "tokenHash",
];

function assertNoSensitiveFields(body, extraKeys = []) {
  const keys = new Set([...SENSITIVE_KEYS, ...extraKeys]);
  const walk = (value) => {
    if (Array.isArray(value)) return value.forEach(walk);
    if (value && typeof value === "object") {
      for (const [key, child] of Object.entries(value)) {
        if (keys.has(key)) {
          throw new Error(`Sensitive field exposed in response: ${key}`);
        }
        walk(child);
      }
    }
  };
  walk(body);
}

function assertNoStackTrace(body) {
  const text = JSON.stringify(body || {});
  if (/at\s+\S+\s+\(|\bTypeError:|\bReferenceError:|\.js:\d+:\d+/.test(text)) {
    throw new Error("Response leaks a stack trace or internal error detail");
  }
}

module.exports = { assertNoSensitiveFields, assertNoStackTrace };
