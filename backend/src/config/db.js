try { require('dotenv').config(); } catch {}
const mysql = require('mysql2');

if (!process.env.DB_NAME) {
  throw new Error('[db] DB_NAME is not set — load src/config/env first or set backend/.env');
}

// Managed MySQL: DB_SSL=1, optional DB_SSL_CA (path or inline PEM).
const useSsl = String(process.env.DB_SSL || '').toLowerCase() === '1' || String(process.env.DB_SSL || '').toLowerCase() === 'true';
let sslOpt;
if (useSsl) {
  const fs = require('fs');
  const caInline = process.env.DB_SSL_CA || '';
  let ca = undefined;
  try {
    if (caInline && fs.existsSync(caInline)) ca = fs.readFileSync(caInline, 'utf8');
    else if (caInline && caInline.includes('BEGIN CERTIFICATE')) ca = caInline.replace(/\\n/g, '\n');
  } catch { /* fall through to default secure */
  }
  if (!ca) {
    console.warn('[db] DB_SSL=1 without DB_SSL_CA — set it to your provider ca.pem if connects fail');
  }
  sslOpt = ca ? { ca, rejectUnauthorized: true } : { rejectUnauthorized: true };
}

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  // XAMPP root often has an empty password — mysql2 needs undefined, not ''.
  password: process.env.DB_PASS ? process.env.DB_PASS : undefined,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  ...(sslOpt ? { ssl: sslOpt } : {}),
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_POOL_MAX, 10) || 25,
  // Bounded queue fails fast under burst instead of growing memory unbounded.
  queueLimit: parseInt(process.env.DB_QUEUE_LIMIT, 10) || 200,
  connectTimeout: 10000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  charset: 'utf8mb4',
});

// Idle-connection errors must never crash the server.
pool.on('error', (err) => {
  console.error('[db] pool error:', err.code || err.message);
});

module.exports = pool.promise();
