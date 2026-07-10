import { NextResponse } from "next/server";
import { SESSION_COOKIE, hasValidSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST() {
  if (!hasValidSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
