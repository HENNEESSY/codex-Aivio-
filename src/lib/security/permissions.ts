import { WorkspaceRole } from '@/types/aivio';

export const ROLE_PERMISSIONS: Record<WorkspaceRole, string[]> = {
  owner: [
    'manage_workspace',
    'manage_members',
    'manage_billing',
    'manage_integrations',
    'manage_agents',
    'manage_deals',
    'manage_contacts',
    'manage_tasks',
    'manage_finance',
    'export_finance',
    'manage_approvals',
    'manage_automations',
    'view_audit_log',
    'view_reports',
    'view_settings'
  ],
  admin: [
    'manage_members',
    'manage_integrations',
    'manage_agents',
    'manage_deals',
    'manage_contacts',
    'manage_tasks',
    'manage_finance',
    'manage_approvals',
    'manage_automations',
    'view_audit_log',
    'view_reports',
    'view_settings'
  ],
  manager: [
    'manage_deals',
    'manage_contacts',
    'manage_tasks',
    'manage_approvals',
    'view_reports',
    'view_settings'
  ],
  viewer: [
    'view_reports',
    'view_settings'
  ]
};

export function getRolePermissions(role: WorkspaceRole): string[] {
  return ROLE_PERMISSIONS[role] || [];
}

export function hasPermission(role: WorkspaceRole | null | undefined, permission: string): boolean {
  if (!role) return false;
  const perms = getRolePermissions(role);
  return perms.includes(permission);
}

export function requirePermission(role: WorkspaceRole | null | undefined, permission: string): void {
  if (!hasPermission(role, permission)) {
    throw new Error(`Permission Denied: Requires ${permission}`);
  }
}

export function canManageFinance(role?: WorkspaceRole | null): boolean {
  return hasPermission(role, 'manage_finance');
}

export function canExportFinance(role?: WorkspaceRole | null): boolean {
  return hasPermission(role, 'export_finance');
}

export function canDeleteFinanceTransaction(role?: WorkspaceRole | null): boolean {
  return hasPermission(role, 'manage_finance');
}

export function canManageAgents(role?: WorkspaceRole | null): boolean {
  return hasPermission(role, 'manage_agents');
}

export function canApproveAIAction(role?: WorkspaceRole | null): boolean {
  return hasPermission(role, 'manage_approvals');
}

export function canManageIntegrations(role?: WorkspaceRole | null): boolean {
  return hasPermission(role, 'manage_integrations');
}

export function canViewAuditLog(role?: WorkspaceRole | null): boolean {
  return hasPermission(role, 'view_audit_log');
}
