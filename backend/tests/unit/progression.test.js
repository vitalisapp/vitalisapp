// tests/unit/progression.test.js — Revision #4: progressive feature unlocking.
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { evaluate, requiredLevelForPlan, activeWeeks } = require('../../src/utils/progression');
const { CHALLENGES } = require('../../src/constants/challenges');
const { EXCLUSION_CATEGORIES } = require('../../src/constants/exercisePool');

const TODAY = new Date(2026, 10, 26); // Thu 26 Nov 2026
const iso = (daysAgo) => {
  const d = new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate() - daysAgo);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const weekly = (weeks) => Array.from({ length: weeks }, (_, i) => iso(i * 7));
const READY_L2 = { sessions: 8, sessionDates: weekly(3), ratings: [3, 3, 4], formScores: [75, 72, 80] };
const READY_L3 = { sessions: 20, sessionDates: weekly(6), ratings: [3, 3, 2, 3, 3], formScores: [85, 82, 90] };
const req = (result, level, key) => result.levels.find((l) => l.level === level).requirements.find((r) => r.key === key);

describe('levels', () => {
  it('everyone starts at Level 1 (Foundation), which is always unlocked', () => {
    const r = evaluate({}, { today: TODAY });
    assert.equal(r.level, 1);
    assert.equal(r.levels[0].unlocked, true);
    assert.equal(r.nextLevel, 2);
    assert.equal(r.levels[1].requirements.length, 4);
    assert.ok(r.levels[1].requirements.every((x) => x.label && x.hint && x.target > 0));
  });

  it('Level 2 unlocks only when every requirement is met', () => {
    assert.equal(evaluate(READY_L2, { today: TODAY }).level, 2);
    assert.equal(evaluate({ ...READY_L2, sessions: 7 }, { today: TODAY }).level, 1);
    assert.equal(evaluate({ ...READY_L2, sessionDates: weekly(2) }, { today: TODAY }).level, 1);
    assert.equal(evaluate({ ...READY_L2, ratings: [5, 4, 4] }, { today: TODAY }).level, 1, 'too hard');
    assert.equal(evaluate({ ...READY_L2, ratings: [3, 3] }, { today: TODAY }).level, 1, 'not enough ratings');
    assert.equal(evaluate({ ...READY_L2, formScores: [60, 65, 50] }, { today: TODAY }).level, 1, 'form too low');
  });

  it('Level 3 needs Level 2 too (cumulative)', () => {
    assert.equal(evaluate(READY_L3, { today: TODAY }).level, 3);
    // Elite stats but the consistency window misses → stays at 2.
    assert.equal(evaluate({ ...READY_L3, sessionDates: weekly(4) }, { today: TODAY }).level, 2);
  });

  it('earned levels are sticky — a break never takes content away', () => {
    const r = evaluate({ sessions: 0 }, { storedLevel: 3, today: TODAY });
    assert.equal(r.level, 3);
    assert.ok(r.levels.every((l) => l.unlocked));
    assert.equal(r.nextLevel, null);
  });

  it('no camera data: technique is met by doing 1.5× the sessions instead', () => {
    const noCam = { ...READY_L2, formScores: [] };
    assert.equal(evaluate(noCam, { today: TODAY }).level, 1);
    const t = req(evaluate(noCam, { today: TODAY }), 2, 'technique');
    assert.equal(t.target, 12);
    assert.match(t.hint, /camera workout/);
    assert.equal(evaluate({ ...noCam, sessions: 12 }, { today: TODAY }).level, 2);
  });

  it('self-declared Advanced needs half the sessions and weeks for Level 2 only', () => {
    const stats = { sessions: 4, sessionDates: weekly(2), ratings: [3, 3, 3], formScores: [80, 80, 80] };
    assert.equal(evaluate(stats, { today: TODAY }).level, 1);
    const r = evaluate(stats, { selfAdvanced: true, today: TODAY });
    assert.equal(r.level, 2);
    assert.equal(req(r, 3, 'sessions').target, 20);
  });

  it('progress percentages show how close the user is', () => {
    const r = evaluate({ sessions: 4, sessionDates: weekly(1), ratings: [], formScores: [] }, { today: TODAY });
    const l2 = r.levels[1];
    assert.ok(l2.progressPct > 0 && l2.progressPct < 100);
    assert.equal(req(r, 2, 'sessions').current, 4);
  });
});

describe('consistency weeks', () => {
  it('counts distinct Monday-based weeks inside the window', () => {
    // Thu 26 Nov: Mon 23 is this week; Sun 22 is last week.
    assert.equal(activeWeeks(['2026-11-23', '2026-11-26'], 4, TODAY), 1);
    assert.equal(activeWeeks(['2026-11-22', '2026-11-23'], 4, TODAY), 2);
    assert.equal(activeWeeks([iso(35)], 4, TODAY), 0, 'outside the 4-week window');
  });
});

