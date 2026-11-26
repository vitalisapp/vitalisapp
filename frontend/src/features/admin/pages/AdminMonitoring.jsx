import { useState } from 'react';
import { useAdminFilters } from '../hooks/useAdminFilters.js';
import { ADMIN_FILTERS } from '../utils/urlFilters.js';
import { useAuth } from '../../../hooks/useAuth.jsx';
import { useAdminResource } from '../hooks/useAdminResource.js';
import { useAdminToast } from '../hooks/useAdminToast.jsx';
import UserDrawer from '../components/UserDrawer.jsx';
import ExportMenu from '../components/ExportMenu.jsx';
import Icon from '../../../components/Icon.jsx';
import {
  PageHero, Panel, Pager, StateBlock, TableSkeleton, SearchField,
} from '../components/AdminBits.jsx';
import { apiGet } from '../../../lib/apiClient.js';
import { fmtNum, initials } from '../utils/format.js';
import { fmtAgo } from '../utils/time.js';
import { STATUS_META, StatusDot } from '../components/StatusDot.jsx';

// ── Section 10: user activity monitoring (GREEN / YELLOW / RED) ─────────────
// The backend classifies every member (utils/activityStatus.js) and returns
// the criteria text with the report, so the rules shown here are the rules
// applied. Filters live in the URL (?status=&flag=&q=&page=) like the rest
// of the console, so a filtered view can be refreshed or shared.

const PAGE_SIZE = 20;


const FLAG_GROUPS = [
  { key: 'inactive', label: 'Inactive', icon: 'bedtime' },
  { key: 'missing',  label: 'Missing records', icon: 'event_busy' },
  { key: 'unusual',  label: 'Unusual progress', icon: 'monitor_heart' },
];

const fmtDate = (iso) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const daysLabel = (n) => (n == null ? 'Never' : n === 0 ? 'Today' : n === 1 ? '1 day ago' : `${n} days ago`);

const EXPORT_COLUMNS = [
  { header: 'ID', value: (u) => u.id, type: 'number', width: 8 },
  { header: 'Name', value: (u) => u.name, width: 24 },
  { header: 'Email', value: (u) => u.email, width: 30 },
  { header: 'Status', value: (u) => STATUS_META[u.status]?.short, width: 10 },
  { header: 'Status meaning', value: (u) => STATUS_META[u.status]?.label, width: 18 },
  { header: 'Days since last activity', value: (u) => u.daysInactive, type: 'number', width: 14 },
  { header: 'Last active', value: (u) => u.lastActive, type: 'date', width: 18 },
  { header: 'Workouts (7d)', value: (u) => u.week?.workouts, type: 'number', width: 12 },
  { header: 'Planned workouts', value: (u) => u.week?.planned, type: 'number', width: 12 },
  { header: 'Meal days (7d)', value: (u) => u.week?.mealDays, type: 'number', width: 12 },
  { header: 'Last login', value: (u) => u.lastLogin, type: 'date', width: 18 },
  { header: 'Last workout', value: (u) => u.lastWorkout, type: 'date', width: 18 },
  { header: 'Last meal', value: (u) => u.lastMeal, type: 'date', width: 18 },
  { header: 'Last weigh-in', value: (u) => u.lastWeighIn, type: 'date', width: 18 },
  { header: 'Interpretation', value: (u) => u.interpretation, width: 70 },
  { header: 'Flags', value: (u) => (u.reasons || []).join('; '), width: 60 },
  { header: 'Account', value: (u) => u.accountStatus, width: 12 },
];


function StatusCard({ status = undefined, count = undefined, total = undefined, rule = undefined, active = undefined, onSelect = undefined }) {
  const meta = STATUS_META[status];
  const pct = total ? Math.round((count / total) * 100) : 0;
  return (
    <button
      type="button"
      className={`adm-mon-card is-${status}${active ? ' is-selected' : ''}`}
      onClick={onSelect}
      aria-pressed={active}
    >
      <span className="adm-mon-card__head">
        <span className="adm-mon-status"><span className="adm-mon-dot" aria-hidden="true" />{meta.short}</span>
        <span className="adm-mon-card__label">{meta.label}</span>
      </span>
      <span className="adm-mon-card__value">
        {fmtNum(count)}<small>{pct}%</small>
      </span>
      <span className="adm-mon-card__bar" aria-hidden="true"><span style={{ width: `${pct}%` }} /></span>
      <span className="adm-mon-card__rule">{rule}</span>
    </button>
  );
}

