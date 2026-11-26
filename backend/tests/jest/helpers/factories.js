const bcrypt = require("bcryptjs");
const { execute, cleanupUserIds } = require("./db");

const trackedUserIds = new Set();
const DEFAULT_PASSWORD = "VitalisTest!2026";

function uniqueEmail(prefix = "qa") {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}-${Date.now()}-${rand}@example.test`;
}

async function createUser(overrides = {}) {
  const email = overrides.email || uniqueEmail();
  const password = overrides.password || DEFAULT_PASSWORD;
  const hash = overrides.hash || bcrypt.hashSync(password, 4);
  const values = {
    name: overrides.name || "QA User",
    email,
    password: hash,
    is_verified: overrides.is_verified === undefined ? 1 : Number(overrides.is_verified),
    onboarding_completed: overrides.onboarding_completed === undefined ? 1 : Number(overrides.onboarding_completed),
    token_version: overrides.token_version === undefined ? 0 : Number(overrides.token_version),
    role: overrides.role || "member",
    status: overrides.status || "active",
    accepted_terms_at: overrides.accepted_terms_at || new Date(),
    accepted_terms_version: overrides.accepted_terms_version || "2026-09",
    fitness_goal: overrides.fitness_goal === undefined ? "general fitness" : overrides.fitness_goal,
  };
  const [result] = await execute(
    `INSERT INTO users
      (name, email, password, is_verified, onboarding_completed, token_version,
       role, status, accepted_terms_at, accepted_terms_version, fitness_goal)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      values.name, values.email, values.password, values.is_verified,
      values.onboarding_completed, values.token_version, values.role, values.status,
      values.accepted_terms_at, values.accepted_terms_version, values.fitness_goal,
    ],
  );
  const id = Number(result.insertId);
  trackedUserIds.add(id);
  return { ...values, id, password };
}

function createAdmin(overrides = {}) {
  return createUser({ role: "admin", name: "QA Admin", ...overrides });
}

async function cleanupTrackedUsers() {
  if (!trackedUserIds.size) return;
  await cleanupUserIds([...trackedUserIds]);
  trackedUserIds.clear();
}

async function cleanupEmail(email) {
  if (!email) return;
  await execute("DELETE FROM users WHERE email = ?", [String(email).toLowerCase()]);
}

module.exports = {
  DEFAULT_PASSWORD,
  uniqueEmail,
  createUser,
  createAdmin,
  cleanupUserIds,
  cleanupTrackedUsers,
  cleanupEmail,
  trackedUserIds,
};
