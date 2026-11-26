// Progressive unlocking helpers (Revision #4). Pure — tests/unit/progression.test.js.
// Data comes from GET /api/progression (backend utils/progression.js).

export const LEVEL_ICON = { 1: 'foundation', 2: 'military_tech', 3: 'workspace_premium' };

export function levelName(progression, level) {
  return progression?.levels?.find((l) => l.level === level)?.name || `Level ${level}`;
}

/** The next level the user is working toward, or null at max. */
export function nextLevel(progression) {
  if (!progression?.levels) return null;
  return progression.levels.find((l) => !l.unlocked) || null;
}

/** "3 of 4 steps" for a level's requirement list. */
export function stepsText(level) {
  const reqs = level?.requirements || [];
  const met = reqs.filter((r) => r.met).length;
  return `${met} of ${reqs.length} step${reqs.length === 1 ? '' : 's'}`;
}

export function requirementPct(req) {
  if (!req) return 0;
  if (req.met) return 100;
  const target = Number(req.target) || 0;
  if (target <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((Number(req.current) / target) * 100)));
}

/** "75 reps" / "2 min hold". */
export function challengeTargetText(c) {
  if (!c) return '';
  if (c.mode === 'hold') {
    const m = Math.floor(c.target / 60);
    const s = c.target % 60;
    return `${m ? `${m} min` : ''}${m && s ? ' ' : ''}${s ? `${s} s` : ''} hold`;
  }
  return `${c.target} reps`;
}

/** Why a challenge can't be started right now (null = it can). */
export function challengeBlockReason(c, progression) {
  if (!c) return 'Unavailable';
  if (!c.unlocked) return `Unlock ${levelName(progression, c.level)} (Level ${c.level}) first`;
  if (c.blockedBy?.length) return 'Not recommended with your exercise exclusions';
  return null;
}

/** Router state for /workouts that starts a challenge with the right targets. */
export function challengeWorkoutState(c) {
  return {
    exerciseId: c.exerciseId,
    challenge: {
      key: c.key,
      name: c.name,
      mode: c.mode,
      target: c.target,
      sets: c.sets ?? null,
      reps: c.reps ?? null,
    },
  };
}

/** Text for the post-workout challenge result. */
export function challengeResultText(result, challenge) {
  if (!result || !challenge) return '';
  const unit = challenge.mode === 'hold' ? 's held' : ' reps';
  if (result.completed) {
    return result.firstTime
      ? `Challenge complete! ${result.achieved}${unit} — ${challenge.name} is done.`
      : `Challenge complete again — ${result.achieved}${unit}.`;
  }
  return `${result.achieved}${unit} of ${result.target}. Not quite — try again when you're ready.`;
}
