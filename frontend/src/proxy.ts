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
  try {
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
      if (pathname.startsWith("/") && !pathname.startsWith("//")) {
        loginUrl.searchParams.set("callbackUrl", pathname);
      }
      return NextResponse.redirect(loginUrl);
    }

    if (matchesAny(path, ADMIN_PATHS) && isAuthenticated) {
      const sessionCache = request.cookies.get("better-auth.session_data");
      if (sessionCache) {
        try {
          // session_data is typically a base64 encoded JSON (part of a JWT-like structure)
          const payload = sessionCache.value.split(".")[1];
          if (payload) {
            const data = JSON.parse(atob(payload));
            const role = data?.user?.role;
            if (role !== "ADMIN") {
              console.warn(`[Proxy] Access denied for user role: ${role} on path: ${pathname}`);
              return NextResponse.redirect(new URL(`/${locale}`, request.url));
            }
          }
        } catch (e) {
          console.error("[Proxy] Critical error parsing session data:", e);
          // If cache is unreadable, let the server-side auth handle it more securely
        }
      }
    }

    return intlMiddleware(request);
  } catch (error) {
    console.error("[Proxy] Unhandled error:", error);
    // In case of a major failure, fallback to the intl middleware 
    // to at least serve the page and let the client side handle auth if possible
    return intlMiddleware(request);
  }
}

export const config = {
  matcher: ["/", "/(fr|en)/:path*"],
};
