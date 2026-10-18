import { NextResponse } from "next/server";
import { rows } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Liveness + DB reachability for Docker/Coolify healthchecks. No auth, no data.
export async function GET() {
  try {
    await rows("SELECT 1");
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}
