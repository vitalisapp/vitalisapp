import { apiGet, apiPost } from '../../../lib/apiClient.js';

const ZONE_COLOR_MAP = {
  5: { color: 'bg-red-500',    label: 'Zone 5 (Anaerobic)'    },
  4: { color: 'bg-orange-400', label: 'Zone 4 (Threshold)'    },
  3: { color: 'bg-yellow-400', label: 'Zone 3 (Tempo)'        },
  2: { color: 'bg-[#D1FD52]',  label: 'Zone 2 (Aerobic Base)' },
  1: { color: 'bg-blue-400',   label: 'Zone 1 (Recovery)'     },
};

export const DEFAULT_ZONES = [
  { zone: 5, label: 'Zone 5 (Anaerobic)',    value: '0%', color: 'bg-red-500'    },
  { zone: 4, label: 'Zone 4 (Threshold)',    value: '0%', color: 'bg-orange-400' },
  { zone: 2, label: 'Zone 2 (Aerobic Base)', value: '0%', color: 'bg-[#D1FD52]' },
];

// Normalize UI labels ("Week"/"Weekly") to backend enums.
const normalizeTimeframe = (tf) => {
  const v = String(tf || 'Weekly').toLowerCase();
  if (v.startsWith('week')) return 'weekly';
  if (v.startsWith('month')) return 'monthly';
  if (v.startsWith('quarter') || v.startsWith('year')) return 'quarterly';
  return 'weekly';
};

export async function fetchZonesFromAPI(userId, timeframe) {
  const data = await apiGet(
    `/api/analytics/zones/${userId}?timeframe=${normalizeTimeframe(timeframe)}`
  );

  if (!Array.isArray(data) || data.length === 0) return DEFAULT_ZONES;

  return data.map(row => ({
    zone:    row.zone,
    label:   row.label,
    minutes: row.minutes,
    value:   row.value,
    color:   ZONE_COLOR_MAP[row.zone]?.color ?? 'bg-neutral-500',
  }));
}

export async function fetchScatterData(userId, timeframe) {
  const data = await apiGet(
    `/api/sleep/${userId}/scatter?timeframe=${normalizeTimeframe(timeframe)}`
  );

  return Array.isArray(data) ? data : [];
}

export async function fetchTodaySleep(userId) {
  return apiGet(`/api/sleep/${userId}/today`);
}

export async function saveSleepData(userId, payload) {
  return apiPost(`/api/sleep/${userId}`, payload);
}