// Chat timestamp wire format (pure, no DB).
//
// messages.sent_at is a tz-less DATETIME written with NOW() in the DB session
// timezone. UNIX_TIMESTAMP reads it back in that same timezone, so the epoch is
// correct whatever the server/DB timezone is. Clients format it in the viewer's
// zone — never pre-format times in SQL (that leaked UTC 24h "23:45" to users).
const SENT_TS_COL = 'UNIX_TIMESTAMP(sent_at) AS sent_ts';

// DB row -> wire shape: `sent_at` is always an ISO-8601 UTC string (or null).
function toWireMessage(row) {
  if (!row) return row;
  const { sent_ts, ...rest } = row;
  const secs = Number(sent_ts);
  return {
    ...rest,
    sent_at: Number.isFinite(secs) && secs > 0 ? new Date(secs * 1000).toISOString() : null,
  };
}

module.exports = { SENT_TS_COL, toWireMessage };
