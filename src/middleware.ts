import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "admin_session";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isLogin = pathname.startsWith("/admin/login") || pathname.startsWith("/api/admin/login");
  if (isLogin) return NextResponse.next();

  const hasCookie = Boolean(req.cookies.get(SESSION_COOKIE)?.value);
  if (hasCookie) return NextResponse.next();

  if (pathname.startsWith("/api/admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
