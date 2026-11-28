// loadEnv.js — one place that loads dotenv files, so local and deployed runs agree.
//
//   NODE_ENV unset / development  -> backend/.env only (localhost MySQL, no TLS)
//   NODE_ENV=production           -> backend/.env.production first (Aiven host + CA),
//                                    then backend/.env for everything else
//
// dotenv never overrides a variable that is already set, so the order above makes
// .env.production win for DB_*, and real environment variables (Render, Vercel,
// a shell `$env:` assignment) always beat both files. NODE_ENV itself must come from
// the shell/host, because it decides which file is read.
const path = require('path');

const root = path.join(__dirname, '..', '..');
const isProduction = String(process.env.NODE_ENV || '').toLowerCase() === 'production';

try {
  const dotenv = require('dotenv');
  if (isProduction) dotenv.config({ path: path.join(root, '.env.production'), quiet: true });
  dotenv.config({ path: path.join(root, '.env'), quiet: true });
} catch { /* dotenv is optional on hosts that inject real env vars */ }
