const jwt = require("jsonwebtoken");
const { signSession } = require("../../../src/config/jwt");
const { COOKIE_NAME } = require("../../../src/utils/cookies");

function tokenFor(user, overrides = {}) {
  return signSession(jwt, {
    id: user.id,
    email: user.email,
    tv: overrides.tv === undefined ? user.token_version || 0 : overrides.tv,
  });
}

// Ready-to-use value for Supertest: .set("Cookie", sessionCookie(user))
function sessionCookie(user, overrides = {}) {
  return `${COOKIE_NAME}=${tokenFor(user, overrides)}`;
}

function cookieName() {
  return COOKIE_NAME;
}

module.exports = { tokenFor, sessionCookie, cookieName };
