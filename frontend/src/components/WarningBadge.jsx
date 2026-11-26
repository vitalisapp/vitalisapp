/**
 * Small circular "!" badge used to flag a specific thing that needs attention
 * (a weak password, a missing metric, an unfinished setup).
 *
 * The badge is a real accessible node: screen readers hear `label`, pointers
 * get the same text as a native tooltip. `ring` should match the surface the
 * badge sits on so the disc keeps a clean edge on cards, menus and avatars.
 */
export default function WarningBadge({
  label,
  size = 16,
  ring = 'var(--bg-secondary)',
  className = '',
  style = undefined,
}) {
  return (
    <span
      role="img"
      aria-label={label}
      title={label}
      className={`v-warn-badge${className ? ` ${className}` : ''}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        width: size,
        height: size,
        borderRadius: '999px',
        background: 'color-mix(in srgb, var(--warning) 35%, #ffe600)',
        color: '#1c1200',
        boxShadow: `0 0 0 2px ${ring}`,
        fontSize: Math.max(9, Math.round(size * 0.68)),
        fontWeight: 800,
        lineHeight: 1,
        ...style,
      }}
    >
      !
    </span>
  );
}
