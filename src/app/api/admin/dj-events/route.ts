import { NextResponse } from "next/server";
import { hasValidSession } from "@/lib/auth";
import { createDjEvent } from "@/lib/repositories/djEvents";
import type { DjEvent } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!(await hasValidSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = await createDjEvent((await req.json()) as DjEvent);
  return NextResponse.json({ id });
}
