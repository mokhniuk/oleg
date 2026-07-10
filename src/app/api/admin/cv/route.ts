import { NextResponse } from "next/server";
import { hasValidSession } from "@/lib/auth";
import { saveCv } from "@/lib/repositories/cv";
import type { CvContent } from "@/lib/types";

export const runtime = "nodejs";

export async function PUT(req: Request) {
  if (!hasValidSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  saveCv((await req.json()) as CvContent);
  return NextResponse.json({ ok: true });
}
