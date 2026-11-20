import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AccountPageShell from '../../../../components/app/AccountPageShell.jsx';
import PageHeader from '../../../../components/app/PageHeader.jsx';
import Icon from '../../../../components/Icon.jsx';
import { useAuth } from '../../../../hooks/useAuth.jsx';
import { apiGet, apiFetch } from '../../../../lib/apiClient.js';
import { useToastStore } from '../../../../stores/toastStore.js';
import LoadingState from '../../../../components/feedback/LoadingState.jsx';
import ErrorState from '../../../../components/feedback/ErrorState.jsx';
import { NotificationCard, NotificationEmpty, NotificationSkeleton } from '../components/NotificationParts.jsx';
import {
  NOTIFICATION_CATEGORIES,
  getCategory,
  getCategoryIcon,
  getCategoryLabel,
  groupByDay,
} from '../notificationPresentation.js';

const STATUS_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'read', label: 'Read' },
];

const Notifications = ({ embedded = false }) => {
  const navigate = useNavigate();
  const { user, loading, logout } = useAuth();
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('all');
  const [cat, setCat] = useState('ALL');
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState(null);

  const userId = user?.id;
  const load = useCallback(async () => {
    if (!userId) return;
    setListLoading(true);
    setListError(null);
    try {
      const data = await apiGet(`/api/notifications/${userId}`);
      setItems(Array.isArray(data.notifications) ? data.notifications : Array.isArray(data) ? data : []);
    } catch (err) {
      setListError(err);
      useToastStore.getState().addToast('Could not load notifications.', 'error');
      if (import.meta.env.DEV) console.error('Notifications load error:', err);
    } finally {
      setListLoading(false);
    }
  }, [userId]);

  // Initial data fetch: setState runs in the async callback, not the effect body.
  useEffect(() => { load(); }, [load]);

  const markRead = async (id) => {
    try {
      await apiFetch(`/api/notifications/${id}/read`, { method: 'PUT' });
      setItems((p) => p.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    } catch (err) {
      if (import.meta.env.DEV) console.error('Mark read failed:', err);
    }
  };

  const markAll = async () => {
    if (!user?.id) return;
    try {
      await apiFetch(`/api/notifications/read-all/${user.id}`, { method: 'PUT' });
      setItems((p) => p.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      if (import.meta.env.DEV) console.error('Mark all read failed:', err);
    }
  };

  const unreadCount = useMemo(() => items.filter((n) => !n.is_read).length, [items]);
  const statusCounts = { all: items.length, unread: unreadCount, read: items.length - unreadCount };

  // Category chip counts follow the selected status filter.
  const statusFiltered = useMemo(
    () => items.filter((n) => (filter === 'unread' ? !n.is_read : filter === 'read' ? !!n.is_read : true)),
    [items, filter],
  );
  const catCounts = useMemo(() => {
    const c = {};
    for (const n of statusFiltered) { const k = getCategory(n); c[k] = (c[k] || 0) + 1; }
    return c;
  }, [statusFiltered]);
  const shown = useMemo(
    () => statusFiltered.filter((n) => (cat === 'ALL' ? true : getCategory(n) === cat)),
    [statusFiltered, cat],
  );
  const groups = useMemo(() => groupByDay(shown), [shown]);

  const handleLogout = async () => { await logout(); navigate('/login'); };
  const resetFilters = () => { setFilter('all'); setCat('ALL'); };

  if (loading) {
    return (
      <AccountPageShell embedded={embedded} userId={user?.id} onLogout={handleLogout} contentClassName="app-container app-container--reading">
          <div className="pt-2 pb-6"><LoadingState message="Loading notifications…" /></div>
      </AccountPageShell>
    );
  }

  const initialLoading = listLoading && items.length === 0 && !listError;

  let empty = null;
  if (!initialLoading && !listError && shown.length === 0) {
    if (items.length === 0) {
      empty = (
        <NotificationEmpty
          icon="notifications"
          title="No notifications yet"
          message="Log activity or meals to trigger AI Coach insights. They'll show up here."
        />
      );
    } else if (filter === 'unread' && cat === 'ALL') {
      empty = <NotificationEmpty icon="done_all" title="You're all caught up" message="No unread notifications. Nice work staying on top of things." />;
    } else {
      empty = (
        <NotificationEmpty
          icon="filter_alt_off"
          title="Nothing matches this filter"
          message="Try another category or status."
          action={<button type="button" className="vn-text-btn" onClick={resetFilters}>Clear filters</button>}
        />
      );
    }
  }

  return (
    <AccountPageShell embedded={embedded} userId={user?.id} onLogout={handleLogout} contentClassName="app-container app-container--reading">
        <div className="pb-6">
          <PageHeader
            eyebrow="Inbox"
            title="Notifications"
            description={unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}. Coach insights, reminders and account updates, newest first.`
              : 'Coach insights, reminders and account updates, newest first.'}
            actions={(
              <button type="button" onClick={markAll} disabled={unreadCount === 0} className="app-btn app-btn--ghost app-btn--sm">
                <Icon name="done_all" weight={400} className="text-[length:var(--fs-16)]" />
                Mark all read
              </button>
            )}
          />

          <div className="vn-page-summary" aria-label="Notification summary">
            {[
              { label: 'Total', value: items.length, icon: 'notifications', fg: 'var(--text-secondary)', bg: 'var(--bg-tertiary)' },
              { label: 'Unread', value: unreadCount, icon: 'mark_email_unread', fg: 'var(--accent)', bg: 'var(--accent-bg)' },
              { label: 'Read', value: items.length - unreadCount, icon: 'done_all', fg: 'var(--success)', bg: 'var(--success-bg)' },
            ].map((s) => (
              <div key={s.label} className="vn-stat">
                <span className="vn-stat__icon" style={{ '--vn-tone': s.fg, '--vn-tone-bg': s.bg }} aria-hidden="true">
                  <Icon name={s.icon} weight={400} />
                </span>
                <span className="vn-stat__text">
                  <span className="vn-stat__value">{s.value}</span>
                  <span className="vn-stat__label">{s.label}</span>
                </span>
              </div>
            ))}
          </div>

          <div className="vn-toolbar">
            <div className="vn-segment" role="group" aria-label="Read status filter">
              {STATUS_FILTERS.map((f) => (
                <button key={f.key} type="button" onClick={() => setFilter(f.key)} aria-pressed={filter === f.key} className="vn-segment__btn">
                  {f.label}
                  <span className="vn-count">{statusCounts[f.key]}</span>
                </button>
              ))}
            </div>
            <div className="vn-chips" role="group" aria-label="Category filter">
              <button type="button" onClick={() => setCat('ALL')} aria-pressed={cat === 'ALL'} className="vn-filter-chip">
                <Icon name="apps" weight={400} />
                All
              </button>
              {NOTIFICATION_CATEGORIES.map((c) => (
                <button key={c} type="button" onClick={() => setCat(c)} aria-pressed={cat === c} className="vn-filter-chip">
                  <Icon name={getCategoryIcon(c)} weight={400} />
                  {getCategoryLabel(c)}
                  {catCounts[c] ? <span className="vn-filter-chip__n">{catCounts[c]}</span> : null}
                </button>
              ))}
            </div>
          </div>

          {listError && <div className="mb-4"><ErrorState message={listError.message || 'Could not load notifications.'} onRetry={load} /></div>}
          {initialLoading && <NotificationSkeleton rows={5} />}
          {empty}

          {groups.map((group) => (
            <section key={group.key} className="vn-group" aria-label={group.label}>
              <h2 className="vn-group__head">
                {group.label}
                <span className="vn-group__count">{group.items.length}</span>
              </h2>
              <ul className="vn-list">
                {group.items.map((n) => (
                  <li key={n.id}>
                    <NotificationCard notification={n} onMarkRead={markRead} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
    </AccountPageShell>
  );
};

export default Notifications;
