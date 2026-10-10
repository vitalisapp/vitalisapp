export function SectionLabel({ text }) { return <p className="text-[10px] sm:text-xs font-semibold text-[var(--accent)] uppercase tracking-widest mb-3">{text}</p>; }

export function InputField({ label, type = "text", placeholder, value, onChange, error, className = "" }) {
  const base = `w-full h-10 bg-[var(--bg-hover)] rounded-xl px-3 text-sm text-[var(--text-primary)] border outline-none focus:border-[var(--accent)]/50 transition-colors ${error ? "border-red-500/60" : "border-[var(--border-light)]"} ${className}`;
  return <div>{label && <label className="block text-[11px] text-[var(--text-muted)] mb-1.5">{label}</label>}<input type={type} placeholder={placeholder} value={value} onChange={onChange} className={base} />{error && <p className="text-red-400 text-[10px] mt-1">{error}</p>}</div>;
}
