/**
 * Centralized locale-aware navigation utilities.
 *
 * Re-exports everything from `@/i18n/routing` and adds a `useNavigation` hook
 * that bundles the most common navigation helpers into a single call.
 *
 * Usage (component):
 *   import { Link } from "@/shared/lib/navigation";
 *   <Link href="/dashboard">…</Link>
 *
 * Usage (hook):
 *   import { useNavigation } from "@/shared/lib/navigation";
 *   const { router, pathname, locale } = useNavigation();
 *   router.push("/settings");
 */

// Re-export locale-aware primitives so consumers only need one import path.
export { Link, redirect, usePathname, useRouter } from "@/i18n/routing";
export { routing } from "@/i18n/routing";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";

/**
 * All-in-one navigation hook.
 * Returns the locale-aware router, current pathname (without locale prefix),
 * and the active locale.
 */
export function useNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  return { router, pathname, locale } as const;
}
