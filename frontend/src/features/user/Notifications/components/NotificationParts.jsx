// Shared notification presentation pieces — used by the Topbar bell panel
// and the full Notifications page so both look and behave the same.
import Icon from '../../../../components/Icon.jsx';
import {
  getNotificationMeta,
  splitTitle,
  formatRelativeTime,
  formatFullTime,
} from '../notificationPresentation.js';
import '../notifications.css';

/**
 * One notification card. Unread cards render as a <button> — activating it
 * marks the notification read (the only existing per-item action). Read
 * cards are static.
 */
export function NotificationCard({ notification, onMarkRead, compact = false }) {
  const n = notification;
  const meta = getNotificationMeta(n);
  const { title, body } = splitTitle(n.message, meta.label);
  const unread = !n.is_read;
  const time = formatRelativeTime(n.created_at);
  const fullTime = formatFullTime(n.created_at);

  const content = (
    <>
      <span
        className="vn-card__icon"
        style={{ '--vn-tone': meta.tone.fg, '--vn-tone-bg': meta.tone.bg }}
        aria-hidden="true"
      >
        <Icon name={meta.icon} weight={400} fill={unread ? 1 : 0} />
      </span>

      <span className="vn-card__main">
        <span className="vn-card__top">
          <span className="vn-card__title">{title}</span>
          {time && <time className="vn-card__time" dateTime={String(n.created_at)} title={fullTime}>{time}</time>}
        </span>
        {body && <span className="vn-card__body">{body}</span>}
        <span className="vn-card__meta">
          <span className="vn-chip">{meta.label}</span>
          {unread && <span className="vn-card__hint">Mark as read</span>}
        </span>
      </span>

      {unread && <span className="vn-card__dot" aria-hidden="true" />}
    </>
  );

  const cls = `vn-card${unread ? ' is-unread' : ''}${compact ? ' is-compact' : ''}`;

  if (unread) {
    return (
      <button
        type="button"
        className={cls}
        onClick={(e) => { e.stopPropagation(); onMarkRead?.(n.id); }}
        aria-label={`Unread: ${title}. ${body}. ${fullTime}. Mark as read`}
      >
        {content}
      </button>
    );
  }
  return <div className={cls}>{content}</div>;
}

/** Lightweight skeleton rows for the initial load. */
export function NotificationSkeleton({ rows = 4, compact = false }) {
  return (
    <div className="vn-skeleton-list" role="status" aria-busy="true" aria-label="Loading notifications">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className={`vn-card vn-skeleton${compact ? ' is-compact' : ''}`} aria-hidden="true">
          <span className="vn-card__icon vn-shimmer" />
          <span className="vn-card__main">
            <span className="vn-shimmer vn-shimmer--line" style={{ width: '45%' }} />
            <span className="vn-shimmer vn-shimmer--line" style={{ width: '90%' }} />
            <span className="vn-shimmer vn-shimmer--line" style={{ width: '30%' }} />
          </span>
        </div>
      ))}
    </div>
  );
}

/** Empty / no-results state with a small icon illustration. */
export function NotificationEmpty({ icon = 'notifications', title, message, compact = false, action = null }) {
  return (
    <div className={`vn-empty${compact ? ' is-compact' : ''}`}>
      <span className="vn-empty__art" aria-hidden="true">
        <span className="vn-empty__ring" />
        <Icon name={icon} weight={300} />
      </span>
      <p className="vn-empty__title">{title}</p>
      {message && <p className="vn-empty__msg">{message}</p>}
      {action}
    </div>
  );
}
