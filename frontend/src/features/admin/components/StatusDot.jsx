// Section 10 — GREEN / YELLOW / RED activity status dot (Monitoring + Users).
/* eslint-disable react-refresh/only-export-components */
export const STATUS_META = {
  green:  { label: 'Active',          short: 'Green',  icon: 'check_circle' },
  yellow: { label: 'Needs attention', short: 'Yellow', icon: 'error' },
  red:    { label: 'Inactive',        short: 'Red',    icon: 'cancel' },
};

export function StatusDot({ status = undefined, withLabel = true }) {
  const meta = STATUS_META[status];
  if (!meta) return <span className="adm-cell-muted">—</span>;
  return (
    <span className={`adm-mon-status is-${status}`} title={meta.label} aria-label={withLabel ? undefined : meta.label}>
      <span className="adm-mon-dot" aria-hidden="true" />
      {withLabel && meta.label}
    </span>
  );
}
