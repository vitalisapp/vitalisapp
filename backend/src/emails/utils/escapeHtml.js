/**
 * Escape text so it is safe to interpolate into HTML (content or attributes).
 * Every user-supplied value in a template must pass through this.
 * @param {unknown} s
 * @returns {string}
 */
function escapeHtml(s) {
  return String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[c],
  );
}

module.exports = { escapeHtml };
