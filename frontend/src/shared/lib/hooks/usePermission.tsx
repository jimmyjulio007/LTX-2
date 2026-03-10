"use client";

import { useSession } from "@/shared/lib/auth-client";
import { getUserRole, isAdmin, isManager, getDisplayName, getInitials } from "@/shared/lib/auth-client";
import type { Permission, Role } from "@/shared/lib/permissions";
import { hasPermission, hasAnyPermission, hasAllPermissions, isRoleAtLeast } from "@/shared/lib/permissions";

export function useAuth() {
  const { data: session, isPending, error } = useSession();
  const user = session?.user ?? null;
  const role: Role = user ? getUserRole(user) : "USER";

  return {
    user,
    session: session?.session ?? null,
    role,
    isPending,
    isAuthenticated: !!user,
    error,
    isAdmin: user ? isAdmin(user) : false,
    isManager: user ? isManager(user) : false,
    displayName: user ? getDisplayName(user) : "",
    initials: user ? getInitials(user) : "",
    can: (permission: Permission) => hasPermission(role, permission),
    canAny: (permissions: Permission[]) => hasAnyPermission(role, permissions),
    canAll: (permissions: Permission[]) => hasAllPermissions(role, permissions),
    isAtLeast: (minRole: Role) => isRoleAtLeast(role, minRole),
  };
}

export function usePermission(permission: Permission) {
  const { can, isPending, isAuthenticated } = useAuth();
  if (isPending || !isAuthenticated) return false;
  return can(permission);
}

export function PermissionGate({
  permission,
  children,
  fallback = null,
}: {
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const allowed = usePermission(permission);
  if (!allowed) return fallback;
  return <>{children}</>;
}

export function RoleGate({
  minRole,
  children,
  fallback = null,
}: {
  minRole: Role;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { isAtLeast, isPending, isAuthenticated } = useAuth();
  if (isPending || !isAuthenticated) return fallback;
  if (!isAtLeast(minRole)) return fallback;
  return <>{children}</>;
}

export function AuthGate({
  children,
  fallback = null,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { isAuthenticated, isPending } = useAuth();
  if (isPending) return null;
  if (!isAuthenticated) return fallback;
  return <>{children}</>;
}
