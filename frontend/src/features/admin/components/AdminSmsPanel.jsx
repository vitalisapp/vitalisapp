import Icon from '../../../components/Icon.jsx';
import AdminUsageChart from './AdminUsageChart.jsx';
import { fmtNum } from '../utils/format.js';
import { fmtAgo } from '../utils/time.js';

const LEVEL = {
  ok: { label: 'Healthy', icon: 'check_circle', cls: 'is-ok' },
  low: { label: 'Running low', icon: 'warning', cls: 'is-low' },
  critical: { label: 'Critical', icon: 'error', cls: 'is-critical' },
  unknown: { label: 'Unknown', icon: 'help', cls: 'is-unknown' },
};

/**
 * UniSMS section of the admin overview: live credit balance (from UniSMS)
 * plus verification SMS sent vs phones verified per day (from our DB).
 * `resource` is the useAdminResource result for /api/admin/sms.
 */
export default function AdminSmsPanel({ resource = undefined, windowDays = undefined }) {
  const { data, loading, error, reload } = resource;
  const balance = data?.balance;
  const level = LEVEL[balance?.level] || LEVEL.unknown;

  // Map onto the shared chart's {usage_day, calls, users} shape.
  const series = (data?.perDay || []).map((row) => ({
    usage_day: row.day,
    calls: row.sent,
    users: row.verified,
  }));
  const windowSent = series.reduce((sum, point) => sum + point.calls, 0);
  const windowVerified = series.reduce((sum, point) => sum + point.users, 0);

  // Bar fills relative to 2× the warning threshold so "low" sits mid-way.
  const scale = balance?.lowAt ? balance.lowAt * 2 : 40;
  const fill = balance?.ok && Number.isFinite(balance.credits)
    ? Math.max(3, Math.min(100, Math.round((balance.credits / scale) * 100)))
    : 0;

  return (
    <div className="adm-analytics__chart adm-sms">
      <div className="adm-chart-head">
        <div>
          <h3>SMS verification</h3>
          <p>UniSMS credits and verification codes sent · last {windowDays} days</p>
        </div>
        <div className="adm-legend">
          <span><i className="is-accent" aria-hidden="true" /> SMS sent</span>
          <span><i className="is-green" aria-hidden="true" /> Phones verified</span>
        </div>
      </div>

      {loading && !data && <div className="adm-chart-skeleton" aria-hidden="true" />}

      {error && !data && (
        <div className="adm-chart-empty">
          <Icon name="sms_failed" />
          <b>SMS stats unavailable</b>
          <span>{error.message || 'The SMS endpoint did not respond.'}</span>
          <button type="button" className="adm-btn is-sm is-ghost" onClick={reload}>
            <Icon name="refresh" /> Retry
          </button>
        </div>
      )}

      {data && (
        <>
          <div className={`adm-sms-credit ${level.cls}`} role="status" aria-live="polite">
            <span className="adm-sms-credit__icon" aria-hidden="true"><Icon name="sms" /></span>
            <div className="adm-sms-credit__main">
              <span className="adm-sms-credit__label">UniSMS credits left</span>
              {balance?.mocked ? (
                <span className="adm-sms-credit__value is-text">Mock mode</span>
              ) : balance?.ok ? (
                <span className="adm-sms-credit__value">{fmtNum(balance.credits)}</span>
              ) : (
                <span className="adm-sms-credit__value is-text">Unavailable</span>
              )}
              {balance?.ok && !balance.mocked && (
                <span className="adm-sms-credit__bar" aria-hidden="true"><i style={{ width: `${fill}%` }} /></span>
              )}
              <span className="adm-sms-credit__note">
                {balance?.mocked && 'UNISMS_MOCK is on: codes are not really sent and no credits are used.'}
                {!balance?.mocked && balance?.ok && (
                  <>Warning below {balance.lowAt} · critical at {balance.criticalAt}
                    {balance.checkedAt && <> · checked {fmtAgo(balance.checkedAt)}</>}</>
                )}
                {!balance?.ok && !balance?.mocked && (balance?.message || 'Could not read the balance from UniSMS.')}
              </span>
            </div>
            <div className="adm-sms-credit__side">
              {!balance?.mocked && balance?.ok && (
                <span className={`adm-sms-level ${level.cls}`}><Icon name={level.icon} /> {level.label}</span>
              )}
              <span className="adm-sms-credit__meta">Sender ID <b>{data.senderId}</b></span>
              <button type="button" className="adm-btn is-sm is-ghost" onClick={reload} disabled={loading}>
                <Icon name="refresh" /> Refresh
              </button>
            </div>
          </div>

          {series.length > 0 ? (
            <AdminUsageChart
              series={series}
              height={200}
              primaryLabel="SMS sent"
              secondaryLabel="Phones verified"
              label={`Verification SMS sent versus phones verified over the last ${windowDays} days`}
            />
          ) : (
            <div className="adm-chart-empty">
              <Icon name="query_stats" />
              <b>No SMS history yet</b>
              <span>The phone verification tables are not available on this database.</span>
            </div>
          )}

          <div className="adm-chart-foot">
            <span><b>{fmtNum(windowSent)}</b> SMS sent in {windowDays} days</span>
            <span><b>{fmtNum(windowVerified)}</b> phones verified</span>
            <span><b>{fmtNum(data.totals?.sentToday)}</b> sent today</span>
            <span><b>{fmtNum(data.totals?.phoneVerifiedUsers)}</b> members verified by phone</span>
          </div>
        </>
      )}
    </div>
  );
}
