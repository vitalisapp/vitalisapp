// Chat timestamps arrive as ISO-8601 UTC (`sent_at`). They are always shown in
// the viewer's own timezone, 12-hour (e.g. "7:46 AM") — never server-formatted.

/** @param {{ sent_at?: string | null } | null | undefined} msg @returns {Date | null} */
export function messageDate(msg) {
  if (!msg?.sent_at) return null;
  const d = new Date(msg.sent_at);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** @param {{ sent_at?: string | null } | null | undefined} msg @returns {string} */
export function formatMessageTime(msg, locale) {
  const d = messageDate(msg);
  if (!d) return '';
  return d.toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit', hour12: true });
}

/** Full date + time for tooltips, e.g. "Sat, Nov 28, 2026, 7:46 AM". */
export function formatMessageTooltip(msg, locale) {
  const d = messageDate(msg);
  if (!d) return '';
  return d.toLocaleString(locale, {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  });
}
