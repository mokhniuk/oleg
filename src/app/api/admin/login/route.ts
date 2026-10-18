import { NextResponse } from "next/server";
import { getPasswordHash, getSessionSecret } from "@/lib/repositories/settings";
import { clearFailures, isLimited, recordFailure } from "@/lib/rateLimit";
import { verifyPassword, signSession, SESSION_COOKIE, SESSION_TTL_MS } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  // Count the attempt before any await so parallel requests can't all pass the check.
  // Keyed per client IP (X-Forwarded-For must be set by the reverse proxy in production).
  if (isLimited(ip)) {
    return NextResponse.json({ error: "Too many attempts, try again later" }, { status: 429 });
  }
  recordFailure(ip);
  const body = await req.json().catch(() => ({}));
  const password = typeof body?.password === "string" ? body.password : "";
  const stored = await getPasswordHash();
  const secret = await getSessionSecret();
  if (!stored || !secret || !verifyPassword(password, stored)) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }
  clearFailures(ip);
  const token = signSession(secret, Date.now() + SESSION_TTL_MS);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
  return res;
}
