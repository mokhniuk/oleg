import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "admin_session";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isLogin = pathname.startsWith("/admin/login") || pathname.startsWith("/api/admin/login");

  // The admin layout skips its session check when this header is set, so a client
  // must never be able to send it: always drop the incoming value, set it only for login.
  const headers = new Headers(req.headers);
  headers.delete("x-admin-public");
  if (isLogin) {
    headers.set("x-admin-public", "1");
    return NextResponse.next({ request: { headers } });
  }

  const hasCookie = Boolean(req.cookies.get(SESSION_COOKIE)?.value);
  if (hasCookie) return NextResponse.next({ request: { headers } });

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
