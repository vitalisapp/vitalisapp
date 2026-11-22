// Where a freshly verified (and now signed-in) user lands.
// Mirrors the login routing: admins → console, unfinished setup → onboarding.
export function postVerifyRoute(user) {
  if (!user) return '/login';
  if (user.role === 'admin') return '/admin';
  if (user.onboardingCompleted === false) return '/onboarding';
  return '/dashboard';
}
