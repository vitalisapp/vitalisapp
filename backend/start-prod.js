// start-prod.js — cross-platform production boot (Windows-safe).
// package.json "start:prod" used Unix-only `NODE_ENV=production node server.js`
// which breaks on PowerShell/cmd. This wrapper sets NODE_ENV then boots server.js.
process.env.NODE_ENV = process.env.NODE_ENV || 'production';
require('./server.js');
