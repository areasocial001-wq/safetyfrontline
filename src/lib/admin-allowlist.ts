// Emails authorized to access Company/Employee dashboards while logged in as admin.
export const ADMIN_DASHBOARD_ALLOWLIST = [
  'safetygame@sicurazienda.com',
  'social@sicurazienda.com',
];

export const isAllowlistedAdminEmail = (email?: string | null): boolean => {
  if (!email) return false;
  return ADMIN_DASHBOARD_ALLOWLIST.includes(email.toLowerCase());
};
