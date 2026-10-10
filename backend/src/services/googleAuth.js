// Google OAuth client singleton.
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client({
  clientId:     process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
});

module.exports = { googleClient };
