import { auth } from "@/shared/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { type Permission, type Role, hasPermission, isRoleAtLeast } from "./permissions";

export async function getServerSession() {
  return auth.api.getSession({
    headers: await headers(),
  });
}

export async function requireSession() {
  const session = await getServerSession();
  if (!session?.user) {
    redirect("/login");
  }
  return session;
}

export async function checkPermission(permission: Permission): Promise<boolean> {
  const session = await getServerSession();
  if (!session?.user) return false;
  return hasPermission(session.user.role as Role, permission);
}

export async function requirePermission(permission: Permission) {
  const session = await requireSession();
  const role = session.user.role as Role;
  if (!hasPermission(role, permission)) {
    throw new Error("Unauthorized: Missing required permission");
  }
  return session;
}

export async function requireRole(minRole: Role) {
  const session = await requireSession();
  const role = session.user.role as Role;
  if (!isRoleAtLeast(role, minRole)) {
    throw new Error("Unauthorized: Insufficient role");
  }
  return session;
}
