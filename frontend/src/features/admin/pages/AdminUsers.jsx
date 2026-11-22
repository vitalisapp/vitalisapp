import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth.jsx';
import { useAdminResource } from '../hooks/useAdminResource.js';
import UserDrawer from '../components/UserDrawer.jsx';
import Icon from '../../../components/Icon.jsx';
import {
  Badge, PageHero, Panel, Pager, StateBlock, TableSkeleton,
  SearchField,
} from '../components/AdminBits.jsx';
import { useAdminToast } from '../hooks/useAdminToast.jsx';
import { fmtNum, fmtWhen, initials, verificationMeta } from '../utils/format.js';
import ExportMenu from '../components/ExportMenu.jsx';
import { fetchAllRows } from '../utils/exportTable.js';
import { StatusDot } from '../components/StatusDot.jsx';

// +639059335613 -> "0905 933 5613"; anything else passes through.
const exportPhone = (value) => {
  const m = /^\+63(9\d{2})(\d{3})(\d{4})$/.exec(String(value || ''));
  return m ? `0${m[1]} ${m[2]} ${m[3]}` : (value || null);
};

// Export columns — same data as the table plus verification + phone.
const USER_EXPORT_COLUMNS = [
  { header: 'ID', value: (u) => u.id, type: 'number', width: 8 },
  { header: 'Name', value: (u) => u.name, width: 24 },
  { header: 'Email', value: (u) => u.email, width: 30 },
  // Local spaced format: keeps the leading 0 and stays text in Excel
  // (a bare +639… would become 6.39E+11 or a formula).
  { header: 'Phone', value: (u) => exportPhone(u.phone), width: 16 },
  { header: 'Role', value: (u) => u.role, width: 10 },
  { header: 'Status', value: (u) => u.status, width: 12 },
  { header: 'Activity', value: (u) => u.activity?.status || null, width: 10 },
  { header: 'Verified', value: (u) => Boolean(u.is_verified), width: 10 },
  { header: 'Verification', value: (u) => verificationMeta(u).label, width: 22 },
  { header: 'Phone verified at', value: (u) => u.phone_verified_at, type: 'date', width: 18 },
  { header: 'Onboarding complete', value: (u) => Boolean(u.onboarding_completed), width: 20 },
  { header: 'Terms accepted at', value: (u) => u.accepted_terms_at, type: 'date', width: 18 },
  { header: 'Joined', value: (u) => u.created_at, type: 'date', width: 18 },
];

const PAGE_SIZE = 12;

