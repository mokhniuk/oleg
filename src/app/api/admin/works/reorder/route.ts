import { NextResponse } from "next/server";
import { hasValidSession } from "@/lib/auth";
import { reorderWorks } from "@/lib/repositories/works";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!hasValidSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { ids } = (await req.json()) as { ids: number[] };
  reorderWorks(ids);
  return NextResponse.json({ ok: true });
}
