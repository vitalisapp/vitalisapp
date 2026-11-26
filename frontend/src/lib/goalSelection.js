// Multi-goal selection (Revision #5) — pure, unit tested in
// tests/unit/goalSelection.test.js. Mirrors backend utils/goalSetup.js:
//   • up to 3 goals: 1 main + 2 extra
//   • only ONE weight goal (lose / gain / maintain) — they pull body weight
//     in different directions
//   • Build Muscle and Improve Performance combine with anything
// The server stays the source of truth; this explains problems before saving.
import { MAX_EXTRA_GOALS, isRecomposition } from './goalSetup.js';

export const MAX_GOALS = MAX_EXTRA_GOALS + 1;
export const WEIGHT_GOALS = ['LOSE_WEIGHT', 'GAIN_WEIGHT', 'MAINTAIN_WEIGHT'];

const SHORT = {
  LOSE_WEIGHT: 'Lose Weight',
  MAINTAIN_WEIGHT: 'Maintain Weight',
  GAIN_WEIGHT: 'Gain Weight',
  BUILD_MUSCLE: 'Build Muscle',
  PERFORMANCE: 'Improve Performance',
};
export const shortGoal = (k) => SHORT[k] || k;

// Same g/kg as backend planEngine PROTEIN_PER_KG (display only).
const PROTEIN_PER_KG = { LOSE_WEIGHT: 2.0, MAINTAIN_WEIGHT: 1.6, GAIN_WEIGHT: 1.8, BUILD_MUSCLE: 2.2, PERFORMANCE: 1.8 };

/** @typedef {{ primary: string, extras: string[] }} GoalState */

export const selectedGoals = (s) => (s?.primary ? [s.primary, ...(s.extras || [])] : []);

function fromList(list) {
  const [primary = '', ...extras] = list;
  return { primary, extras };
}

// Plain-language reasons and compatible alternatives for each weight clash.
const CLASH = {
  'GAIN_WEIGHT|LOSE_WEIGHT': {
    why: 'Losing weight needs a calorie deficit and gaining weight needs a surplus, so your plan can’t do both at once.',
    tip: 'Want to lose fat and add muscle at the same time? Pair Lose Weight with Build Muscle — calories stay near maintenance and protein goes up.',
    combo: ['LOSE_WEIGHT', 'BUILD_MUSCLE'],
  },
  'LOSE_WEIGHT|MAINTAIN_WEIGHT': {
    why: 'Maintaining keeps your weight steady, while losing weight needs it to go down — the calorie targets contradict each other.',
    tip: 'Want to stay at your weight but look leaner and stronger? Pair Maintain Weight with Build Muscle.',
    combo: ['MAINTAIN_WEIGHT', 'BUILD_MUSCLE'],
  },
  'GAIN_WEIGHT|MAINTAIN_WEIGHT': {
    why: 'Gaining weight needs a calorie surplus, while maintaining keeps your weight steady — the targets contradict each other.',
    tip: 'Want more strength without changing your weight? Pair Maintain Weight with Build Muscle.',
    combo: ['MAINTAIN_WEIGHT', 'BUILD_MUSCLE'],
  },
};
const clashKey = (a, b) => [a, b].sort().join('|');

/**
 * Explain why `key` can't be added, with one-tap alternatives.
 * @returns {null | { title: string, message: string, tip?: string, actions: { label: string, state: GoalState }[] }}
 */
export function conflictFor(state, key) {
  const list = selectedGoals(state);
  if (!key || list.includes(key)) return null;
  const clashWith = WEIGHT_GOALS.includes(key) ? list.find((g) => WEIGHT_GOALS.includes(g)) : null;
  if (clashWith) {
    const info = CLASH[clashKey(clashWith, key)];
    // Swap: the tapped weight goal replaces the old one in the same slot.
    const swapped = fromList(list.map((g) => (g === clashWith ? key : g)));
    const actions = [{ label: `Switch to ${shortGoal(key)}`, state: swapped }];
    const combo = fromList(info.combo);
    const same = (a, b) => a.primary === b.primary && a.extras.join() === b.extras.join();
    if (!same(combo, state) && !same(combo, swapped)) {
      actions.push({ label: info.combo.map(shortGoal).join(' + '), state: combo });
    }
    return {
      title: `${shortGoal(clashWith)} and ${shortGoal(key)} can’t be combined`,
      message: info.why,
      tip: `${info.tip} Build Muscle and Improve Performance work with any weight goal.`,
      actions,
    };
  }
  if (list.length >= MAX_GOALS) {
    return {
      title: `Up to ${MAX_GOALS} goals`,
      message: `Focusing on ${MAX_GOALS} goals or fewer keeps your plan realistic. Remove one to add ${shortGoal(key)}.`,
      actions: list.filter((g) => g !== state.primary).map((g) => ({
        label: `Replace ${shortGoal(g)}`,
        state: fromList(list.map((x) => (x === g ? key : x))),
      })),
    };
  }
  return null;
}

/**
 * Tap a goal card: select (first pick becomes the main goal), deselect, or
 * return the conflict to explain. Removing the main goal promotes the next.
 * @returns {{ state: GoalState, conflict: ReturnType<typeof conflictFor> }}
 */
export function toggleGoal(state, key) {
  const list = selectedGoals(state);
  if (list.includes(key)) return { state: fromList(list.filter((g) => g !== key)), conflict: null };
  const conflict = conflictFor(state, key);
  if (conflict) return { state, conflict };
  return { state: fromList([...list, key]), conflict: null };
}

/** Make a selected extra goal the main goal (the old main becomes an extra). */
export function makeMain(state, key) {
  const list = selectedGoals(state);
  if (!list.includes(key) || state.primary === key) return state;
  return { primary: key, extras: [state.primary, ...state.extras.filter((g) => g !== key)] };
}

/**
 * "How your goals shape your plan" — matches backend planEngine + plans:
 * calories from the main goal (or the recomposition blend), protein from the
 * most demanding goal, one workout plan per goal.
 * @returns {{ icon: string, text: string }[]}
 */
export function describeGoalMix(primary, extras = []) {
  if (!primary) return [];
  const all = [primary, ...extras];
  const lines = [];
  if (isRecomposition(primary, extras)) {
    lines.push({ icon: 'local_fire_department', text: 'Calories: close to maintenance — enough to lose fat slowly while you build muscle.' });
  } else {
    lines.push({ icon: 'local_fire_department', text: `Calories: set by your main goal, ${shortGoal(primary)}.` });
  }
  const proteinGoal = all.reduce((best, g) => (PROTEIN_PER_KG[g] > PROTEIN_PER_KG[best] ? g : best), primary);
  const perKg = isRecomposition(primary, extras) ? 2.2 : PROTEIN_PER_KG[proteinGoal];
  lines.push({
    icon: 'egg_alt',
    text: proteinGoal !== primary && !isRecomposition(primary, extras)
      ? `Protein: ${perKg} g per kg body weight, raised for ${shortGoal(proteinGoal)}.`
      : `Protein: ${perKg} g per kg body weight.`,
  });
  lines.push({
    icon: 'exercise',
    text: extras.length
      ? `Training: your active plan follows ${shortGoal(primary)}; ${extras.map(shortGoal).join(' and ')} ${extras.length > 1 ? 'each get their own plan' : 'gets its own plan'} in My Plans.`
      : `Training: your plan follows ${shortGoal(primary)}.`,
  });
  return lines;
}
