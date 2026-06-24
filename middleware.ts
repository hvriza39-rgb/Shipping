import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session      = req.auth;
  const isLoggedIn   = !!session?.user;

  const publicRoutes = ["/", "/login", "/register", "/track"];
  const isPublic =
    publicRoutes.some((r) => pathname === r) ||
    pathname.startsWith("/api/tracking") ||
    pathname.startsWith("/api/auth");

  if (isPublic) return NextResponse.next();

  if (!isLoggedIn) {
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  const role = session!.user.role;

  // Non admin/staff trying to reach the admin panel -> bounce to their dashboard
  if (pathname.startsWith("/admin/dashboard")) {
    if (role !== "ADMIN" && role !== "STAFF") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  // Admin/staff landing on the regular dashboard (e.g. right after login)
  // -> send them to the admin panel instead
  if (pathname.startsWith("/dashboard")) {
    if (role === "ADMIN" || role === "STAFF") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
