export const MAIN_NAV = [
  { key: 'dashboard',   label: 'Dashboard',  icon: 'dashboard',       path: '/dashboard',              group: 'overview' },

  { key: 'nutrition',   label: 'Nutrition',  icon: 'restaurant',      path: '/meal-tracker', group: 'fitness' },
  { key: 'training',    label: 'Training',   icon: 'exercise',        path: '/workouts',     group: 'fitness' },
  // Plans sits with Training (plan programs drive workouts) — kept reachable per master plan.
  { key: 'plans',       label: 'Plans',      icon: 'book',            path: '/plans',        group: 'fitness' },
  { key: 'activity',    label: 'Activity',   icon: 'directions_run',  path: '/activity-map', group: 'fitness' },
  { key: 'progress',    label: 'Progress',   icon: 'history',         path: '/logs',         group: 'fitness' },
  // Community hub: Feed + Messages (/community/messages) on one page.
  { key: 'community',   label: 'Community',  icon: 'groups',          path: '/community',    group: 'social' },
];

// Sidebar section headings, in display order. Items keep MAIN_NAV order.
export const NAV_GROUPS = [
  { key: 'overview', label: 'Overview' },
  { key: 'fitness',  label: 'Fitness' },
  { key: 'social',   label: 'Social' },
];

// Desktop nav — single source. Sidebar.jsx consumes NAV_ITEMS.
const toNavEntry = ({ key, label, icon, path, group }) => ({ key, icon, label, name: label, path, group });
export const NAV_ITEMS = MAIN_NAV.map(toNavEntry);

export const getSettingsItems = (navigate, basePath = '') => [
  { icon: 'person',        label: 'Profile',        accent: true, action: () => navigate(`${basePath}/profile`) },
  { icon: 'tune',          label: 'Preferences',                  action: () => navigate(`${basePath}/preferences`) },
  { icon: 'notifications', label: 'Notifications',               action: () => navigate(`${basePath}/notifications`) },
  { icon: 'help',  label: 'Help & Support',              action: () => navigate(`${basePath}/help-support`) },
];

// Persistent sidebar footer entry — "Profile and Settings" area.
export const SIDEBAR_BOTTOM_NAV = [
  { key: 'profile', label: 'Profile & Settings', icon: 'person', path: '/profile' },
];

export const ACTIVE_NAV_KEY = 'vitalis:activeNav';

// Mobile bottom bar — exactly what the phones show.
// Main 4 (always visible): Dashboard, Progress, Workout, Plans.
// Plus (+) sheet: MealTracker, Jogging, Community (Feed + Messages).
export const MOBILE_MAIN_NAV = [
  { key: 'dashboard', label: 'Dashboard', icon: 'grid_view',     path: '/dashboard' },
  { key: 'progress',   label: 'Progress',   icon: 'history',       path: '/logs' },
  { key: 'workout',   label: 'Workout',   icon: 'exercise',      path: '/workouts' },
  { key: 'plans',     label: 'Plans',     icon: 'book',          path: '/plans' },
];

export const MOBILE_MORE_NAV = [
  { key: 'mealtracker', label: 'Meal Tracker', icon: 'restaurant',      path: '/meal-tracker' },
  { key: 'jogging',     label: 'Activity',     icon: 'directions_run',  path: '/activity-map' },
  { key: 'community',   label: 'Community',    icon: 'groups',          path: '/community' },
];
