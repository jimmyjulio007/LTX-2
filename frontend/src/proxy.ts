import { type NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/terms",
  "/privacy",
  "/api-docs",
  "/gallery",
  "/v",
  "/use-cases",
  "/marketplace",
];

const AUTH_ONLY_PATHS = ["/login", "/signup", "/forgot-password", "/reset-password"];

const ADMIN_PATHS = ["/admin", "/admin/moderation"];

function stripLocale(pathname: string): string {
  return pathname.replace(/^\/(en|fr)/, "") || "/";
}

function getLocale(pathname: string): string {
  return pathname.match(/^\/(en|fr)/)?.[1] || routing.defaultLocale;
}

function matchesAny(path: string, paths: string[]): boolean {
  return paths.some((p) => path === p || path.startsWith(`${p}/`));
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const path = stripLocale(pathname);
  const locale = getLocale(pathname);
  const sessionCookie = request.cookies.get("better-auth.session_token");
  const isAuthenticated = !!sessionCookie;

  if (isAuthenticated && matchesAny(path, AUTH_ONLY_PATHS)) {
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
  }

  if (!matchesAny(path, PUBLIC_PATHS) && !isAuthenticated) {
    const loginUrl = new URL(`/${locale}/login`, request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (matchesAny(path, ADMIN_PATHS) && isAuthenticated) {
    const sessionCache = request.cookies.get("better-auth.session_data");
    if (sessionCache) {
      try {
        const data = JSON.parse(atob(sessionCache.value.split(".")[1]));
        const role = data?.user?.role;
        if (role !== "ADMIN") {
          return NextResponse.redirect(new URL(`/${locale}`, request.url));
        }
      } catch {
        // If cache is unreadable, let the page handle authorization
      }
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/", "/(fr|en)/:path*"],
};
