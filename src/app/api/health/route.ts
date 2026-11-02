import { NextResponse } from "next/server";
import { initSchema, rows } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const probe = () => rows("SELECT 1 FROM settings LIMIT 1");

// Liveness + DB reachability + schema present, for Docker/Coolify healthchecks. No auth, no data.
// If the DB is up but the tables are missing (boot-time init gave up), create them and recheck.
export async function GET() {
  try {
    try {
      await probe();
    } catch (err) {
      if ((err as { code?: string }).code !== "ER_NO_SUCH_TABLE") throw err;
      await initSchema();
      await probe();
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}
