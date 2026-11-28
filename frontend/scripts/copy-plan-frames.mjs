// Copies the 3 picture frames of every exercise a plan or the recommender can
// show into public/exercise-frames/<slug>/frame-N.png, so the instruction modal
// never depends on a third-party CDN. Run: npm run frames
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { matchExercise } from '../src/features/user/Plan/utils/exerciseMatch.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const pkgDir = path.dirname(require.resolve('@bryllim/workout-guide/package.json'));
const names = fs.readFileSync(path.join(root, 'scripts/plan-exercise-names.txt'), 'utf8').split('\n').filter(Boolean);
const slugs = new Set(names.map((n) => matchExercise(n)?.slug).filter(Boolean));
let copied = 0;
for (const slug of slugs) {
  for (const n of [1, 2, 3]) {
    const from = path.join(pkgDir, 'assets', slug, `frame-${n}.png`);
    if (!fs.existsSync(from)) continue;
    const toDir = path.join(root, 'public/exercise-frames', slug);
    fs.mkdirSync(toDir, { recursive: true });
    fs.copyFileSync(from, path.join(toDir, `frame-${n}.png`));
    copied += 1;
  }
}
console.log(`[frames] ${slugs.size} exercises, ${copied} images -> public/exercise-frames`);
