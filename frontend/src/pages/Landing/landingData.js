export const GYM_BG = "/hero-gym.jpg";
export const EASE_EXPO = [0.16, 1, 0.3, 1];

export const FEATURES = [
  {
    icon: "bedtime",
    title: "Sleep & recovery",
    desc: "Log sleep, water, and daily check-ins. Your readiness score is computed from your own logs each morning.",
    num: "01",
  },
  {
    icon: "fitness_center",
    title: "Training plans",
    desc: "Follow structured plans day by day, enroll with one tap, and track progress as you complete sessions.",
    num: "02",
  },
  {
    icon: "analytics",
    title: "Progress analytics",
    desc: "Weight, BMI, and training-volume trends drawn live from the data you have already logged.",
    num: "03",
  },
  {
    icon: "forum",
    title: "Community & messenger",
    desc: "Share milestones on the community feed and coordinate with training partners over private chat.",
    num: "04",
  },
];

export const STEPS = [
  {
    num: "1",
    title: "Create your account",
    desc: "Create an account in under a minute. Free to use — no credit card.",
  },
  {
    num: "2",
    title: "Log your training",
    desc: "Record workouts, meals, sleep, and runs manually as you go.",
  },
  {
    num: "3",
    title: "Follow your progress",
    desc: "Readiness scores, trends, and plans update automatically from your logs.",
  },
];

export const ABOUT_STATS = [
  { value: "4", label: "Tracking Modules" },
  { value: "100%", label: "Manual-First Logging" },
  { value: "Free", label: "Student-Built v1" },
];

export const NAV_LINKS = [
  { href: "#top", label: "Home" },
  { href: "#features", label: "Features" },
  { href: "#about", label: "About" },
];

// Every module in the system, shown in the About section.
// Paths are real in-app routes (guests are sent to /register first).
export const SYSTEM_MODULES = [
  {
    icon: "dashboard",
    title: "Overview",
    desc: "Your daily readiness score and a summary of sleep, meals, and training.",
    path: "/dashboard",
  },
  {
    icon: "restaurant",
    title: "Nutrition",
    desc: "Log meals by hand or snap a photo for an AI macro estimate.",
    path: "/dashboard/meal-tracker",
  },
  {
    icon: "exercise",
    title: "Training",
    desc: "Camera-guided workouts with automatic rep counting.",
    path: "/dashboard/workouts",
  },
  {
    icon: "directions_run",
    title: "Activity",
    desc: "Record GPS runs and rides on a map, with kudos from friends.",
    path: "/dashboard/activity-map",
  },
  {
    icon: "monitor_heart",
    title: "Recovery",
    desc: "Sleep trends, recovery scores, and 14-day training volume.",
    path: "/dashboard/analytics",
  },
  {
    icon: "history",
    title: "Progress",
    desc: "The full history of everything you have logged, in one timeline.",
    path: "/dashboard/logs",
  },
  {
    icon: "groups",
    title: "Community",
    desc: "A public feed to share milestones, with likes and comments.",
    path: "/dashboard/community",
  },
  {
    icon: "chat",
    title: "Messages",
    desc: "Private one-to-one chats with training partners.",
    path: "/dashboard/messenger",
  },
  {
    icon: "book",
    title: "Plans",
    desc: "Structured training plans with day-by-day progress tracking.",
    path: "/dashboard/plans",
  },
];

// Product-tour slides pair each feature with photography.
// Only two house photos ship with the app, so they alternate.
export const FEATURE_SHOTS = [
  { img: "/hero-gym.jpg", alt: "Athlete training with a barbell" },
  { img: "/auth-gym.jpg", alt: "Dumbbells racked in a gym" },
];

export const formatCount = (n) => {
  const v = Number(n || 0);
  if (v >= 1000) return `${(v / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(v);
};

export const buildPlansPath = ({ planId = null, tab = "explore" } = {}) => {
  const params = new URLSearchParams();
  if (planId) params.set("planId", String(planId));
  else params.set("tab", tab);
  return `/dashboard/plans?${params.toString()}`;
};
