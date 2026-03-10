export type Role = "USER" | "ADMIN" | "MANAGER";

export type Resource = "user" | "video" | "project" | "billing" | "admin" | "settings" | "marketing" | "moderation";
export type Action = "read" | "write" | "delete" | "export" | "manage";

export type Permission = `${Resource}:${Action}`;

export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  ADMIN: [
    "user:read",
    "user:write",
    "user:delete",
    "user:manage",
    "video:read",
    "video:write",
    "video:delete",
    "video:export",
    "project:read",
    "project:write",
    "project:delete",
    "billing:read",
    "billing:manage",
    "admin:read",
    "admin:manage",
    "settings:read",
    "settings:write",
    "marketing:read",
    "marketing:write",
    "moderation:read",
    "moderation:manage",
  ],
  MANAGER: [
    "user:read",
    "user:write",
    "video:read",
    "video:write",
    "video:delete",
    "video:export",
    "project:read",
    "project:write",
    "project:delete",
    "billing:read",
    "marketing:read",
    "marketing:write",
    "moderation:read",
    "settings:read",
  ],
  USER: [
    "user:read",
    "video:read",
    "video:write",
    "video:export",
    "project:read",
    "project:write",
    "billing:read",
    "settings:read",
  ],
} as const;

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

export function hasAllPermissions(role: Role, permissions: Permission[]): boolean {
  return permissions.every((p) => hasPermission(role, p));
}

export function getPermissions(role: Role): readonly Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

export const ROLE_HIERARCHY: Record<Role, number> = {
  USER: 0,
  MANAGER: 1,
  ADMIN: 2,
};

export function isRoleAtLeast(role: Role, minRole: Role): boolean {
  return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY[minRole];
}
