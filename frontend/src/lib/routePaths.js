// Only known retired member URLs redirect; unknown URLs still render NotFound.
const LEGACY_MEMBER_PATHS = {
  '/dashboard/plans': '/plans',
  '/dashboard/activity-map': '/activity-map',
  '/dashboard/workouts': '/workouts',
  '/dashboard/profile': '/profile',
  '/dashboard/logs': '/logs',
  '/dashboard/meal-tracker': '/meal-tracker',
  '/dashboard/community': '/community',
  '/dashboard/community/messages': '/community/messages',
  '/dashboard/notifications': '/notifications',
  '/dashboard/preferences': '/preferences',
  '/dashboard/help-support': '/help-support',
  '/dashboard/messenger': '/community/messages',
  '/messenger': '/community/messages',
  '/dashboard/bmi': '/profile',
  '/dashboard/virtual-clinic': '/dashboard',
};

export function legacyMemberDestination({ pathname, search = '', hash = '' }) {
  const target = LEGACY_MEMBER_PATHS[pathname.replace(/\/+$/, '').toLowerCase()];
  return target ? { pathname: target, search, hash } : null;
}
