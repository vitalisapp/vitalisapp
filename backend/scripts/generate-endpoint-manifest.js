#!/usr/bin/env node
// Static, version-independent endpoint inventory.
// Reads the route registry + route files (no Express internals, no server boot).
// Regenerate with: npm run test:endpoints:generate
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "src", "routes");
const OUT = path.join(__dirname, "..", "tests", "jest", "fixtures", "endpoints.json");
const registry = fs.readFileSync(path.join(ROOT, "index.js"), "utf8");

// variable name -> route file
const filesByVar = new Map();
for (const m of registry.matchAll(/const\s+(\w+)\s*=\s*require\(['"]\.\/([^'"]+)['"]\)/g)) {
  filesByVar.set(m[1], m[2].endsWith(".js") ? m[2] : `${m[2]}.js`);
}

// mount prefix -> [{ file, mount-level gates }]
// Gates applied in src/routes/index.js (e.g. app.use('/api/community',
// requireMember, communityRoutes)) are just as much a part of the endpoint
// contract as gates written inside a router file.
const mounts = [];
for (const line of registry.split(/\r?\n/)) {
  const m = line.match(/app\.use\(\s*['"]([^'"]+)['"]\s*,([^;]+)\);/);
  if (!m) continue;
  const vars = [...m[2].matchAll(/\b(\w+Routes|foodLogs)\b/g)].map((x) => x[1]);
  const mountGates = {
    requireMember: /\brequireMember\b/.test(line),
    requireAdmin: /\brequireAdmin\b/.test(line),
  };
  for (const v of new Set(vars)) {
    if (filesByVar.has(v)) mounts.push({ prefix: m[1], file: filesByVar.get(v), ...mountGates });
  }
}

const METHOD_RE = /router\.(get|post|put|patch|delete)\(\s*['"]([^'"]+)['"]([^;]*)/g;
const endpoints = [];

function normalize(prefix, route) {
  const joined = `${prefix}/${route}`.replace(/\/{2,}/g, "/");
  return joined.length > 1 ? joined.replace(/\/$/, "") : joined;
}

function flagsFrom(tail) {
  return {
    auth: /\bverifyUser\b/.test(tail),
    requireAdmin: /\brequireAdmin\b/.test(tail),
    requireMember: /\brequireMember\b/.test(tail),
    requireOwner: /requireOwner\(/.test(tail),
    validation: /\bvalidate\(/.test(tail),
    rateLimited: /Limiter|aiQuota|\bread\b|\bwrite\b/.test(tail),
  };
}

for (const { prefix, file, requireMember, requireAdmin } of mounts) {
  const source = path.join("src", "routes", file);
  const text = fs.readFileSync(path.join(ROOT, file), "utf8");
  for (const m of text.matchAll(METHOD_RE)) {
    const method = m[1].toUpperCase();
    const fullPath = normalize(prefix, m[2]);
    const flags = flagsFrom(m[3]);
    endpoints.push({
      id: `${method} ${fullPath}`,
      method,
      path: fullPath,
      module: file.replace(/\.routes\.js$/, ""),
      source,
      ...flags,
      auth: flags.auth || requireMember || requireAdmin,
      requireAdmin: flags.requireAdmin || requireAdmin,
      requireMember: flags.requireMember || requireMember,
    });
  }
}

// App-level and legacy fallback endpoints registered outside route modules.
const APP_ENDPOINTS = [
  ["GET", "/api/health"],
  ["GET", "/health"],
  ["GET", "/api/readyz"],
  ["GET", "/api/version"],
  ["GET", "/api/_routes"],
  ["GET", "/uploads/*"],
  ["GET", "/api/clinic/*"],
  ["GET", "/api/atelier/*"],
  ["GET", "/api/live-coaching/*"],
  ["GET", "/api/workout-sessions/*"],
  ["GET", "/api/nutrition/*"],
];
for (const [method, p] of APP_ENDPOINTS) {
  endpoints.push({
    id: `${method} ${p}`,
    method,
    path: p,
    module: "app",
    source: p.startsWith("/uploads") ? "src/app.js" : p === "/api/_routes" ? "src/routes/index.js" : "src/app.js",
    auth: false, requireAdmin: false, requireMember: false, requireOwner: false,
    validation: false, rateLimited: p !== "/api/health" && p !== "/health",
  });
}

// Health/version/readyz have their own limiter skip rules.
for (const e of endpoints) {
  if (["/api/health", "/health", "/api/readyz", "/api/version", "/api/auth/me"].includes(e.path)) {
    e.rateLimited = false;
  }
}

endpoints.sort((a, b) => a.id.localeCompare(b.id));
const seen = new Set();
const unique = endpoints.filter((e) => !seen.has(e.id) && seen.add(e.id));

const payload = { generatedAt: new Date().toISOString(), total: unique.length, endpoints: unique };

if (process.argv.includes("--check")) {
  if (!fs.existsSync(OUT)) {
    console.error("[endpoints] manifest is missing — run `npm run test:endpoints:generate`.");
    process.exit(1);
  }
  const current = JSON.parse(fs.readFileSync(OUT, "utf8"));
  const same =
    current.total === payload.total &&
    JSON.stringify(current.endpoints) === JSON.stringify(payload.endpoints);
  if (!same) {
    console.error(
      `[endpoints] manifest is stale (${current.total} recorded vs ${payload.total} discovered). ` +
        `Run \`npm run test:endpoints:generate\` and commit the result.`,
    );
    process.exit(1);
  }
  console.log(`[endpoints] manifest current (${unique.length} endpoints)`);
  process.exit(0);
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(payload, null, 2) + "\n");
console.log(`[endpoints] wrote ${unique.length} endpoints to ${path.relative(process.cwd(), OUT)}`);
