import Modal from './Modal.jsx';
import Button from './Button.jsx';
import Icon from '../Icon.jsx';

/**
 * Reusable confirmation dialog for any "are you sure?" moment.
 *
 * Built on the shared Modal so it inherits the focus trap, scroll lock, ESC
 * handling, exit animation and safe-area padding. Use it anywhere a click
 * needs a deliberate second step (log out, delete, revoke, discard…).
 *
 * @example
 * <ConfirmDialog
 *   isOpen={open}
 *   onClose={() => setOpen(false)}
 *   onConfirm={handleLogout}
 *   title="Log out?"
 *   message="You'll be signed out of this device."
 *   confirmLabel="Log out"
 *   tone="danger"
 *   icon="logout"
 * />
 */
export default function ConfirmDialog({
  isOpen = false,
  onClose = undefined,
  onConfirm = undefined,
  title = 'Are you sure?',
  message = undefined,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'primary',
  icon = 'help',
  busy = false,
  error = '',
  closeOnBackdrop = true,
  children = undefined,
}) {
  const danger = tone === 'danger';
  const safeClose = busy ? undefined : onClose;

  return (
    <Modal
      isOpen={isOpen}
      onClose={safeClose}
      title={title}
      icon={icon}
      size="sm"
      hideClose={busy}
      closeOnBackdrop={!busy && closeOnBackdrop}
      closeOnEsc={!busy}
      footer={(
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={safeClose} disabled={busy}>
            {cancelLabel}
          </Button>
          <Button
            variant={danger ? 'danger' : 'primary'}
            onClick={onConfirm}
            loading={busy}
          >
            {confirmLabel}
          </Button>
        </div>
      )}
    >
      {message && (
        <p className="m-0 text-[length:var(--fs-13)] leading-relaxed text-[var(--text-muted)]">
          {message}
        </p>
      )}
      {children}
      {error && (
        <p
          className="mt-3 mb-0 flex items-start gap-2 text-[length:var(--fs-12)] text-[var(--error)]"
          role="alert"
        >
          <Icon name="error" className="mt-px shrink-0 text-[length:var(--fs-15)]" />
          <span>{error}</span>
        </p>
      )}
    </Modal>
  );
}
