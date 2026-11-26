// Compact network-compatibility notice shown under the phone number input.
//
// The default UniSMS sender ID cannot reach Smart, TNT or Sun Cellular. It is
// guidance, not a hard gate: numbers can be ported, so the provider's response
// — never the prefix — decides whether a message is delivered.
//
// `senderId` comes from VITE_SMS_SENDER_ID when the sender changes.

const SUPPORTED = ['Globe', 'TM', 'DITO'];
const UNSUPPORTED = ['Smart', 'TNT', 'Sun Cellular'];

export default function NetworkNotice({ senderId = 'Unisoft', className = '' }) {
  return (
    <aside
      aria-label="Supported mobile networks"
      className={`rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 ${className}`}
    >
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#c4c9b0]/60">
        Supported Mobile Networks
      </p>

      <ul className="flex flex-wrap gap-1.5" role="list">
        {SUPPORTED.map((network) => (
          <li
            key={network}
            className="flex min-w-0 items-center gap-1 rounded-md bg-[var(--accent)]/10 px-2 py-1 text-[11px] font-semibold text-[#e5e2e1]"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-[14px] leading-none text-[var(--accent)]">
              check_circle
            </span>
            <span className="min-w-0 leading-tight">{network}</span>
            <span className="sr-only">supported</span>
          </li>
        ))}
      </ul>

      <ul className="mt-1.5 flex flex-wrap gap-1.5" role="list">
        {UNSUPPORTED.map((network) => (
          <li
            key={network}
            className="flex min-w-0 items-center gap-1 rounded-md bg-red-500/10 px-2 py-1 text-[11px] font-semibold text-[#e5e2e1]/70"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-[14px] leading-none text-red-400">
              cancel
            </span>
            <span className="min-w-0 leading-tight">{network}</span>
            <span className="sr-only">not supported</span>
          </li>
        ))}
      </ul>

      <p className="mt-2 text-[10px] italic leading-relaxed text-[#c4c9b0]/70">
        Use a Globe, TM, or DITO number. Codes are sent as &ldquo;{senderId}&rdquo; and availability depends on
        your network and provider — delivery can be delayed or blocked.
      </p>
    </aside>
  );
}
