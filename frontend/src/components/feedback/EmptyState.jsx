export default function EmptyState({ message='No data yet.', action=null, icon='inbox' }) {
  return (
    <div role="status" className="p-8 text-center border border-dashed border-[var(--border-light)] rounded-2xl glass-card flex flex-col items-center gap-3">
      <span className="material-symbols-outlined text-[28px] text-[var(--text-muted)]" aria-hidden="true">{icon}</span>
      <p className="text-sm text-[var(--text-muted)] m-0">{message}</p>
      {action}
    </div>
  );
}
