// Access groups — admin-generated QR codes for designated groups (evaluators,
// panel, Day 1 testers, …). See migrations/048_access_groups.sql.
//
// Admin functions assume `verifyUser, requireAdmin` already ran. The public
// helpers (resolvePublic, tagUser) are fail-soft: if the migration has not run
// yet registration must keep working exactly as before.
const crypto = require("crypto");
const db = require("../config/db");
const { AppError } = require("../utils/errors");
const { writeAudit } = require("./admin.service");

const KINDS = ["register", "link"];
// Unambiguous alphabet (no 0/O, 1/I/L) so codes are easy to read aloud.
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const CODE_RE = /^[A-Z2-9]{6,16}$/;

function makeCode(len = 8) {
  const bytes = crypto.randomBytes(len);
  let out = "";
  for (let i = 0; i < len; i++) out += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  return out;
}

function normCode(v) {
  const c = String(v || "").trim().toUpperCase();
  return CODE_RE.test(c) ? c : "";
}

function isMissingSchema(err) {
  return err && (err.code === "ER_NO_SUCH_TABLE" || err.code === "ER_BAD_FIELD_ERROR" || err.errno === 1146 || err.errno === 1054);
}

function cleanText(v, max) {
  const s = String(v ?? "").replace(/\s+/g, " ").trim();
  return s ? s.slice(0, max) : "";
}

function parseExpiry(v) {
  if (v === undefined) return undefined;
  if (v === null || v === "") return null;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) {
    throw new AppError("Enter a valid expiry date, or leave it empty for no expiry.", 400, "ACCESS_EXPIRY_INVALID");
  }
  if (d.getTime() < Date.now() - 60 * 1000) {
    throw new AppError("The expiry date is already in the past. Pick a future date.", 400, "ACCESS_EXPIRY_PAST");
  }
  // MySQL DATETIME, UTC like the rest of the app.
  return d.toISOString().slice(0, 19).replace("T", " ");
}

function parseLink(v) {
  const s = cleanText(v, 500);
  if (!s) return "";
  let u;
  try { u = new URL(s); } catch { u = null; }
  if (!u || !["http:", "https:"].includes(u.protocol)) {
    throw new AppError("Enter a full link starting with https:// (for example a Google Meet link).", 400, "ACCESS_LINK_INVALID");
  }
  return u.toString();
}

// Expiry is stored as UTC and compared in SQL (is_expired) so the result does
// not depend on the Node/MySQL session timezone.
const EXPIRY_COLS = `DATE_FORMAT(g.expires_at, '%Y-%m-%dT%H:%i:%sZ') AS expires_iso,
         (g.expires_at IS NOT NULL AND g.expires_at <= UTC_TIMESTAMP()) AS is_expired`;

function statusOf(row) {
  if (!row.is_active) return "disabled";
  if (Number(row.is_expired)) return "expired";
  return "active";
}

function toRecord(row) {
  return {
    id: row.id,
    code: row.code,
    label: row.label,
    description: row.description || "",
    kind: row.kind,
    linkUrl: row.link_url || "",
    expiresAt: row.expires_iso || null,
    isActive: Boolean(row.is_active),
    status: statusOf(row),
    scans: Number(row.scan_count || 0),
    signups: Number(row.signups || 0),
    verified: Number(row.verified || 0),
    onboarded: Number(row.onboarded || 0),
    createdAt: row.created_on || null,
    createdBy: row.creator_name || null,
  };
}

const LIST_SQL = `
  SELECT g.*, cu.name AS creator_name, ${EXPIRY_COLS},
         DATE_FORMAT(g.created_at, '%Y-%m-%d %H:%i') AS created_on,
         COUNT(u.id) AS signups,
         COALESCE(SUM(u.is_verified = 1), 0) AS verified,
         COALESCE(SUM(u.onboarding_completed = 1), 0) AS onboarded
  FROM access_groups g
  LEFT JOIN users cu ON cu.id = g.created_by
  LEFT JOIN users u ON u.access_group_id = g.id`;

async function getById(id) {
  const [rows] = await db.query(`${LIST_SQL} WHERE g.id = ? GROUP BY g.id`, [id]);
  return rows[0] ? toRecord(rows[0]) : null;
}

// ─── ADMIN ─────────────────────────────────────────────────────────────
async function list() {
  try {
    const [rows] = await db.query(`${LIST_SQL} GROUP BY g.id ORDER BY g.created_at DESC, g.id DESC`);
    return { records: rows.map(toRecord), ready: true };
  } catch (err) {
    if (isMissingSchema(err)) return { records: [], ready: false };
    throw err;
  }
}

async function create(adminId, body = {}) {
  const label = cleanText(body.label, 80);
  if (label.length < 2) {
    throw new AppError("Give the QR a name of at least 2 characters (for example \"IT Evaluators\").", 400, "ACCESS_LABEL_REQUIRED");
  }
  const kind = KINDS.includes(body.kind) ? body.kind : "register";
  const linkUrl = kind === "link" ? parseLink(body.linkUrl) : "";
  if (kind === "link" && !linkUrl) {
    throw new AppError("A link QR needs the address it should open (for example your Google Meet link).", 400, "ACCESS_LINK_REQUIRED");
  }
  const description = cleanText(body.description, 200) || null;
  const expiresAt = parseExpiry(body.expiresAt) ?? null;

  // Retry on the (astronomically unlikely) code collision.
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = makeCode();
    try {
      const [res] = await db.execute(
        "INSERT INTO access_groups (code, label, description, kind, link_url, expires_at, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [code, label, description, kind, linkUrl || null, expiresAt, adminId],
      );
      await writeAudit(adminId, "access_group.create", null, `${label} (${kind}, ${code})`);
      return { record: await getById(res.insertId) };
    } catch (err) {
      if (err.code === "ER_DUP_ENTRY") continue;
      if (isMissingSchema(err)) {
        throw new AppError("Access QR storage is not set up yet. Run the database migration (npm run db:migrate).", 503, "ACCESS_NOT_READY");
      }
      throw err;
    }
  }
  throw new AppError("Could not generate a unique code. Try again.", 500, "ACCESS_CODE_FAILED");
}

