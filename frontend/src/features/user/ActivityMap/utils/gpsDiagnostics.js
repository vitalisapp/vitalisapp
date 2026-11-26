// Development-only GPS diagnostics for physical-device testing.
//
// Keeps the last fixes (raw + smoothed + route verdict) in memory and lets the
// tester download them as JSON to replay through the filters offline.
// Never sent anywhere; disabled in production builds (callers gate on
// GPS_DIAGNOSTICS_ENABLED, so Vite strips the calls). Precise location data
// stays on the device unless the tester shares the file themselves.

export const GPS_DIAGNOSTICS_ENABLED = import.meta.env?.DEV === true;

const MAX_ENTRIES = 5000;
const entries = [];

export const recordGpsFix = (entry) => {
  if (!GPS_DIAGNOSTICS_ENABLED) return;
  entries.push(entry);
  if (entries.length > MAX_ENTRIES) entries.splice(0, entries.length - MAX_ENTRIES);
};

export const gpsDiagnosticsCount = () => entries.length;

export const exportGpsDiagnostics = () => {
  if (!GPS_DIAGNOSTICS_ENABLED || typeof document === 'undefined') return;
  const blob = new Blob(
    [JSON.stringify({ exportedAt: new Date().toISOString(), userAgent: navigator.userAgent, fixes: entries }, null, 1)],
    { type: 'application/json' },
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `vitalis-gps-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};
