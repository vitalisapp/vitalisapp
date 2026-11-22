const { BRAND } = require("../theme");
const { escapeHtml } = require("../utils/escapeHtml");

/**
 * Zebra key/value table (values are escaped here).
 * @param {Array<{ label: string, value: string | number, color?: string }>} rows
 */
function renderKeyValueTable(rows) {
  const body = rows
    .map(
      (r, i) => `
      <tr style="background:${i % 2 === 0 ? BRAND.surface : BRAND.card};">
        <td style="padding:13px 16px;font-family:${BRAND.fontSans};font-size:13px;color:${BRAND.textMuted};">${escapeHtml(r.label)}</td>
        <td style="padding:13px 16px;font-family:${BRAND.fontDisplay};font-size:15px;font-weight:700;text-align:right;color:${r.color || BRAND.textPrimary};">${escapeHtml(r.value)}</td>
      </tr>`,
    )
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;border:1px solid ${BRAND.border};border-radius:12px;overflow:hidden;margin:0 0 24px;">${body}</table>`;
}

module.exports = { renderKeyValueTable };
