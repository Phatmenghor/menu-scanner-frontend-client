// src/middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { locales, defaultLocale } from "./i18n/request";

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("auth-token-client")?.value;

  // Get locale from cookie
  const localeCookie = req.cookies.get("locale")?.value;
  const locale =
    localeCookie && locales.includes(localeCookie as any)
      ? localeCookie
      : defaultLocale;

  // Define route types
  const publicRoutes = ["/login"];
  const authRoutes = ["/admin"];

  // Check if current path is public
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if current path requires authentication
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Redirect to login if trying to access protected route without token
  if (isAuthRoute && !token) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to dashboard if trying to access login with token
  if (isPublicRoute && token && pathname === "/login") {
    const dashboardUrl = new URL("/admin/platform-users", req.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // Create response and set locale header for next-intl
  const response = NextResponse.next();
  response.headers.set("x-locale", locale);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)",
  ],
};