describe('plan gating', () => {
  it('only Advanced / Extreme curated plans need a level; personal plans never do', () => {
    assert.equal(requiredLevelForPlan({ intensity: 'Beginner', owner_user_id: null }), 1);
    assert.equal(requiredLevelForPlan({ intensity: 'Moderate', owner_user_id: null }), 1);
    assert.equal(requiredLevelForPlan({ intensity: 'Advanced', owner_user_id: null }), 2);
    assert.equal(requiredLevelForPlan({ intensity: 'Extreme', owner_user_id: null }), 3);
    assert.equal(requiredLevelForPlan({ intensity: 'Extreme', owner_user_id: 7 }), 1);
  });
});

describe('challenge catalogue', () => {
  it('has Level 2 and Level 3 challenges with valid flags and targets', () => {
    const flags = new Set(EXCLUSION_CATEGORIES.map((c) => c.key));
    assert.ok(CHALLENGES.some((c) => c.level === 2) && CHALLENGES.some((c) => c.level === 3));
    for (const c of CHALLENGES) {
      assert.ok(c.target > 0 && c.workoutTypes.includes(c.exerciseId), c.key);
      assert.ok(!c.flags.includes('HIGH_IMPACT'), `${c.key} should be low-impact`);
      for (const f of c.flags) assert.ok(flags.has(f), `${c.key} flag ${f}`);
      if (c.mode === 'rep') assert.equal(c.sets * c.reps >= c.target, true, c.key);
    }
  });
});

// ── Service with a mocked DB ───────────────────────────────────────────
function withService(handlers, run) {
  const dbPath = require.resolve('../../src/config/db');
  const prefsPath = require.resolve('../../src/services/trainingPrefs.service');
  const servicePath = require.resolve('../../src/services/progression.service');
  const plansPath = require.resolve('../../src/services/plans.service');
  const calls = [];
  const execute = async (sql, params = []) => {
    calls.push({ sql, params });
    for (const [re, fn] of handlers) if (re.test(sql)) return fn(params);
    return [[]];
  };
  const saved = [dbPath, prefsPath].map((p) => [p, require.cache[p]]);
  require.cache[dbPath] = { id: dbPath, filename: dbPath, loaded: true, exports: { execute, query: execute } };
  require.cache[prefsPath] = { id: prefsPath, filename: prefsPath, loaded: true, exports: { get: async () => handlers.prefs || null } };
  delete require.cache[servicePath];
  delete require.cache[plansPath];
  const restore = () => {
    for (const [p, m] of saved) { if (m) require.cache[p] = m; else delete require.cache[p]; }
    delete require.cache[servicePath];
    delete require.cache[plansPath];
  };
  return Promise.resolve(run({ service: require(servicePath), plans: require(plansPath), calls })).finally(restore);
}

const level1User = [
  [/SELECT progression_level, progression_seen FROM users/, () => [[{ progression_level: 1, progression_seen: 1 }]]],
  [/SELECT COUNT\(\*\) AS n FROM workout_logs/, () => [[{ n: 2 }]]],
  [/SELECT DISTINCT DATE_FORMAT/, () => [[{ d: iso(0) }]]],
  [/difficulty_rating AS r/, () => [[]]],
  [/form_score AS f/, () => [[]]],
  [/experience_level FROM fitness_goals/, () => [[{ experience_level: 'BEGINNER' }]]],
];
const level2User = [
  [/SELECT progression_level, progression_seen FROM users/, () => [[{ progression_level: 1, progression_seen: 1 }]]],
  [/SELECT COUNT\(\*\) AS n FROM workout_logs/, () => [[{ n: 9 }]]],
  [/SELECT DISTINCT DATE_FORMAT/, () => [[{ d: iso(0) }, { d: iso(7) }, { d: iso(14) }]]],
  [/difficulty_rating AS r/, () => [[{ r: 3 }, { r: 3 }, { r: 3 }]]],
  [/form_score AS f/, () => [[{ f: 80 }, { f: 75 }, { f: 78 }]]],
  [/experience_level FROM fitness_goals/, () => [[{ experience_level: 'INTERMEDIATE' }]]],
];

