// Pins algorithm + issuer/audience so tokens can't be swapped across contexts.
const JWT_ALGORITHM = "HS256";
const JWT_ISSUER = "vitalis";
const JWT_AUDIENCE = "vitalis-web";
const JWT_EXPIRES_IN = "12h";
const JWT_MAX_AGE_MS = 12 * 60 * 60 * 1000;

function signSession(jwt, { id, email, tv = 0 }) {
  return jwt.sign({ id, email, tv: Number(tv) || 0 }, process.env.JWT_SECRET, {
    algorithm: JWT_ALGORITHM,
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
    expiresIn: JWT_EXPIRES_IN,
  });
}

function verifySession(jwt, token) {
  return jwt.verify(token, process.env.JWT_SECRET, {
    algorithms: [JWT_ALGORITHM],
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
  });
}

module.exports = {
  JWT_ALGORITHM,
  JWT_ISSUER,
  JWT_AUDIENCE,
  JWT_EXPIRES_IN,
  JWT_MAX_AGE_MS,
  signSession,
  verifySession,
};
