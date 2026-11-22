// Public frontend origin used for links and hosted assets in outbound emails.
// Resolved per call so tunnel URLs / test env changes take effect without a
// restart. Falls back to the Vite dev server.
function frontendUrl() {
  const raw = (
    process.env.FRONTEND_URL ||
    (process.env.ALLOWED_ORIGINS || "").split(",")[0] ||
    "http://localhost:5173"
  ).trim();
  try {
    const u = new URL(raw);
    if (!["http:", "https:"].includes(u.protocol)) throw new Error("bad proto");
    if (process.env.NODE_ENV === "production" && u.protocol !== "https:") {
      console.warn("[frontendUrl] FRONTEND_URL should be https in production:", raw);
    }
    return raw.replace(/\/$/, "");
  } catch {
    console.warn("[frontendUrl] Invalid FRONTEND_URL, falling back to http://localhost:5173:", raw);
    return "http://localhost:5173";
  }
}

module.exports = { frontendUrl };
