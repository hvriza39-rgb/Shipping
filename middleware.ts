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

  if (pathname.startsWith("/admin")) {
    const role = session!.user.role;
    if (role !== "ADMIN" && role !== "STAFF") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
