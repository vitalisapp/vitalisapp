export const fmtNum = (value) => Number(value || 0).toLocaleString('en-US');

export const initials = (name = '') => {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const fmtWhen = (value) => {
  if (!value) return '—';
  const d = new Date(String(value).replace(' ', 'T'));
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export const fmtDay = (value) => {
  if (!value) return '—';
  const d = new Date(String(value).length <= 10 ? `${value}T00:00:00` : String(value).replace(' ', 'T'));
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const humanize = (value) => String(value || '—')
  .toLowerCase()
  .replace(/_/g, ' ')
  .replace(/\b\w/g, (c) => c.toUpperCase());

// +639059335613 -> "+63 905 933 5613". Anything unexpected is shown as-is.
export const fmtPhone = (value) => {
  const raw = String(value || '').trim();
  const m = /^\+63(9\d{2})(\d{3})(\d{4})$/.exec(raw);
  return m ? `+63 ${m[1]} ${m[2]} ${m[3]}` : (raw || '—');
};

// Verification method from the admin API (verification_method / pending_method).
export const verificationMeta = (user) => {
  if (user?.verification_method === 'phone') return { label: 'Phone (SMS)', short: 'Phone', icon: 'smartphone', tone: 'active' };
  if (user?.verification_method === 'email') return { label: 'Email', short: 'Email', icon: 'mail', tone: 'info' };
  if (user?.pending_method === 'phone') return { label: 'Pending · Phone (SMS)', short: 'Pending SMS', icon: 'sms', tone: 'warn' };
  return { label: 'Pending · Email', short: 'Pending email', icon: 'mark_email_unread', tone: 'warn' };
};
