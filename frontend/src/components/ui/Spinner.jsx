export default function Spinner({ className='' }) {
  return <span className={`inline-block w-4 h-4 border-2 border-[var(--border-medium)] border-t-[var(--accent)] rounded-full animate-spin ${className}`} aria-label="loading" />;
}
