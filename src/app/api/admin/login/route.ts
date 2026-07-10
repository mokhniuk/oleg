import { NextResponse } from "next/server";
import { getPasswordHash, getSessionSecret } from "@/lib/repositories/settings";
import { verifyPassword, signSession, SESSION_COOKIE, SESSION_TTL_MS } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { password } = await req.json().catch(() => ({ password: "" }));
  const stored = getPasswordHash();
  const secret = getSessionSecret();
  if (!stored || !secret || !verifyPassword(password ?? "", stored)) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }
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
