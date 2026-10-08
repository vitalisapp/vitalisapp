#!/usr/bin/env node
// Helper: npm run db:create -- add-phone-column
// Creates backend/migrations/NNN_add-phone-column.sql from template
// (NNN = last number + 1; canonical dir is backend/migrations/)
const fs = require('fs');
const path = require('path');
const name = process.argv[2] || process.argv[3];
if (!name) {
  console.error('Usage: node src/db/create-migration.js <migration-name>');
  console.error('Example: node src/db/create-migration.js add-phone-column');
  process.exit(1);
}
const slug = name.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase();
// Canonical layout: backend/migrations/ is the single home for *.sql files.
const dir = require('path').join(__dirname, '..', '..', 'migrations');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.sql')).sort();
const lastNum = files.length ? parseInt(files[files.length-1].split('_')[0],10) : 0;
const next = String(lastNum + 1).padStart(3, '0');
const filename = `${next}_${slug}.sql`;
const content = `-- ${filename} — ALTER migration (idempotent)
-- Runner ignores duplicate errors (1060,1061,1091). Use plain ALTER.

-- Example:
-- ALTER TABLE \`users\` ADD COLUMN \`phone\` varchar(20) DEFAULT NULL;

SELECT 1;
`;
fs.writeFileSync(path.join(dir, filename), content);
console.log(`Created ${filename}`);
