export function ZoneBar({ zone }) {
  return (
    <div className="space-y-2 sm:space-y-3">
      <div className="flex justify-between items-center text-[10px] sm:text-[11px] font-bold uppercase tracking-tighter gap-2">
        <span className="text-(--text-secondary) truncate">{zone.label}</span>
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {zone.minutes !== undefined && (
            <span className="text-(--text-muted) text-[9px] hidden sm:inline">{zone.minutes}min</span>
          )}
          <span className="text-(--text-primary)">{zone.value}</span>
        </div>
      </div>
      <div className="w-full h-1.5 bg-(--bg-hover) rounded-full overflow-hidden">
        <div className={`h-full ${zone.color} transition-all duration-1000`} style={{ width: zone.value }} />
      </div>
    </div>
  );
}

export default function DistributionZones({ zones, zonesLoading }) {
  return (
    <div className="col-span-1 lg:col-span-12 bg-(--bg-tertiary) rounded-2xl p-4 sm:p-6 md:p-8 border border-(--border-light) shadow-sm">
      <div className="flex items-center justify-between mb-5 sm:mb-8">
        <h3 className="font-bold text-[10px] uppercase tracking-[0.25em] text-(--text-muted)">Distribution Zones</h3>
        {zonesLoading && (
          <span className="text-[9px] font-black uppercase tracking-widest text-(--text-muted) animate-pulse">Loading…</span>
        )}
      </div>
      {zones.length === 0 ? (
        <p className="text-(--text-muted) text-[11px] font-bold uppercase tracking-widest text-center py-6">
          No zone data for this period
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {zones.map((zone, i) => <ZoneBar key={i} zone={zone} />)}
        </div>
      )}
    </div>
  );
}
