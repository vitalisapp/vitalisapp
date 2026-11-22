import { useToastStore } from '../stores/toastStore.js';
import Icon from '../components/Icon.jsx';
import './NotificationSystem.css';

// Toast renderer — canonical store is stores/toastStore.js.
// NotificationProvider mounts the ToastContainer once (in AppProviders) so
// every `useToastStore().addToast()` has visible UI.

const ICONS = {
  success: 'check',
  error: 'priority_high',
  info: 'info',
};

function Toast({ id = undefined, variant = 'info', message = undefined, title = undefined, description = undefined, onClose = undefined }) {
  return (
    <div className={`v-toast is-${variant}`} role={variant === 'error' ? 'alert' : 'status'} aria-live={variant === 'error' ? 'assertive' : 'polite'}>
      <span className="v-toast-icon" aria-hidden="true">
        <Icon name={ICONS[variant] || ICONS.info} />
      </span>

      <div className="v-toast-body">
        <p className="v-toast-title">{title || message}</p>
        {description ? <p className="v-toast-description">{description}</p> : null}
      </div>

      <button
        type="button"
        onClick={() => onClose(id)}
        aria-label="Dismiss notification"
        className="v-toast-close"
      >
        <Icon name="close" />
      </button>
    </div>
  );
}

function ToastContainer({ toasts = undefined, onClose = undefined }) {
  return (
    <div className="v-toast-container">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={onClose} />
      ))}
    </div>
  );
}

export function NotificationProvider({ children = undefined }) {
  const toasts = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);
  return (
    <>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </>
  );
}
