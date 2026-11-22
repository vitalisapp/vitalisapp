// Local avatar rendering: stored image or gradient + initials.
// Capitalize the first letter of each word: "ryan" → "Ryan", "user1 smith" → "User1 Smith".
export const capitalizeName = (name) =>
  String(name || '')
    .trim()
    .replace(/\b\p{L}/gu, (c) => c.toUpperCase());

export const getInitials = (name) => {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return '?';
  // One letter: the first character of the name ("Juan Dela Cruz" → "J").
  return Array.from(parts[0])[0].toUpperCase();
};

const hashSeed = (seed) => {
  const s = String(seed ?? '');
  let h = 0;
  for (let i = 0; i < s.length; i += 1) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h;
};

// Random-HUE gradient. Retained for non-avatar artwork (Plan covers) that
// wants a distinct colored tile per seed. NOT for user avatars — those use
// avatarSurface() below so they stay inside the Vitalis palette.
export const avatarGradient = (seed) => {
  const hue = hashSeed(seed) % 360;
  const hue2 = (hue + 45) % 360;
  return `linear-gradient(135deg, hsl(${hue} 55% 42%) 0%, hsl(${hue2} 60% 30%) 100%)`;
};

// Themed fallback for initials avatars. Every stop is a CSS design token, so
// the circle automatically re-tints on light/dark themes and can never drift
// off-brand the way a hashed HUE does. Tones are deliberately low-chroma
// (charcoal / olive / emerald / accent-tint) and the initials carry the
// accent, keeping the mark restrained rather than a neon disc.
const AVATAR_SURFACES = [
  'linear-gradient(140deg, var(--bg-elevated) 0%, var(--bg-tertiary) 100%)',
  'linear-gradient(140deg, var(--accent-bg) 0%, var(--bg-elevated) 100%)',
  'linear-gradient(140deg, var(--olive-bg) 0%, var(--bg-tertiary) 100%)',
  'linear-gradient(140deg, var(--emerald-bg) 0%, var(--bg-elevated) 100%)',
];

/**
 * Theme-native avatar background + matching foreground for initials.
 * @param {unknown} seed stable identifier (user name, contact id, preset id)
 * @returns {{ background: string, color: string }}
 */
export const avatarSurface = (seed) => ({
  background: AVATAR_SURFACES[hashSeed(seed) % AVATAR_SURFACES.length],
  color: 'var(--accent)',
});

export const isPresetToken = (v) => typeof v === 'string' && v.startsWith('preset:');

export const DEFAULT_AVATARS = [
  { id: 'preset:atlas', seed: 'atlas', label: 'Atlas' },
  { id: 'preset:zara', seed: 'zara', label: 'Zara' },
  { id: 'preset:cyborg', seed: 'cyborg', label: 'Cyborg' },
  { id: 'preset:nova', seed: 'nova', label: 'Nova' },
];

export const getAvatarUrl = (seed) =>
  `preset:${
    String(seed || 'vitalis')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '') || 'vitalis'
  }`;

// Third-party pictures the app used to adopt automatically (generated
// avatars, Gravatar, Google account photos). They render as the lettered
// circle instead; only an image the user uploads in Vitalis is shown.
const RETIRED_HOSTS = ['dicebear', 'ui-avatars', 'gravatar.com', 'googleusercontent.com'];
export const resolveAvatar = (avatarUrl, name, seedFallback = '') => {
  if (typeof avatarUrl === 'string' && avatarUrl.length > 0 && !isPresetToken(avatarUrl)) {
    if (RETIRED_HOSTS.some((h) => avatarUrl.includes(h))) {
      const seed = name || seedFallback || 'vitalis';
      return {
        kind: 'initials',
        gradient: avatarGradient(seed),
        surface: avatarSurface(seed),
        initials: getInitials(name),
      };
    }
    // Callers fall back to initials when the <img> fails to load, so the
    // image result must carry the same surface/initials as the initials case.
    const seed = name || seedFallback || 'vitalis';
    return {
      kind: 'image',
      src: avatarUrl,
      gradient: avatarGradient(seed),
      surface: avatarSurface(seed),
      initials: getInitials(name),
    };
  }
  const seed = isPresetToken(avatarUrl) ? avatarUrl : name || seedFallback || 'vitalis';
  return {
    kind: 'initials',
    gradient: avatarGradient(seed),
    surface: avatarSurface(seed),
    initials: getInitials(name),
  };
};
