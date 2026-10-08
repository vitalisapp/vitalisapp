// Local avatar rendering: stored image or gradient + initials.
export const getInitials = (name) => {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const hashSeed = (seed) => {
  const s = String(seed ?? '');
  let h = 0;
  for (let i = 0; i < s.length; i += 1) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h;
};

export const avatarGradient = (seed) => {
  const hue = hashSeed(seed) % 360;
  const hue2 = (hue + 45) % 360;
  return `linear-gradient(135deg, hsl(${hue} 55% 42%) 0%, hsl(${hue2} 60% 30%) 100%)`;
};

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

const RETIRED_HOSTS = ['dicebear', 'ui-avatars'];
export const resolveAvatar = (avatarUrl, name, seedFallback = '') => {
  if (typeof avatarUrl === 'string' && avatarUrl.length > 0 && !isPresetToken(avatarUrl)) {
    if (RETIRED_HOSTS.some((h) => avatarUrl.includes(h))) {
      return {
        kind: 'initials',
        gradient: avatarGradient(name || seedFallback || 'vitalis'),
        initials: getInitials(name),
      };
    }
    return { kind: 'image', src: avatarUrl };
  }
  const seed = isPresetToken(avatarUrl) ? avatarUrl : name || seedFallback || 'vitalis';
  return { kind: 'initials', gradient: avatarGradient(seed), initials: getInitials(name) };
};
