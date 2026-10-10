export function TimeframeToggle({ timeframe, setTimeframe }) {
  const opts = [
    { label: 'Week', value: 'Weekly' },
    { label: 'Month', value: 'Monthly' },
    { label: 'Year', value: 'Quarterly' },
  ];
  return (
    <div className="flex bg-(--bg-tertiary) p-1 rounded-full border border-(--border-light) overflow-x-auto no-scrollbar shadow-sm self-start sm:self-auto shrink-0">
      {opts.map((o) => (
        <button
          key={o.value}
          onClick={() => setTimeframe(o.value)}
          className={`px-4 sm:px-6 py-2 text-[10px] font-black uppercase tracking-[0.12em] rounded-full transition-all whitespace-nowrap touch-manipulation ${
            timeframe === o.value
              ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] shadow'
              : 'text-(--text-muted) hover:text-(--text-primary)'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function PageHeader({ timeframe, setTimeframe, activeTab, setActiveTab }) {
  return (
    <section className="flex flex-col gap-4 mb-6 md:mb-10 lg:mb-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6">
        <div className="space-y-1 min-w-0">
          <p className="text-(--accent) font-bold tracking-[0.25em] text-[10px] uppercase">Recovery & Progress</p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter font-display text-(--text-primary) leading-none">
            Train. Recover. Progress.
          </h2>
        </div>
        <TimeframeToggle timeframe={timeframe} setTimeframe={setTimeframe} />
      </div>
      <div className="flex gap-2">
        {['training', 'recovery', 'progress'].map((t) => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`min-h-[44px] px-4 rounded-full text-[11px] font-black uppercase tracking-widest capitalize ${activeTab === t ? 'bg-(--accent) text-[var(--text-inverse)]' : 'bg-(--bg-card) border border-(--border-light) text-(--text-muted)'}`}>
            {t}
          </button>
        ))}
      </div>
    </section>
  );
}

export const EmptyPanel = ({ title, hint, action, onAction }) => (
  <div className="col-span-1 lg:col-span-12 p-8 text-center rounded-2xl border border-dashed border-[var(--border-light)]">
    <p className="text-[13px] font-bold">{title}</p>
    <p className="text-[12px] text-[var(--text-muted)] mt-1">{hint}</p>
    {action && <button onClick={onAction} className="mt-3 h-10 px-4 rounded-[12px] bg-[var(--accent)] text-[var(--text-inverse)] text-[12px] font-bold">{action}</button>}
  </div>
);