describe('progression service', () => {
  it('persists a newly earned level and asks the UI to celebrate once', async () => {
    await withService([...level2User, [/FROM user_challenges/, () => [[]]]], async ({ service, calls }) => {
      const p = await service.getProgression(1);
      assert.equal(p.level, 2);
      assert.equal(p.celebrate, true);
      assert.deepEqual(p.newlyUnlocked.map((l) => l.level), [2]);
      assert.ok(calls.some((c) => /UPDATE users SET progression_level = GREATEST/.test(c.sql) && c.params[0] === 2));
      assert.ok(p.challenges.filter((c) => c.level === 2).every((c) => c.unlocked));
      assert.ok(p.challenges.filter((c) => c.level === 3).every((c) => !c.unlocked));
    });
  });

  it('reports NEEDS_MIGRATION_061 before the migration is applied', async () => {
    const missing = [[/SELECT progression_level/, () => { throw Object.assign(new Error('Unknown column'), { errno: 1054 }); }]];
    await withService(missing, async ({ service }) => {
      await assert.rejects(service.getProgression(1), (e) => e.code === 'NEEDS_MIGRATION_061');
    });
  });

  it('blocks starting a locked Advanced plan, but keeps existing enrollments', async () => {
    const advancedPlan = [/SELECT \* FROM plans WHERE id = \?/, () => [[{ id: 50, intensity: 'Advanced', owner_user_id: null }]]];
    await withService([...level1User, advancedPlan, [/FROM user_plans WHERE user_id/, () => [[]]]], async ({ plans }) => {
      await assert.rejects(plans.enroll(1, 50), (e) => e.code === 'LEVEL_LOCKED' && e.status === 403 && e.details.requiredLevel === 2);
    });
    // Already enrolled → no level check; the existing duplicate path answers.
    const enrolled = [/FROM user_plans WHERE user_id/, () => [[{ id: 3 }]]];
    const dup = [/INSERT INTO user_plans/, () => { throw Object.assign(new Error('dup'), { code: 'ER_DUP_ENTRY' }); }];
    await withService([...level1User, advancedPlan, enrolled, dup], async ({ plans }) => {
      await assert.rejects(plans.enroll(1, 50), (e) => e.code === 'ALREADY_ENROLLED');
    });
  });

  it('lets a Level 2 user start an Advanced plan', async () => {
    const advancedPlan = [/SELECT \* FROM plans WHERE id = \?/, () => [[{ id: 50, intensity: 'Advanced', owner_user_id: null }]]];
    await withService([...level2User, advancedPlan, [/FROM user_plans WHERE user_id/, () => [[]]]], async ({ plans, calls }) => {
      await plans.enroll(1, 50);
      assert.ok(calls.some((c) => /INSERT INTO user_plans/.test(c.sql)));
    });
  });

  describe('challenge verification', () => {
    const log = (over = {}) => [/FROM workout_logs WHERE id = \? AND user_id = \?/, () => [[{
      id: 77, workout_type: 'squat', status: 'completed', rep_count: 80, duration_seconds: 600, age_hours: 0, ...over,
    }]]];
    const insert = [/INSERT INTO user_challenges/, () => [{ affectedRows: 1 }]];

    it('completes when the logged workout meets the target', async () => {
      await withService([...level2User, log(), insert], async ({ service }) => {
        const r = await service.completeChallenge(1, 'squat_75', 77);
        assert.deepEqual(r, { completed: true, achieved: 80, target: 75, firstTime: true });
      });
    });

    it('does not complete when the target is missed', async () => {
      await withService([...level2User, log({ rep_count: 60 }), insert], async ({ service, calls }) => {
        const r = await service.completeChallenge(1, 'squat_75', 77);
        assert.equal(r.completed, false);
        assert.ok(!calls.some((c) => /INSERT INTO user_challenges/.test(c.sql)));
      });
    });

    it('rejects impossible reps, wrong exercise, old or unfinished workouts', async () => {
      await withService([...level2User, log({ rep_count: 500, duration_seconds: 40 }), insert], async ({ service }) => {
        assert.equal((await service.completeChallenge(1, 'squat_75', 77)).completed, false); // > 1 rep/s
      });
      await withService([...level2User, log({ workout_type: 'pushup' })], async ({ service }) => {
        await assert.rejects(service.completeChallenge(1, 'squat_75', 77), (e) => e.code === 'WRONG_EXERCISE');
      });
      await withService([...level2User, log({ age_hours: 30 })], async ({ service }) => {
        await assert.rejects(service.completeChallenge(1, 'squat_75', 77), (e) => e.code === 'WORKOUT_TOO_OLD');
      });
      await withService([...level2User, log({ status: 'active' })], async ({ service }) => {
        await assert.rejects(service.completeChallenge(1, 'squat_75', 77), (e) => e.code === 'SESSION_NOT_COMPLETED');
      });
    });

    it('hold challenges use the held seconds, capped by the real session length', async () => {
      const plank = log({ workout_type: 'plank', rep_count: 0, duration_seconds: 150 });
      await withService([...level2User, plank, [/FROM workout_sets/, () => [[{ s: 130 }]]], insert], async ({ service }) => {
        assert.equal((await service.completeChallenge(1, 'plank_120', 77)).completed, true);
      });
      await withService([...level2User, plank, [/FROM workout_sets/, () => [[{ s: 999 }]]], insert], async ({ service }) => {
        assert.equal((await service.completeChallenge(1, 'plank_120', 77)).achieved, 150);
      });
    });

    it('locked challenges and excluded movements are refused', async () => {
      await withService([...level1User], async ({ service }) => {
        await assert.rejects(service.completeChallenge(1, 'squat_75', 77), (e) => e.code === 'LEVEL_LOCKED');
      });
      const handlers = [...level2User, log({ workout_type: 'pushup' })];
      handlers.prefs = { excludedCategories: ['WRIST_LOAD'] };
      await withService(handlers, async ({ service }) => {
        await assert.rejects(service.completeChallenge(1, 'pushup_40', 77), (e) => e.code === 'CHALLENGE_EXCLUDED');
      });
    });
  });
});
