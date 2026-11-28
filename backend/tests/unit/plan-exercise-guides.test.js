'use strict';
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { exerciseGuide } = require('../../src/utils/workoutRecommender');

const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, '');

function seededExerciseNames() {
  const dirs = [path.join(__dirname, '../../migrations'), path.join(__dirname, '../../src/db/seeds')];
  const names = new Set();
  for (const dir of dirs) {
    for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.sql'))) {
      const sql = fs.readFileSync(path.join(dir, f), 'utf8');
      for (const m of sql.matchAll(/AS exercise_order, '([^']+)' AS exercise_name/g)) names.add(m[1]);
    }
  }
  return [...names];
}

describe('exercise guide covers seeded plans', () => {
  const guide = new Map(exerciseGuide().map((g) => [norm(g.name), g]));
  const names = seededExerciseNames();

  it('finds the seeded exercise names', () => assert.ok(names.length > 50));

  for (const name of names) {
    it(`has instructions for "${name}"`, () => {
      const g = guide.get(norm(name));
      assert.ok(g, 'missing guide');
      assert.ok(g.steps.length >= 2 && g.cues.length >= 1 && g.mistakes.length >= 1);
    });
  }
});
