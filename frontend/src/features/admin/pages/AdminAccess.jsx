import { useMemo, useRef, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import Icon from '../../../components/Icon.jsx';
import Modal from '../../../components/ui/Modal.jsx';
import { apiDelete, apiPatch, apiPost } from '../../../lib/apiClient.js';
import { useAdminResource } from '../hooks/useAdminResource.js';
import { useAdminToast } from '../hooks/useAdminToast.jsx';
import {
  Badge, ConfirmDialog, Kpi, PageHero, Panel, StateBlock, TableSkeleton,
} from '../components/AdminBits.jsx';
import { fmtNum, fmtWhen } from '../utils/format.js';

/**
 * Access QR codes for designated groups (IT evaluators, panel, Day 1 testers).
 *  - "Sign-up" QR → /register?g=CODE; new accounts are tagged to the group.
 *  - "Link" QR    → /go/CODE → redirects to any https link (e.g. Google Meet),
 *                   so scans are still counted.
 */

const STATUS_TONE = { active: 'active', expired: 'warn', disabled: 'off' };
const STATUS_LABEL = { active: 'Active', expired: 'Expired', disabled: 'Turned off' };

// Printed QR codes live forever, so they must encode the production origin —
// not whatever host the admin happens to be on (localhost, a preview deploy).
// Set VITE_PUBLIC_ORIGIN (e.g. https://vitalis.app) in the deploy env.
const PUBLIC_ORIGIN = String(import.meta.env.VITE_PUBLIC_ORIGIN || '').replace(/\/+$/, '');

function qrUrl(group) {
  const origin = PUBLIC_ORIGIN || (typeof window !== 'undefined' ? window.location.origin : '');
  return group.kind === 'link' ? `${origin}/go/${group.code}` : `${origin}/register?g=${group.code}`;
}

function slug(s) {
  return String(s || 'qr').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'qr';
}

// Printable PNG: white card with the QR, the group name and the short link.
function downloadPng(canvas, group) {
  if (!canvas) return;
  const pad = 48;
  const qr = canvas.width;
  const out = document.createElement('canvas');
  out.width = qr + pad * 2;
  out.height = qr + pad * 2 + 110;
  const ctx = out.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, out.width, out.height);
  ctx.drawImage(canvas, pad, pad);
  ctx.fillStyle = '#111111';
  ctx.textAlign = 'center';
  ctx.font = '600 34px Inter, Arial, sans-serif';
  ctx.fillText(group.label.slice(0, 40), out.width / 2, qr + pad + 52);
  ctx.fillStyle = '#666666';
  ctx.font = '400 22px Inter, Arial, sans-serif';
  ctx.fillText(group.kind === 'link' ? 'Scan to open the link' : `Scan to join Vitalis · code ${group.code}`, out.width / 2, qr + pad + 90);
  const a = document.createElement('a');
  a.href = out.toDataURL('image/png');
  a.download = `vitalis-qr-${slug(group.label)}.png`;
  a.click();
}

