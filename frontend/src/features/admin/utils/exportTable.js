// Admin table export — CSV (no dependency) and real .xlsx (write-excel-file,
// loaded on demand so it never weighs down the admin bundle).
//
// A column is: { header, value: (row) => any, type?: 'number'|'date'|'text', width? }
//   - value() returns the raw value; null/undefined become empty cells
//   - type 'number' / 'date' keeps Excel cells numeric / date-typed

import { apiGet } from '../../../lib/apiClient.js';

const MAX_EXPORT_ROWS = 10000;
const PAGE = 100; // admin list endpoints cap `limit` at 100

/**
 * Fetch every row of a paginated admin list endpoint (records/total/limit/offset),
 * keeping the caller's filters. `basePath` is e.g. '/api/admin/users' and
 * `params` the current filters (without limit/offset).
 */
export async function fetchAllRows(basePath, params = {}, { onProgress } = {}) {
  const rows = [];
  let total = Infinity;
  for (let offset = 0; offset < total && rows.length < MAX_EXPORT_ROWS; offset += PAGE) {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') qs.set(key, String(val));
    });
    qs.set('limit', String(PAGE));
    qs.set('offset', String(offset));
    const data = await apiGet(`${basePath}?${qs.toString()}`);
    const batch = Array.isArray(data?.records) ? data.records : [];
    total = Number(data?.total ?? batch.length);
    rows.push(...batch);
    onProgress?.(rows.length, total);
    if (batch.length < PAGE) break;
  }
  return rows.slice(0, MAX_EXPORT_ROWS);
}

// "2026-11-19 14:05" / ISO → Date (local), or null.
function toDate(value) {
  if (value === null || value === undefined || value === '') return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  const d = new Date(String(value).replace(' ', 'T'));
  return Number.isNaN(d.getTime()) ? null : d;
}

function pad(n) { return String(n).padStart(2, '0'); }
function fmtDateText(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function normalize(value, type) {
  if (value === null || value === undefined) return null;
  if (type === 'number') {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  if (type === 'date') return toDate(value);
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value);
}

// Spreadsheet formula injection guard: text starting with = + - @ (or tab/CR)
// is executed as a formula by Excel/Sheets — prefix with an apostrophe.
function safeText(text) {
  return /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
}

function csvCell(value, type) {
  const v = normalize(value, type);
  if (v === null) return '';
  let text;
  if (v instanceof Date) text = fmtDateText(v);
  else if (typeof v === 'number') text = String(v);
  else text = safeText(v);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function stamp() {
  const d = new Date();
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
}

function download(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Download rows as UTF-8 CSV (BOM so Excel shows accents/peso signs correctly). */
export function exportCsv(rows, columns, baseName) {
  const lines = [columns.map((c) => csvCell(c.header, 'text')).join(',')];
  for (const row of rows) lines.push(columns.map((c) => csvCell(c.value(row), c.type)).join(','));
  const blob = new Blob(['﻿', lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
  download(blob, `${baseName}-${stamp()}.csv`);
}

/** Download rows as a real .xlsx workbook with bold headers and typed cells. */
export async function exportXlsx(rows, columns, baseName, sheetName = 'Export') {
  const { default: writeXlsxFile } = await import('write-excel-file/browser');
  const xlsxColumns = columns.map((c) => ({
    header: { value: c.header, fontWeight: 'bold' },
    width: c.width || Math.max(10, Math.min(40, String(c.header).length + 4)),
    cell: (row) => {
      const v = normalize(c.value(row), c.type);
      if (v === null) return { value: null };
      if (v instanceof Date) return { value: v, type: Date, format: 'yyyy-mm-dd hh:mm' };
      if (typeof v === 'number') return { value: v, type: Number };
      return { value: v, type: String };
    },
  }));
  const blob = await writeXlsxFile(rows, {
    columns: xlsxColumns,
    sheet: String(sheetName).slice(0, 31),
    stickyRowsCount: 1,
  }).toBlob();
  download(blob, `${baseName}-${stamp()}.xlsx`);
}
