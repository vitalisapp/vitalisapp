const Eyebrow = ({ children, className = '' }) => (
  <p className={`text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--text-muted)] ${className}`}>{children}</p>
);

export default Eyebrow;
