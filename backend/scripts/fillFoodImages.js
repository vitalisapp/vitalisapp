// Section 6 — prefill catalog food photos from Pexels (run once after
// adding PEXELS_API_KEY):  npm run foods:images
// Safe to re-run: only foods without a cached photo are looked up, capped at
// 150 requests per run (Pexels allows 200 / hour).
require('dotenv').config();
const db = require('../src/config/db');
const images = require('../src/services/foodImage.service');

(async () => {
  try {
    const r = await images.fillAll({ log: (line) => console.log(line) });
    console.log(`\nChecked ${r.checked}, photos found ${r.found}.${r.remaining > 0 ? ` ${r.remaining} left: run again in an hour.` : ''}`);
  } catch (e) {
    console.error(e.message);
    process.exitCode = 1;
  } finally {
    await db.end?.();
  }
})();
