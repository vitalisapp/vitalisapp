/**
 * Pure "needs attention" rules for a member/admin profile.
 *
 * Each issue names the exact Profile section it belongs to, so the header,
 * the account menu and the Profile page all agree on *what* is wrong instead
 * of showing one anonymous dot. Order = display priority (security first).
 *
 * Kept free of React and network imports so it can be unit-tested directly.
 *
 * @param {{ passwordNeedsAttention?: boolean, onboardingCompleted?: boolean,
 *           fitness_goal?: unknown, goalType?: unknown, goal?: unknown } | null} user
 * @param {{ height_cm?: unknown, weight_kg?: unknown,
 *           onboarding?: { heightCm?: unknown, weightKg?: unknown, goalType?: unknown } } | null} profile
 * @returns {Array<{ section: 'security'|'onboarding'|'metrics'|'goal', message: string }>}
 */
export function collectProfileIssues(user, profile) {
  const issues = [];

  // Set at login (and on /me) when a still-valid password fails today's policy.
  if (user?.passwordNeedsAttention) {
    issues.push({ section: 'security', message: 'Your password is weak' });
  }

  if (user?.onboardingCompleted === false) {
    issues.push({ section: 'onboarding', message: 'Finish your setup' });
  }

  // Metrics/goal need the profile payload; skip until it has loaded so the
  // header never flashes a false warning on first paint.
  if (profile) {
    const height = profile.height_cm ?? profile.onboarding?.heightCm;
    const weight = profile.weight_kg ?? profile.onboarding?.weightKg;
    if (!height || !weight) {
      issues.push({ section: 'metrics', message: 'Add your height and weight' });
    }

    const goal = profile.onboarding?.goalType
      || user?.fitness_goal || user?.goalType || user?.goal;
    if (!goal) {
      issues.push({ section: 'goal', message: 'Set a fitness goal' });
    }
  }

  return issues;
}

export default collectProfileIssues;
