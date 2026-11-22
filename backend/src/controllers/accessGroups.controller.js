// Access groups — thin controller. Logic + DB in services/accessGroups.service.js.
const service = require("../services/accessGroups.service");
const { validId } = require("../utils/ids");
const { AppError } = require("../utils/errors");

function idParam(req) {
  const id = validId(req.params.id);
  if (!id) throw new AppError("Invalid access QR id", 400, "ACCESS_ID_INVALID");
  return id;
}

// ─── ADMIN (/api/admin/access-groups) ───
async function getList(_req, res, next) {
  try { res.json(await service.list()); } catch (e) { next(e); }
}
async function postCreate(req, res, next) {
  try { res.status(201).json(await service.create(req.user.id, req.body || {})); } catch (e) { next(e); }
}
async function patchUpdate(req, res, next) {
  try { res.json(await service.update(req.user.id, idParam(req), req.body || {})); } catch (e) { next(e); }
}
async function deleteOne(req, res, next) {
  try { res.json(await service.remove(req.user.id, idParam(req))); } catch (e) { next(e); }
}
async function getMembers(req, res, next) {
  try {
    const { limit, offset } = req.query;
    res.json(await service.members(idParam(req), { limit, offset }));
  } catch (e) { next(e); }
}

// ─── PUBLIC (/api/public/access/:code) ───
// ?scan=1 bumps the scan counter (the register page sends it once per session).
async function getPublic(req, res, next) {
  try {
    res.json(await service.resolvePublic(req.params.code, { countScan: req.query.scan === "1" }));
  } catch (e) { next(e); }
}

module.exports = { getList, postCreate, patchUpdate, deleteOne, getMembers, getPublic };
