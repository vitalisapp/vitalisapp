// Warm-up / cool-down routine helpers (Revision #3). Pure — unit tested in
// tests/unit/routine.test.js. Routines come from
// GET /api/plans/:planId/days/:day/routine (backend utils/warmupRecommender).

export function formatSeconds(total) {
  const s = Math.max(0, Math.round(Number(total) || 0));
  if (s < 60) return `${s} s`;
  const m = Math.floor(s / 60);
  const r = s % 60;
  return r ? `${m} min ${r} s` : `${m} min`;
}

/** "40 s", "8 reps", "30 s each side", "10 reps each side". */
export function formatDose(move) {
  if (!move) return '';
  const each = move.perSide ? ' each side' : '';
  if (Number(move.seconds) > 0) return `${formatSeconds(move.seconds)}${each}`;
  if (Number(move.reps) > 0) return `${move.reps} reps${each}`;
  return '';
}

/**
 * Steps the player runs, honouring the user's choices.
 * @param {object[]} moves
 * @param {{ skipped?: Set<string>, easier?: Set<string> }} choices
 */
export function buildSteps(moves = [], { skipped = new Set(), easier = new Set() } = {}) {
  return moves
    .filter((m) => m && !skipped.has(m.key))
    .map((m) => {
      const useEasier = easier.has(m.key) && Boolean(m.easier?.name);
      return {
        key: m.key,
        name: useEasier ? m.easier.name : m.name,
        originalName: m.name,
        steps: useEasier ? m.easier.steps : m.steps,
        cue: m.cue,
        seconds: Number(m.seconds) > 0 ? Number(m.seconds) : null,
        reps: Number(m.reps) > 0 ? Number(m.reps) : null,
        perSide: Boolean(m.perSide),
        isEasier: useEasier,
        hasEasier: Boolean(m.easier?.name),
        // Timed per-side moves run the timer once per side.
        timerSeconds: Number(m.seconds) > 0 ? Number(m.seconds) * (m.perSide ? 2 : 1) : null,
      };
    });
}

/** Estimated seconds for the moves the user kept. */
export function routineSeconds(moves = [], skipped = new Set()) {
  return moves.filter((m) => m && !skipped.has(m.key)).reduce((sum, m) => sum + (Number(m.estSeconds) || 0), 0);
}

/** For a timed per-side step: which side is running (1 or 2) given the time left. */
export function currentSide(step, remaining) {
  if (!step?.perSide || !step.timerSeconds) return null;
  return remaining > step.timerSeconds / 2 ? 1 : 2;
}

/**
 * Player state machine: { index, remaining, running, finished }.
 *   goto    → jump to a step (past the end = finished)
 *   tick    → one second off a timed step; auto-advances at zero
 *   running → pause / resume
 */
export function playerReducer(state, action) {
  const steps = action.steps || [];
  const enter = (i) => {
    if (i >= steps.length) return { ...state, finished: true, running: false, remaining: 0 };
    const index = Math.max(0, i);
    return { index, remaining: steps[index]?.timerSeconds || 0, running: true, finished: false };
  };
  switch (action.type) {
    case 'goto':
      return enter(action.index);
    case 'tick': {
      if (state.finished || !state.running || !steps[state.index]?.timerSeconds) return state;
      const remaining = state.remaining - 1;
      return remaining <= 0 ? enter(state.index + 1) : { ...state, remaining };
    }
    case 'running':
      return state.finished ? state : { ...state, running: Boolean(action.value) };
    default:
      return state;
  }
}
