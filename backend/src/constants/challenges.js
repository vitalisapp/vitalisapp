// Optional challenges (Revision #4). Each is done in ONE camera/self-tracked
// workout session and verified by the server against that completed log:
//   rep   → workout_logs.rep_count ≥ target
//   hold  → total held seconds (workout_sets.duration_seconds) ≥ target
// `workoutTypes` = workout_type values the camera page stores for the move.
// `flags` = exclusion categories (exercisePool); a challenge that conflicts
// with the user's exclusions is shown as not recommended and can't be started.
// All challenges are low-impact on purpose.

const CHALLENGES = [
  {
    key: 'squat_75', level: 2, name: '75-Squat Session', exerciseId: 'squat', workoutTypes: ['squat', 'squats', 'bodyweight-squat'],
    mode: 'rep', target: 75, sets: 5, reps: 15, flags: [], icon: 'accessibility_new',
    description: 'Complete 75 bodyweight squats in one session (5 × 15).',
  },
  {
    key: 'pushup_40', level: 2, name: '40 Push-Up Session', exerciseId: 'pushup', workoutTypes: ['pushup', 'push-up', 'push-ups'],
    mode: 'rep', target: 40, sets: 4, reps: 10, flags: ['FLOOR', 'WRIST_LOAD'], icon: 'fitness_center',
    description: 'Complete 40 push-ups in one session (4 × 10). Knees-down push-ups do not count toward this one.',
  },
  {
    key: 'lunge_60', level: 2, name: '60-Lunge Session', exerciseId: 'lunge', workoutTypes: ['lunge', 'lunges', 'reverse-lunge'],
    mode: 'rep', target: 60, sets: 4, reps: 15, flags: [], icon: 'directions_walk',
    description: 'Complete 60 lunges in one session (4 × 15, alternating legs).',
  },
  {
    key: 'plank_120', level: 2, name: '2-Minute Plank', exerciseId: 'plank', workoutTypes: ['plank', 'forearm-plank'],
    mode: 'hold', target: 120, flags: ['FLOOR'], icon: 'horizontal_rule',
    description: 'Hold a plank for a total of 2 minutes in one session. Short breaks are fine.',
  },
  {
    key: 'squat_150', level: 3, name: '150-Squat Session', exerciseId: 'squat', workoutTypes: ['squat', 'squats', 'bodyweight-squat'],
    mode: 'rep', target: 150, sets: 6, reps: 25, flags: [], icon: 'accessibility_new',
    description: 'Complete 150 bodyweight squats in one session (6 × 25).',
  },
  {
    key: 'pushup_80', level: 3, name: '80 Push-Up Session', exerciseId: 'pushup', workoutTypes: ['pushup', 'push-up', 'push-ups'],
    mode: 'rep', target: 80, sets: 5, reps: 16, flags: ['FLOOR', 'WRIST_LOAD'], icon: 'fitness_center',
    description: 'Complete 80 full push-ups in one session (5 × 16).',
  },
  {
    key: 'situp_100', level: 3, name: '100 Sit-Up Session', exerciseId: 'situp', workoutTypes: ['situp', 'sit-up', 'sit-ups'],
    mode: 'rep', target: 100, sets: 5, reps: 20, flags: ['FLOOR'], icon: 'self_improvement',
    description: 'Complete 100 sit-ups in one session (5 × 20).',
  },
  {
    key: 'plank_240', level: 3, name: '4-Minute Plank', exerciseId: 'plank', workoutTypes: ['plank', 'forearm-plank'],
    mode: 'hold', target: 240, flags: ['FLOOR'], icon: 'horizontal_rule',
    description: 'Hold a plank for a total of 4 minutes in one session.',
  },
];

const BY_KEY = new Map(CHALLENGES.map((c) => [c.key, c]));
const getChallenge = (key) => BY_KEY.get(String(key || '')) || null;

module.exports = { CHALLENGES, getChallenge };
