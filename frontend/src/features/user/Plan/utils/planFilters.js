import { guideFilterOptions } from '../../CameraWorkout/constants/workoutGuide.js';
import { INTENSITY_OPTIONS, FOCUS_OPTIONS, DURATION_OPTIONS, CATEGORIES } from '../utils/planFormat.js';

// URL-backed filters per tab (?tab=library&equipment=dumbbell, ?category=strength…).
export const GUIDE_OPTS = guideFilterOptions();
export const LIBRARY_FILTERS = {
  q: {},
  equipment: { options: GUIDE_OPTS.equipment },
  muscle: { options: GUIDE_OPTS.muscles },
  type: { options: GUIDE_OPTS.types },
};
const withoutAll = (opts) => opts.filter((o) => o !== 'All');
export const EXPLORE_FILTERS = {
  q: {},
  category: { options: CATEGORIES.map((c) => c.tag).filter(Boolean) },
  intensity: { options: withoutAll(INTENSITY_OPTIONS) },
  focus: { options: withoutAll(FOCUS_OPTIONS) },
  duration: { options: withoutAll(DURATION_OPTIONS) },
};
// Every tab-scoped filter param; dropped when switching tabs.
export const TAB_FILTER_PARAMS = [...new Set([...Object.keys(LIBRARY_FILTERS), ...Object.keys(EXPLORE_FILTERS)])];
