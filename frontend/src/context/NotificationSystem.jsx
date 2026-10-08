import { useToastStore } from '../stores/toastStore.js';
import Icon from '../components/Icon.jsx';

// Toast renderer — canonical store is stores/toastStore.js.
// NotificationProvider mounts the ToastContainer once (in AppProviders) so
// every `useToastStore().addToast()` has visible UI. Not dead code: removing
// this provider removes all toast visuals. (Formerly mislabeled LEGACY SHIM.)

const COLORS = {
  success: 'border-[var(--accent-border)] text-[var(--accent)]',
  error: 'border-[var(--error)]/30 text-[var(--error)]',
  info: 'border-[var(--border-light)] text-[var(--text-secondary)]',
};

function Toast({ id, message, variant, onClose }) {
  return (
    <div
      className={`flex items-start gap-3 w-[320px] max-w-[calc(100vw-2rem)] px-4 py-3 glass-card border rounded-xl shadow-[var(--shadow-lg)] ${COLORS[variant] || COLORS.info} animate-[fade-in_0.2s_ease]`}
      role="status"
      aria-live="polite"
    >
      <Icon name={variant === 'success' ? 'check_circle' : variant === 'error' ? 'error' : 'info'} className="text-[18px] mt-0.5 shrink-0" />
      <p className="text-[12px] text-[var(--text-primary)] leading-relaxed flex-1 m-0 break-words min-w-0">{message}</p>
      <button onClick={() => onClose(id)} aria-label="Dismiss notification" className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors bg-transparent border-none cursor-pointer p-2 -m-1 leading-none min-w-[44px] min-h-[44px] flex items-center justify-center shrink-0">
        <Icon name="close" className="text-[16px]" />
      </button>
    </div>
  );
}

function ToastContainer({ toasts, onClose }) {
  return (
    <div className="fixed top-[72px] right-4 z-[var(--z-toast)] flex flex-col gap-2 pointer-events-none">
      <div className="flex flex-col gap-2 pointer-events-auto">
        {toasts.map((t) => (
          <Toast key={t.id} {...t} onClose={onClose} />
        ))}
      </div>
    </div>
  );
}

export function NotificationProvider({ children }) {
  const toasts = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);
  return (
    <>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </>
  );
}

// NOTE: useNotification lives in stores/toastStore.js (single source).
// Import { useNotification } from '../stores/toastStore.js' instead.
