// Landing-page "Integrated modules" stat. Single source of truth for how many
// tracking modules Vitalis ships. Add or remove a module here and the landing
// number updates on the next public/landing-stats read (60s cache).
const LANDING_MODULES = [
  { key: 'meal-tracker', name: 'Nutrition & meals', route: '/meal-tracker' },
  { key: 'workouts', name: 'Camera workouts', route: '/workouts' },
  { key: 'activity-map', name: 'Activity & GPS', route: '/activity-map' },
  { key: 'logs', name: 'Progress logs', route: '/logs' },
  { key: 'community', name: 'Community feed', route: '/community' },
  { key: 'messenger', name: 'Messages', route: '/community/messages' },
  { key: 'plans', name: 'Training plans', route: '/plans' },
  { key: 'notifications', name: 'Notifications', route: '/notifications' },
];

const MODULE_COUNT = LANDING_MODULES.length;

module.exports = { LANDING_MODULES, MODULE_COUNT };
