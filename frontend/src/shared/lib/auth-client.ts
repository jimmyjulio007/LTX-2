import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";
import type { Role } from "./permissions";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  plugins: [adminClient()],
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  requestPasswordReset,
  resetPassword,
  changePassword,
  updateUser,
  deleteUser,
  linkSocial,
  unlinkAccount,
  listAccounts,
  sendVerificationEmail,
  changeEmail,
} = authClient;

export type Session = typeof authClient.$Infer.Session;
export type User = Session["user"];

export function getUserRole(user: User): Role {
  return (user.role as Role) || "USER";
}

export function isAdmin(user: User): boolean {
  return getUserRole(user) === "ADMIN";
}

export function isManager(user: User): boolean {
  return getUserRole(user) === "MANAGER";
}

export function getInitials(user: User): string {
  const name = user.name || user.email;
  return name
    .split(/[\s@]+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");
}

export function getDisplayName(user: User): string {
  return user.name || user.email.split("@")[0];
}