export default function AdminUsers() {
  const { user: admin } = useAuth();
  const { show, node: toast } = useAdminToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlQuery = searchParams.get('q') || '';
  const [search, setSearch] = useState(urlQuery);
  const [query, setQuery] = useState(urlQuery);
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [offset, setOffset] = useState(0);
  const [selected, setSelected] = useState(null);

  // The shared admin topbar writes `?q=`, so the in-page field follows the
  // URL when search comes from there, a browser back/forward or Clear.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearch(urlQuery);
    setQuery(urlQuery);
    setOffset(0);
  }, [urlQuery]);

  const params = new URLSearchParams();
  if (query) params.set('q', query);
  if (role) params.set('role', role);
  if (status) params.set('status', status);
  params.set('limit', String(PAGE_SIZE));
  params.set('offset', String(offset));

  const { data, loading, error, reload } = useAdminResource(`/api/admin/users?${params.toString()}`);
  const records = data?.records || [];
  const total = data?.total || 0;

  const applySearch = (event) => {
    event.preventDefault();
    const term = search.trim();
    setQuery(term);
    setOffset(0);
    setSearchParams(term ? { q: term } : {}, { replace: true });
  };

  const clearSearch = () => {
    setSearch('');
    setQuery('');
    setOffset(0);
    setSearchParams({}, { replace: true });
  };

  return (
    <>
      <PageHero
        eyebrow="Access control"
        title="Member"
        accent="directory."
        description="Every account on Vitalis. Promote trustworthy members, deactivate abuse, force sign-outs and inspect activity before you act."
        image="/admin/hero-members.jpg"
        chips={[
          { label: `${fmtNum(total)} matching accounts`, icon: 'group' },
          { label: 'Self-actions blocked', icon: 'lock' },
        ]}
      />

      <Panel
        title="Accounts"
        subtitle="Search by name or email. Mutating actions are recorded in the audit trail."
        icon="manage_accounts"
        actions={(
          <>
            <ExportMenu
              columns={USER_EXPORT_COLUMNS}
              fileName="vitalis-users"
              sheetName="Users"
              onToast={show}
              disabled={!total}
              getRows={() => fetchAllRows('/api/admin/users', { q: query, role, status })}
            />
            <button type="button" className="adm-btn is-sm is-ghost" onClick={reload}><Icon name="refresh" /> Refresh</button>
          </>
        )}
        flush
      >
        <form className="adm-toolbar" style={{ padding: '4px 20px 14px' }} onSubmit={applySearch}>
          <SearchField value={search} onChange={setSearch} placeholder="Search name or email…" />
          <button type="submit" className="adm-btn"><Icon name="search" /> Search</button>
          {query && (
            <button type="button" className="adm-btn is-ghost is-sm" onClick={clearSearch}>
              Clear
            </button>
          )}
          <span className="adm-toolbar__spacer" />
          <select className="adm-select" value={role} aria-label="Filter by role"
            onChange={(e) => { setRole(e.target.value); setOffset(0); }}>
            <option value="">All roles</option>
            <option value="member">Members</option>
            <option value="admin">Admins</option>
          </select>
          <select className="adm-select" value={status} aria-label="Filter by status"
            onChange={(e) => { setStatus(e.target.value); setOffset(0); }}>
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="deactivated">Deactivated</option>
          </select>
        </form>

        {loading && <TableSkeleton rows={8} />}

        {error && !loading && (
          <StateBlock
            kind="error"
            title="Could not load accounts"
            note={error.message}
            action={<button type="button" className="adm-btn is-sm is-primary" onClick={reload}><Icon name="refresh" /> Retry</button>}
          />
        )}

        {!loading && !error && records.length === 0 && (
          <StateBlock
            icon="person_search"
            title="No accounts match"
            note="Try a different name, email, role or status."
          />
        )}

        {!loading && !error && records.length > 0 && (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Activity</th>
                  <th>Verification</th>
                  <th>Joined</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((row) => (
                  <tr key={row.id} className="is-clickable" onClick={() => setSelected(row.id)}>
                    <td>
                      <div className="adm-person">
                        <span className="adm-avatar">{initials(row.name)}</span>
                        <span className="adm-person__copy">
                          <span className="adm-person__name">{row.name}{Number(row.id) === Number(admin?.id) ? ' (you)' : ''}</span>
                          <span className="adm-person__mail">{row.email}</span>
                        </span>
                      </div>
                    </td>
                    <td><Badge tone={row.role === 'admin' ? 'admin' : 'member'}>{row.role}</Badge></td>
                    <td><Badge tone={row.status === 'active' ? 'active' : 'off'}>{row.status}</Badge></td>
                    <td title={row.activity?.reasons?.join('\n') || undefined}>
                      {row.activity ? <StatusDot status={row.activity.status} /> : <span className="adm-cell-muted">—</span>}
                    </td>
                    <td>
                      {(() => {
                        const v = verificationMeta(row);
                        return <Badge tone={v.tone} icon={v.icon}>{v.short}</Badge>;
                      })()}
                    </td>
                    <td className="adm-cell-muted">{fmtWhen(row.created_at)}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="adm-actions">
                        <button type="button" className="adm-btn is-sm" onClick={() => setSelected(row.id)}>
                          <Icon name="tune" /> Manage
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pager total={total} limit={PAGE_SIZE} offset={offset} onChange={setOffset} />
          </div>
        )}
      </Panel>

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