async function update(adminId, id, body = {}) {
  const current = await getById(id);
  if (!current) throw new AppError("That access QR no longer exists.", 404, "ACCESS_NOT_FOUND");

  const sets = [];
  const params = [];
  if (body.label !== undefined) {
    const label = cleanText(body.label, 80);
    if (label.length < 2) throw new AppError("The name must be at least 2 characters.", 400, "ACCESS_LABEL_REQUIRED");
    sets.push("label = ?"); params.push(label);
  }
  if (body.description !== undefined) {
    sets.push("description = ?"); params.push(cleanText(body.description, 200) || null);
  }
  if (body.linkUrl !== undefined && current.kind === "link") {
    const linkUrl = parseLink(body.linkUrl);
    if (!linkUrl) throw new AppError("A link QR needs the address it should open.", 400, "ACCESS_LINK_REQUIRED");
    sets.push("link_url = ?"); params.push(linkUrl);
  }
  const expiresAt = parseExpiry(body.expiresAt);
  if (expiresAt !== undefined) { sets.push("expires_at = ?"); params.push(expiresAt); }
  if (body.isActive !== undefined) { sets.push("is_active = ?"); params.push(body.isActive ? 1 : 0); }

  if (!sets.length) return { record: current };
  params.push(id);
  await db.execute(`UPDATE access_groups SET ${sets.join(", ")} WHERE id = ?`, params);
  const verb = body.isActive === false ? "disable" : body.isActive === true ? "enable" : "update";
  await writeAudit(adminId, `access_group.${verb}`, null, `${current.label} (${current.code})`);
  return { record: await getById(id) };
}

async function remove(adminId, id) {
  const current = await getById(id);
  if (!current) throw new AppError("That access QR no longer exists.", 404, "ACCESS_NOT_FOUND");
  // users.access_group_id is ON DELETE SET NULL — accounts are never touched.
  await db.execute("DELETE FROM access_groups WHERE id = ?", [id]);
  await writeAudit(adminId, "access_group.delete", null, `${current.label} (${current.code}, ${current.signups} signups)`);
  return { ok: true };
}

async function members(id, { limit = 50, offset = 0 } = {}) {
  const group = await getById(id);
  if (!group) throw new AppError("That access QR no longer exists.", 404, "ACCESS_NOT_FOUND");
  const cap = Math.min(Math.max(Number(limit) || 50, 1), 200);
  const off = Math.max(Number(offset) || 0, 0);
  const [rows] = await db.query(
    `SELECT u.id, u.name, u.email, u.is_verified, u.onboarding_completed, u.status,
            DATE_FORMAT(u.created_at, '%Y-%m-%d %H:%i') AS created_at
     FROM users u WHERE u.access_group_id = ?
     ORDER BY u.created_at DESC LIMIT ${cap} OFFSET ${off}`,
    [id],
  );
  return { group, records: rows, total: group.signups, limit: cap, offset: off };
}

// ─── PUBLIC ────────────────────────────────────────────────────────────
// Register page lookup. Returns only what the banner needs — never counts.
async function resolvePublic(rawCode, { countScan = false } = {}) {
  const code = normCode(rawCode);
  if (!code) return { valid: false, reason: "invalid" };
  try {
    const [rows] = await db.execute(
      `SELECT g.id, g.label, g.description, g.kind, g.link_url, g.is_active, ${EXPIRY_COLS}
       FROM access_groups g WHERE g.code = ?`,
      [code],
    );
    const row = rows[0];
    if (!row) return { valid: false, reason: "invalid" };
    const status = statusOf(row);
    if (status !== "active") return { valid: false, reason: status, label: row.label };
    if (countScan) {
      db.execute("UPDATE access_groups SET scan_count = scan_count + 1 WHERE id = ?", [row.id])
        .catch((e) => console.error("[access] scan count failed:", e.code || e.message));
    }
    return {
      valid: true,
      code,
      label: row.label,
      description: row.description || "",
      kind: row.kind,
      linkUrl: row.kind === "link" ? row.link_url : "",
    };
  } catch (err) {
    if (isMissingSchema(err)) return { valid: false, reason: "invalid" };
    throw err;
  }
}

// Called right after a NEW account is created. Fail-soft by design: an
// invalid/expired code or a missing migration never blocks registration.
async function tagUser(userId, rawCode) {
  const code = normCode(rawCode);
  if (!userId || !code) return false;
  try {
    const [res] = await db.execute(
      `UPDATE users u
       JOIN access_groups g ON g.code = ? AND g.kind = 'register' AND g.is_active = 1
         AND (g.expires_at IS NULL OR g.expires_at > UTC_TIMESTAMP())
       SET u.access_group_id = g.id
       WHERE u.id = ? AND u.access_group_id IS NULL`,
      [code, userId],
    );
    return res.affectedRows > 0;
  } catch (err) {
    console.error("[access] tag user failed:", err.code || err.message);
    return false;
  }
}

module.exports = {
  KINDS,
  makeCode,
  normCode,
  list,
  create,
  update,
  remove,
  members,
  resolvePublic,
  tagUser,
};
