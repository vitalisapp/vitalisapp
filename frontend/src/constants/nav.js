export const MAIN_NAV = [
  { key: 'overview',    label: 'Overview',    icon: 'dashboard',       path: '/dashboard' },
  { key: 'nutrition',   label: 'Nutrition',   icon: 'restaurant',      path: '/dashboard/meal-tracker' },
  { key: 'training',    label: 'Training',    icon: 'exercise',        path: '/dashboard/workouts' },
  { key: 'activity',    label: 'Activity',    icon: 'directions_run',  path: '/dashboard/activity-map' },
  { key: 'recovery',    label: 'Recovery',    icon: 'monitor_heart',   path: '/dashboard/analytics' },
  { key: 'progress',    label: 'Progress',    icon: 'history',         path: '/dashboard/logs' },
  { key: 'community',   label: 'Community',   icon: 'groups',          path: '/dashboard/community' },
  { key: 'messages',    label: 'Messages',    icon: 'chat',            path: '/dashboard/messenger' },
  { key: 'plans',       label: 'Plans',       icon: 'book',            path: '/dashboard/plans' },
];

// Desktop nav — single source. Sidebar.jsx consumes NAV_ITEMS.
const toNavEntry = ({ key, label, icon, path }) => ({ key, icon, label, name: label, path });
export const NAV_ITEMS = MAIN_NAV.map(toNavEntry);

export const getSettingsItems = (navigate) => [
  { icon: 'person',        label: 'Profile',        accent: true, action: () => navigate('/dashboard/profile') },
  { icon: 'tune',          label: 'Preferences',                  action: () => navigate('/dashboard/preferences') },
  { icon: 'notifications', label: 'Notifications',               action: () => navigate('/dashboard/notifications') },
  { icon: 'help_outline',  label: 'Help & Support',              action: () => navigate('/dashboard/help-support') },
];

export const ACTIVE_NAV_KEY = 'vitalis:activeNav';

// Mobile bottom bar — exactly what the phones show.
// Main 4 (always visible): Dashboard, Progress, Workout, Plans.
// Plus (+) sheet: MealTracker, Jogging, Community, Messenger, Recovery.
export const MOBILE_MAIN_NAV = [
  { key: 'dashboard', label: 'Dashboard', icon: 'grid_view',     path: '/dashboard' },
  { key: 'progress',  label: 'Progress',  icon: 'history',       path: '/dashboard/logs' },
  { key: 'workout',   label: 'Workout',   icon: 'exercise',      path: '/dashboard/workouts' },
  { key: 'plans',     label: 'Plans',     icon: 'book',          path: '/dashboard/plans' },
];

export const MOBILE_MORE_NAV = [
  { key: 'mealtracker', label: 'Meal Tracker', icon: 'restaurant',      path: '/dashboard/meal-tracker' },
  { key: 'jogging',     label: 'Jogging',      icon: 'directions_run',  path: '/dashboard/activity-map' },
  { key: 'community',   label: 'Community',    icon: 'groups',          path: '/dashboard/community' },
  { key: 'messenger',   label: 'Messenger',    icon: 'chat',            path: '/dashboard/messenger' },
  { key: 'recovery',    label: 'Recovery',     icon: 'monitor_heart',   path: '/dashboard/analytics' },
];