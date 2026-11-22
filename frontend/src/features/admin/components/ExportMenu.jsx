import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Icon from '../../../components/Icon.jsx';
import { exportCsv, exportXlsx } from '../utils/exportTable.js';

const MENU_GAP = 6;
const VIEWPORT_PAD = 8;

/**
 * "Export" button with a CSV / Excel menu for an admin table.
 *
 * The menu is portalled to <body> with fixed positioning so it can never be
 * clipped by an `overflow: hidden` ancestor (hero banners, panels, tables).
 * It opens below the button, flips above when there is no room, and stays
 * inside the viewport horizontally.
 *
 * Props:
 *  - getRows: async () => rows   (usually fetchAllRows with the current filters)
 *  - columns: export column definitions (see utils/exportTable.js)
 *  - fileName: base file name, e.g. 'vitalis-users'
 *  - sheetName: Excel sheet name
 *  - onToast(message, tone): optional feedback
 */
export default function ExportMenu({ getRows = undefined, columns = undefined, fileName = undefined, sheetName = 'Export', onToast = undefined, disabled = false }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState('');
  const [pos, setPos] = useState(null);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  const close = useCallback((restoreFocus = false) => {
    setOpen(false);
    setPos(null);
    if (restoreFocus) buttonRef.current?.focus();
  }, []);

  // Measure the button + menu and place the menu where it fully fits.
  const place = useCallback(() => {
    const btn = buttonRef.current;
    const menu = menuRef.current;
    if (!btn || !menu) return;
    const b = btn.getBoundingClientRect();
    const mw = menu.offsetWidth;
    const mh = menu.offsetHeight;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const below = vh - b.bottom - MENU_GAP - VIEWPORT_PAD;
    const above = b.top - MENU_GAP - VIEWPORT_PAD;
    const openUp = mh > below && above > below;
    const top = openUp ? Math.max(VIEWPORT_PAD, b.top - MENU_GAP - mh) : b.bottom + MENU_GAP;
    // Right-align with the button, then clamp into the viewport.
    const left = Math.min(Math.max(VIEWPORT_PAD, b.right - mw), vw - mw - VIEWPORT_PAD);
    setPos({ top, left, origin: openUp ? 'bottom right' : 'top right' });
  }, []);

  useLayoutEffect(() => {
    if (open) place();
  }, [open, place]);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (buttonRef.current?.contains(e.target) || menuRef.current?.contains(e.target)) return;
      close();
    };
    const onKey = (e) => {
      if (e.key === 'Escape') { e.stopPropagation(); close(true); }
    };
    // Keep the menu attached to its button while the page scrolls/resizes.
    const onMove = () => place();
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onMove);
    window.addEventListener('scroll', onMove, true);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onMove);
      window.removeEventListener('scroll', onMove, true);
    };
  }, [open, close, place]);

  // Move focus into the menu once it is positioned (keyboard users).
  useEffect(() => {
    if (open && pos) menuRef.current?.querySelector('[role="menuitem"]')?.focus();
  }, [open, pos]);

  const onMenuKeyDown = (e) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp' && e.key !== 'Tab') return;
    const items = [...(menuRef.current?.querySelectorAll('[role="menuitem"]') || [])];
    if (!items.length) return;
    if (e.key === 'Tab') { close(); return; }
    e.preventDefault();
    const i = items.indexOf(document.activeElement);
    const next = e.key === 'ArrowDown' ? (i + 1) % items.length : (i - 1 + items.length) % items.length;
    items[next].focus();
  };

  const run = async (kind) => {
    close(true);
    setBusy(kind);
    try {
      const rows = await getRows();
      if (!rows.length) {
        onToast?.('Nothing to export: no rows match the current filters.', 'info');
        return;
      }
      if (kind === 'csv') exportCsv(rows, columns, fileName);
      else await exportXlsx(rows, columns, fileName, sheetName);
      onToast?.(`Exported ${rows.length.toLocaleString('en-US')} row${rows.length === 1 ? '' : 's'} as ${kind === 'csv' ? 'CSV' : 'Excel'}.`);
    } catch (err) {
      onToast?.(err?.message ? `Export failed: ${err.message}` : 'Export failed.', 'error');
    } finally {
      setBusy('');
    }
  };

  return (
    <div className="adm-export">
      <button
        ref={buttonRef}
        type="button"
        className="adm-btn is-sm"
        aria-haspopup="menu"
        aria-expanded={open}
        disabled={disabled || Boolean(busy)}
        onClick={() => (open ? close() : setOpen(true))}
      >
        <Icon name={busy ? 'hourglass_top' : 'download'} />
        {busy ? 'Exporting…' : 'Export'}
        <Icon name="expand_more" />
      </button>
      {open && createPortal(
        <div
          ref={menuRef}
          className="adm-export__menu v-motion-menu"
          role="menu"
          aria-label="Export format"
          onKeyDown={onMenuKeyDown}
          style={{
            position: 'fixed',
            top: pos?.top ?? 0,
            left: pos?.left ?? 0,
            right: 'auto',
            transformOrigin: pos?.origin,
            // Measured off-screen on the first frame, then shown in place.
            visibility: pos ? 'visible' : 'hidden',
          }}
        >
          <button type="button" role="menuitem" className="adm-export__item" onClick={() => run('csv')}>
            <Icon name="description" />
            <span><b>Export as CSV</b><small>Plain text, opens anywhere</small></span>
          </button>
          <button type="button" role="menuitem" className="adm-export__item" onClick={() => run('xlsx')}>
            <Icon name="table_view" />
            <span><b>Export as Excel</b><small>.xlsx workbook</small></span>
          </button>
        </div>,
        document.body,
      )}
    </div>
  );
}
