import ConfirmDialog from './ConfirmDialog.jsx';

/**
 * Log-out confirmation built on the shared ConfirmDialog.
 *
 * One component for both shells, so the member app and the admin console ask
 * the same question with the same behaviour:
 *
 *   <LogoutConfirmDialog
 *     isOpen={logoutOpen}
 *     onClose={() => setLogoutOpen(false)}
 *     onConfirm={handleLogout}
 *   />
 *
 * Pass `admin` for the console wording.
 */
export default function LogoutConfirmDialog({
  isOpen = false,
  onClose = undefined,
  onConfirm = undefined,
  busy = false,
  admin = false,
}) {
  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      busy={busy}
      tone="danger"
      icon="logout"
      title={admin ? 'Sign out of the console?' : 'Log out?'}
      message={
        admin
          ? 'You will leave the admin console and return to the sign-in page. Any unsaved changes will be lost.'
          : 'You will be signed out of this device. You can sign back in at any time.'
      }
      confirmLabel={admin ? 'Sign out' : 'Log out'}
    />
  );
}
