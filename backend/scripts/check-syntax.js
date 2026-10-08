const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const files = ['server.js', 'start-prod.js'];
function collect(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) collect(full);
    else if (entry.name.endsWith('.js')) files.push(full);
  }
}
collect('src');
for (const file of files) {
  execSync(`node --check "${file}"`, { stdio: 'inherit' });
}
console.log(`syntax OK (${files.length} files)`);
