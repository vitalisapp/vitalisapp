import { useEffect, useRef, useState } from 'react';
import Icon from '../../../components/Icon.jsx';
import { exportCsv, exportXlsx } from '../utils/exportTable.js';

/**
 * "Export" button with a CSV / Excel menu for an admin table.
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
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => { if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const run = async (kind) => {
    setOpen(false);
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
    <div className="adm-export" ref={rootRef}>
      <button
        type="button"
        className="adm-btn is-sm"
        aria-haspopup="menu"
        aria-expanded={open}
        disabled={disabled || Boolean(busy)}
        onClick={() => setOpen((v) => !v)}
      >
        <Icon name={busy ? 'hourglass_top' : 'download'} />
        {busy ? 'Exporting…' : 'Export'}
        <Icon name="expand_more" />
      </button>
      {open && (
        <div className="adm-export__menu v-motion-menu" role="menu">
          <button type="button" role="menuitem" className="adm-export__item" onClick={() => run('csv')}>
            <Icon name="description" />
            <span><b>Export as CSV</b><small>Plain text, opens anywhere</small></span>
          </button>
          <button type="button" role="menuitem" className="adm-export__item" onClick={() => run('xlsx')}>
            <Icon name="table_view" />
            <span><b>Export as Excel</b><small>.xlsx workbook</small></span>
          </button>
        </div>
      )}
    </div>
  );
}