function toLocalInput(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

/* ── Create / edit form ─────────────────────────────────────────────── */
function GroupForm({ initial = undefined, onClose = undefined, onSaved = undefined }) {
  const editing = Boolean(initial?.id);
  const [form, setForm] = useState({
    label: initial?.label || '',
    description: initial?.description || '',
    kind: initial?.kind || 'register',
    linkUrl: initial?.linkUrl || '',
    expiresAt: toLocalInput(initial?.expiresAt),
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    if (form.label.trim().length < 2) { setError('Give the QR a name of at least 2 characters.'); return; }
    if (form.kind === 'link' && !/^https?:\/\//i.test(form.linkUrl.trim())) {
      setError('Enter the full link, starting with https:// (for example your Google Meet link).');
      return;
    }
    setBusy(true);
    setError('');
    const body = {
      label: form.label.trim(),
      description: form.description.trim(),
      expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
      ...(form.kind === 'link' ? { linkUrl: form.linkUrl.trim() } : {}),
      ...(editing ? {} : { kind: form.kind }),
    };
    try {
      const data = editing
        ? await apiPatch(`/api/admin/access-groups/${initial.id}`, body)
        : await apiPost('/api/admin/access-groups', body);
      onSaved(data.record, editing);
    } catch (err) {
      setError(err.message || 'Could not save this QR.');
      setBusy(false);
    }
  };

  return (
    <Modal
      isOpen
      onClose={busy ? undefined : onClose}
      title={editing ? 'Edit access QR' : 'New access QR'}
      subtitle={editing ? `Code ${initial.code}` : 'Hand it to a designated group'}
      icon="qr_code_2"
      size="lg"
      closeOnBackdrop={!busy}
      footer={(
        <div className="adm-modal__actions" style={{ marginTop: 0 }}>
          <button type="button" className="adm-btn is-ghost" onClick={onClose} disabled={busy}>Cancel</button>
          <button type="submit" form="adm-qr-form" className="adm-btn is-primary" disabled={busy}>
            {busy ? 'Saving…' : editing ? 'Save changes' : 'Create QR'}
          </button>
        </div>
      )}
    >
      <form id="adm-qr-form" className="adm-qr-form" onSubmit={submit} noValidate>
        {!editing && (
          <div className="adm-qr-field">
            <span className="adm-qr-label">Type</span>
            <div className="adm-seg" role="group" aria-label="QR type">
              {[
                { key: 'register', label: 'Sign-up QR', icon: 'person_add' },
                { key: 'link', label: 'Link QR', icon: 'link' },
              ].map((t) => (
                <button
                  key={t.key}
                  type="button"
                  className={`adm-seg__btn${form.kind === t.key ? ' is-active' : ''}`}
                  aria-pressed={form.kind === t.key}
                  onClick={() => setForm((f) => ({ ...f, kind: t.key }))}
                >
                  <Icon name={t.icon} /> {t.label}
                </button>
              ))}
            </div>
            <p className="adm-qr-help">
              {form.kind === 'register'
                ? 'Opens the Vitalis sign-up page. Accounts created through it are counted under this group.'
                : 'Opens any link you choose, such as a Google Meet session. Scans are counted.'}
            </p>
          </div>
        )}

        <label className="adm-qr-field">
          <span className="adm-qr-label">Name</span>
          <input className="adm-input" value={form.label} onChange={set('label')} maxLength={80} placeholder="e.g. IT Evaluators" required />
        </label>

        {form.kind === 'link' && (
          <label className="adm-qr-field">
            <span className="adm-qr-label">Link</span>
            <input className="adm-input" type="url" inputMode="url" value={form.linkUrl} onChange={set('linkUrl')} maxLength={500} placeholder="https://meet.google.com/abc-defg-hij" />
          </label>
        )}

        <label className="adm-qr-field">
          <span className="adm-qr-label">Note <em>(optional)</em></span>
          <input className="adm-input" value={form.description} onChange={set('description')} maxLength={200} placeholder="e.g. Day 1 system evaluation, Nov 28" />
        </label>

        <label className="adm-qr-field">
          <span className="adm-qr-label">Expires <em>(optional)</em></span>
          <input className="adm-input" type="datetime-local" value={form.expiresAt} onChange={set('expiresAt')} />
          <span className="adm-qr-help">After this time the QR stops working. Leave empty to keep it open.</span>
        </label>

        {error && <p className="adm-inline-note is-danger" role="alert"><Icon name="error" />{error}</p>}
      </form>
    </Modal>
  );
}

/* ── Members list ───────────────────────────────────────────────────── */
function MembersModal({ group = undefined, onClose = undefined }) {
  const { data, loading, error } = useAdminResource(`/api/admin/access-groups/${group.id}/members?limit=200`);
  const rows = data?.records || [];
  return (
    <Modal isOpen onClose={onClose} title={`Joined via ${group.label}`} subtitle={`${fmtNum(group.signups)} account${group.signups === 1 ? '' : 's'}`} icon="group" size="xl">
      {loading && <TableSkeleton rows={4} />}
      {error && <StateBlock kind="error" icon="error" title="Could not load members" note={error.message} />}
      {!loading && !error && rows.length === 0 && (
        <StateBlock icon="person_off" title="No sign-ups yet" note="Accounts created by scanning this QR will appear here." />
      )}
      {rows.length > 0 && (
        <ul className="adm-qr-members">
          {rows.map((u) => (
            <li key={u.id}>
              <span className="adm-qr-members__who">
                <strong>{u.name}</strong>
                <span>{u.email}</span>
              </span>
              <span className="adm-qr-members__tags">
                <Badge tone={u.is_verified ? 'active' : 'warn'}>{u.is_verified ? 'Verified' : 'Unverified'}</Badge>
                {u.onboarding_completed ? <Badge tone="info">Set up</Badge> : null}
                <span className="adm-cell-muted">{fmtWhen(u.created_at)}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}

/* ── One QR card ────────────────────────────────────────────────────── */
function QrCard({ group = undefined, onEdit = undefined, onToggle = undefined, onDelete = undefined, onMembers = undefined, onCopy = undefined }) {
  const canvasRef = useRef(null);
  const url = qrUrl(group);
  const live = group.status === 'active';
  return (
    <article className={`adm-qr-card${live ? '' : ' is-muted'}`}>
      <div className="adm-qr-card__code">
        <QRCodeCanvas ref={canvasRef} value={url} size={480} marginSize={2} level="M" bgColor="#ffffff" fgColor="#111111" title={`QR for ${group.label}`} />
      </div>
      <div className="adm-qr-card__body">
        <div className="adm-qr-card__head">
          <h3>{group.label}</h3>
          <Badge tone={STATUS_TONE[group.status]}>{STATUS_LABEL[group.status]}</Badge>
        </div>
        <p className="adm-qr-card__meta">
          <Icon name={group.kind === 'link' ? 'link' : 'person_add'} />
          {group.kind === 'link' ? 'Link QR' : 'Sign-up QR'} · <code>{group.code}</code>
          {group.expiresAt && <> · {group.status === 'expired' ? 'Expired' : 'Expires'} {fmtWhen(group.expiresAt)}</>}
        </p>
        {group.description && <p className="adm-qr-card__note">{group.description}</p>}
        {group.kind === 'link' && <p className="adm-qr-card__link" title={group.linkUrl}>{group.linkUrl}</p>}

        <dl className="adm-qr-card__stats">
          <div><dt>Scans</dt><dd>{fmtNum(group.scans)}</dd></div>
          {group.kind === 'register' && (
            <>
              <div><dt>Sign-ups</dt><dd>{fmtNum(group.signups)}</dd></div>
              <div><dt>Verified</dt><dd>{fmtNum(group.verified)}</dd></div>
              <div><dt>Set up</dt><dd>{fmtNum(group.onboarded)}</dd></div>
            </>
          )}
        </dl>

        <div className="adm-qr-card__actions">
          <button type="button" className="adm-btn is-sm is-primary" onClick={() => downloadPng(canvasRef.current, group)}>
            <Icon name="download" /> PNG
          </button>
          <button type="button" className="adm-btn is-sm is-ghost" onClick={() => onCopy(url)}>
            <Icon name="content_copy" /> Copy link
          </button>
          {group.kind === 'register' && (
            <button type="button" className="adm-btn is-sm is-ghost" onClick={() => onMembers(group)}>
              <Icon name="group" /> Members
            </button>
          )}
          <span className="adm-toolbar__spacer" />
          <button type="button" className="adm-btn is-sm is-icon is-ghost" onClick={() => onEdit(group)} aria-label={`Edit ${group.label}`} title="Edit">
            <Icon name="edit" />
          </button>
          <button type="button" className="adm-btn is-sm is-icon is-ghost" onClick={() => onToggle(group)} aria-label={group.isActive ? `Turn off ${group.label}` : `Turn on ${group.label}`} title={group.isActive ? 'Turn off' : 'Turn on'}>
            <Icon name={group.isActive ? 'toggle_on' : 'toggle_off'} />
          </button>
          <button type="button" className="adm-btn is-sm is-icon is-ghost" onClick={() => onDelete(group)} aria-label={`Delete ${group.label}`} title="Delete">
            <Icon name="delete" />
          </button>
        </div>
      </div>
    </article>
  );
}

/* ── Page ───────────────────────────────────────────────────────────── */
export default function AdminAccess() {
  const { show, node: toast } = useAdminToast();
  const { data, loading, error, reload } = useAdminResource('/api/admin/access-groups');
  const [editing, setEditing] = useState(null); // null | {} (new) | group
  const [members, setMembers] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const records = useMemo(() => data?.records || [], [data]);
  const notReady = data && data.ready === false;
  const totals = useMemo(() => records.reduce((t, g) => ({
    active: t.active + (g.status === 'active' ? 1 : 0),
    scans: t.scans + g.scans,
    signups: t.signups + g.signups,
    verified: t.verified + g.verified,
  }), { active: 0, scans: 0, signups: 0, verified: 0 }), [records]);

  const copy = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      show('Link copied');
    } catch {
      show('Could not copy. Long-press or select the link instead.', 'error');
    }
  };

  const toggle = async (group) => {
    try {
      await apiPatch(`/api/admin/access-groups/${group.id}`, { isActive: !group.isActive });
      show(group.isActive ? `${group.label} turned off` : `${group.label} turned on`);
      reload();
    } catch (err) {
      show(err.message || 'Could not update this QR.', 'error');
    }
  };

  const confirmDelete = async () => {
    setDeleteBusy(true);
    setDeleteError('');
    try {
      await apiDelete(`/api/admin/access-groups/${deleting.id}`);
      show(`${deleting.label} deleted`);
      setDeleting(null);
      reload();
    } catch (err) {
      setDeleteError(err.message || 'Could not delete this QR.');
    } finally {
      setDeleteBusy(false);
    }
  };

  const newBtn = (
    <button type="button" className="adm-btn is-primary" onClick={() => setEditing({})} disabled={notReady}>
      <Icon name="add" /> New QR
    </button>
  );

  return (
    <>
      <PageHero
        eyebrow="Access"
        title="Access"
        accent="QR codes."
        description="Create a QR for a designated group, such as IT evaluators, the panel or Day 1 testers. Sign-up QRs show how many people joined through each code. Link QRs open a meeting or any other page."
        chips={[
          { label: `${fmtNum(records.length)} QR codes`, icon: 'qr_code_2' },
          { label: `${fmtNum(totals.signups)} sign-ups via QR`, icon: 'person_add' },
        ]}
        actions={newBtn}
        image="/admin/hero-access.svg"
      />

      <div className="adm-kpis">
        <Kpi label="Active QRs" value={fmtNum(totals.active)} icon="qr_code_2" hint="Not expired or turned off" />
        <Kpi label="Scans" value={fmtNum(totals.scans)} icon="qr_code_scanner" tone="info" hint="One per browser session" />
        <Kpi label="Sign-ups" value={fmtNum(totals.signups)} icon="person_add" tone="green" hint="New accounts created via a QR" />
        <Kpi label="Verified" value={fmtNum(totals.verified)} icon="verified" tone="warn" hint="Of those, confirmed email/phone" />
      </div>

      <Panel
        title="Your QR codes"
        subtitle="Newest first. Download a PNG to print or share in a slide."
        icon="qr_code_2"
        actions={<button type="button" className="adm-btn is-sm is-ghost" onClick={reload}><Icon name="refresh" /> Refresh</button>}
      >
        {loading && <TableSkeleton rows={4} />}
        {error && (
          <StateBlock kind="error" icon="error" title="Could not load QR codes" note={error.message}
            action={<button type="button" className="adm-btn is-sm" onClick={reload}>Try again</button>} />
        )}
        {notReady && (
          <StateBlock icon="database" title="Database update needed"
            note="Run the database migration (npm run db:migrate in the backend) to enable access QR codes." />
        )}
        {!loading && !error && !notReady && records.length === 0 && (
          <StateBlock icon="qr_code_2" title="No QR codes yet"
            note="Create one for each group you want to invite, for example “IT Evaluators”."
            action={newBtn} />
        )}
        {records.length > 0 && (
          <div className="adm-qr-grid">
            {records.map((g) => (
              <QrCard
                key={g.id}
                group={g}
                onEdit={setEditing}
                onToggle={toggle}
                onDelete={(grp) => { setDeleteError(''); setDeleting(grp); }}
                onMembers={setMembers}
                onCopy={copy}
              />
            ))}
          </div>
        )}
      </Panel>

      {editing && (
        <GroupForm
          initial={editing}
          onClose={() => setEditing(null)}
          onSaved={(record, wasEdit) => {
            setEditing(null);
            show(wasEdit ? 'QR updated' : `QR created for ${record?.label || 'group'}`);
            reload();
          }}
        />
      )}
      {members && <MembersModal group={members} onClose={() => setMembers(null)} />}
      {deleting && (
        <ConfirmDialog
          title={`Delete “${deleting.label}”?`}
          message={deleting.signups > 0
            ? `The QR stops working. The ${fmtNum(deleting.signups)} account${deleting.signups === 1 ? '' : 's'} that joined through it are kept, only the group tag is removed.`
            : 'The QR stops working immediately. This cannot be undone.'}
          confirmLabel="Delete QR"
          danger
          busy={deleteBusy}
          error={deleteError}
          onCancel={() => setDeleting(null)}
          onConfirm={confirmDelete}
        />
      )}
      {toast}
    </>
  );
}
