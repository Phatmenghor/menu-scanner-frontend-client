import { NextRequest, NextResponse } from "next/server";
import { ROUTES } from "./constants/app-routed/routes";

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("auth-token")?.value;

  console.log(`Middleware: ${pathname}, Token: ${token ? "exists" : "none"}`);

  // If you want "/" to load normally, remove the forced redirect here
  if (pathname === "/") {
    // Example: only redirect if you explicitly want to skip root for logged-in users
    if (token) {
      console.log(
        "Root access with token -> letting it load instead of redirecting"
      );
      return NextResponse.next();
    } else {
      console.log("Root access without token -> letting it load");
      return NextResponse.next();
    }
  }

  // Protect admin routes
  if (pathname.startsWith("/admin")) {
    if (!token) {
      console.log("Admin access without token -> redirecting to /login");
      const loginUrl = new URL(ROUTES.AUTH.LOGIN, req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect to admin if accessing login with token
  if (pathname === "/auth/admin/login" && token) {
    console.log("Login access with token -> redirecting to /admin");
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  console.log("Middleware: allowing request to proceed");
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip all internal paths (_next)
    "/((?!_next/static|_next/image|favicon.ico|api).*)",
  ],
};
