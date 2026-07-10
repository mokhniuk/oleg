import { NextResponse } from "next/server";
import { hasValidSession } from "@/lib/auth";
import { saveDjInfo } from "@/lib/repositories/djInfo";
import type { DjInfo } from "@/lib/types";

export const runtime = "nodejs";

export async function PUT(req: Request) {
  if (!hasValidSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  saveDjInfo((await req.json()) as DjInfo);
  return NextResponse.json({ ok: true });
}
