export const ACTION_META = {
  role_change: { label: 'Role changed', tone: 'info', icon: 'manage_accounts' },
  deactivate: { label: 'Account deactivated', tone: 'off', icon: 'person_off' },
  reactivate: { label: 'Account reactivated', tone: 'active', icon: 'person_check' },
  force_signout: { label: 'Force sign-out', tone: 'warn', icon: 'logout' },
  delete_user: { label: 'Account deleted', tone: 'off', icon: 'delete_forever' },
  delete_post: { label: 'Post removed', tone: 'warn', icon: 'gavel' },
  'access_group.create': { label: 'Access QR created', tone: 'active', icon: 'qr_code_2' },
  'access_group.update': { label: 'Access QR edited', tone: 'info', icon: 'qr_code_2' },
  'access_group.enable': { label: 'Access QR turned on', tone: 'active', icon: 'qr_code_2' },
  'access_group.disable': { label: 'Access QR turned off', tone: 'off', icon: 'qr_code_2' },
  'access_group.delete': { label: 'Access QR deleted', tone: 'off', icon: 'qr_code_2' },
};

export const metaForAction = (action) => (
  ACTION_META[action] || { label: action || 'Admin action', tone: 'member', icon: 'bolt' }
);