function FlagList({ flags = undefined }) {
  if (!flags?.length) return <span className="adm-cell-muted">No flags</span>;
  const shown = flags.slice(0, 2);
  const rest = flags.length - shown.length;
  return (
    <span className="adm-mon-flags" title={flags.map((f) => f.detail || f.label).join('\n')}>
      {shown.map((f) => (
        <span key={f.key} className={`adm-mon-flag is-${f.group}`}>{f.detail || f.label}</span>
      ))}
      {rest > 0 && <span className="adm-mon-flag is-more">+{rest}</span>}
    </span>
  );
}

export default function AdminMonitoring() {
  const { user: admin } = useAuth();
  const { show, node: toast } = useAdminToast();
  const { values: { status, flag, q, page: pageValue }, update: updateFilters } = useAdminFilters(ADMIN_FILTERS.monitoring);
  const page = Number(pageValue);
  const [search, setSearch] = useState({ key: q, value: q });
  const searchValue = search.key === q ? search.value : q; // follow URL (back/forward)
  const [selected, setSelected] = useState(null);

  const update = (changes) => {
    updateFilters({ page: 1, ...changes });
  };

  const api = new URLSearchParams();
  if (status) api.set('status', status);
  if (flag) api.set('flag', flag);
  if (q) api.set('q', q);
  api.set('page', String(page));
  api.set('limit', String(PAGE_SIZE));
  const { data, loading, error, reload } = useAdminResource(`/api/admin/monitoring?${api.toString()}`);

  const summary = data?.summary || { total: 0, green: 0, yellow: 0, red: 0 };
  const flagCounts = data?.flagCounts || {};
  const criteria = data?.criteria;
  const records = data?.records || [];
  const total = data?.total || 0;
  const servedPage = data?.page || page;
  const filtered = Boolean(status || flag || q);

  const applySearch = (e) => {
    e.preventDefault();
    update({ q: searchValue.trim() });
  };

  const exportRows = async () => {
    const qs = new URLSearchParams({ all: '1' });
    if (status) qs.set('status', status);
    if (flag) qs.set('flag', flag);
    if (q) qs.set('q', q);
    const res = await apiGet(`/api/admin/monitoring?${qs.toString()}`);
    return res?.records || [];
  };

  return (
    <>
      <PageHero
        eyebrow="User monitoring"
        title="Activity"
        accent="status."
        description="See who is training, who is slipping and who has gone quiet. Every member is rated green, yellow or red from their own logs."
        image="/admin/hero-members.jpg"
        chips={[
          { label: `${fmtNum(summary.total)} members`, icon: 'group' },
          { label: `${fmtNum((summary.yellow || 0) + (summary.red || 0))} need attention`, icon: 'notification_important' },
        ]}
      />

      <div className="adm-mon-cards" role="group" aria-label="Filter by activity status">
        {['green', 'yellow', 'red'].map((s) => (
          <StatusCard
            key={s}
            status={s}
            count={summary[s] || 0}
            total={summary.total}
            rule={criteria?.[s]}
            active={status === s}
            onSelect={() => update({ status: status === s ? '' : s })}
          />
        ))}
      </div>

      <Panel
        title="Members by activity"
        subtitle="Most urgent first. Click a member to inspect the account."
        icon="monitor_heart"
        actions={(
          <>
            <ExportMenu
              columns={EXPORT_COLUMNS}
              fileName={`vitalis-activity-report${status ? `-${status}` : ''}`}
              sheetName="Activity report"
              onToast={show}
              disabled={!total}
              getRows={exportRows}
            />
            <button type="button" className="adm-btn is-sm is-ghost" onClick={reload}><Icon name="refresh" /> Refresh</button>
          </>
        )}
        flush
      >
        <form className="adm-toolbar adm-mon-toolbar" onSubmit={applySearch}>
          <SearchField value={searchValue} onChange={(v) => setSearch({ key: q, value: v })} placeholder="Search name or email…" />
          <button type="submit" className="adm-btn"><Icon name="search" /> Search</button>
          <span className="adm-toolbar__spacer" />
          <div className="adm-mon-chips" role="group" aria-label="Filter by flag">
            <button type="button" className={`adm-mon-chip${!flag ? ' is-on' : ''}`} onClick={() => update({ flag: '' })} aria-pressed={!flag}>
              All flags
            </button>
            {FLAG_GROUPS.map((g) => (
              <button
                key={g.key}
                type="button"
                className={`adm-mon-chip${flag === g.key ? ' is-on' : ''}`}
                onClick={() => update({ flag: flag === g.key ? '' : g.key })}
                aria-pressed={flag === g.key}
              >
                <Icon name={g.icon} />{g.label}<b>{fmtNum(flagCounts[g.key] || 0)}</b>
              </button>
            ))}
          </div>
        </form>

        {filtered && (
          <div className="adm-mon-active">
            <span>{fmtNum(total)} of {fmtNum(summary.total)} members</span>
            {status && <span className={`adm-mon-tag is-${status}`}>{STATUS_META[status].label}</span>}
            {flag && <span className="adm-mon-tag">{FLAG_GROUPS.find((g) => g.key === flag)?.label}</span>}
            {q && <span className="adm-mon-tag">“{q}”</span>}
            <button type="button" className="adm-btn is-ghost is-sm" onClick={() => { setSearch({ key: '', value: '' }); update({ q: '', status: '', flag: '' }); }}>
              Clear filters
            </button>
          </div>
        )}

        {loading && !data && <TableSkeleton rows={8} />}

        {error && !loading && (
          <StateBlock
            kind="error"
            title="Could not load the activity report"
            note={error.message}
            action={<button type="button" className="adm-btn is-sm is-primary" onClick={reload}><Icon name="refresh" /> Retry</button>}
          />
        )}

        {!error && data && records.length === 0 && (
          <StateBlock
            icon={filtered ? 'person_search' : 'group'}
            title={filtered ? 'No members match' : 'No members yet'}
            note={filtered ? 'Try another status, flag or search.' : 'Members appear here after they sign up.'}
          />
        )}

        {!error && records.length > 0 && (
          <div className="adm-table-wrap">
            <table className="adm-table adm-mon-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Status</th>
                  <th>Last active</th>
                  <th>This week</th>
                  <th>Flags</th>
                </tr>
              </thead>
              <tbody>
                {records.map((u) => (
                  <tr key={u.id} className="is-clickable" onClick={() => setSelected(u.id)}>
                    <td>
                      <div className="adm-person">
                        <span className="adm-avatar">{initials(u.name)}</span>
                        <span className="adm-person__copy">
                          <span className="adm-person__name">
                            {u.name}
                            {u.isNew && <span className="adm-mon-new">New</span>}
                            {u.accountStatus === 'deactivated' && <span className="adm-mon-new is-off">Deactivated</span>}
                          </span>
                          <span className="adm-person__mail">{u.email}</span>
                        </span>
                      </div>
                    </td>
                    <td title={u.interpretation || undefined}><StatusDot status={u.status} /></td>
                    <td>
                      <span className="adm-mon-when">{daysLabel(u.daysInactive)}</span>
                      {u.lastActive && <span className="adm-mon-sub">{fmtDate(u.lastActive)}</span>}
                    </td>
                    <td>
                      <span className="adm-mon-week">
                        <span title="Workouts logged / planned this week"><Icon name="fitness_center" />{u.week.workouts}/{u.week.planned}</span>
                        <span title="Days with meals logged, out of 7"><Icon name="restaurant" />{u.week.mealDays}/7</span>
                      </span>
                    </td>
                    <td><FlagList flags={u.flags} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pager
              total={total}
              limit={PAGE_SIZE}
              offset={(servedPage - 1) * PAGE_SIZE}
              onChange={(offset) => update({ page: Math.floor(offset / PAGE_SIZE) + 1 })}
            />
          </div>
        )}
      </Panel>

      {criteria && (
        <Panel title="How status is decided" subtitle="Measured from each member's own logs over fixed time windows." icon="rule">
          <dl className="adm-mon-criteria">
            {['green', 'yellow', 'red'].map((s) => (
              <div key={s}>
                <dt><StatusDot status={s} /></dt>
                <dd>{criteria[s]}</dd>
              </div>
            ))}
          </dl>
          <h3 className="adm-mon-criteria__title">Report flags</h3>
          <dl className="adm-mon-criteria is-flags">
            {FLAG_GROUPS.map((g) => (
              <div key={g.key}>
                <dt><span className={`adm-mon-flag is-${g.key}`}>{g.label}</span></dt>
                <dd>{criteria.flags?.[g.key]}</dd>
              </div>
            ))}
          </dl>
          {data?.generatedAt && <p className="adm-mon-generated">Report generated {fmtAgo(data.generatedAt)}. Unusual-progress flags never change a color on their own.</p>}
        </Panel>
      )}

      {selected && (
        <UserDrawer
          userId={selected}
          currentAdminId={admin?.id}
          onClose={() => setSelected(null)}
          onToast={show}
          onChanged={reload}
        />
      )}
      {toast}
    </>
  );
}
