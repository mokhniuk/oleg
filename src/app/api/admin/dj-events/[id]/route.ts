import { NextResponse } from "next/server";
import { hasValidSession } from "@/lib/auth";
import { updateDjEvent, deleteDjEvent } from "@/lib/repositories/djEvents";
import type { DjEvent } from "@/lib/types";

export const runtime = "nodejs";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  if (!(await hasValidSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await updateDjEvent(Number(params.id), (await req.json()) as DjEvent);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  if (!(await hasValidSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await deleteDjEvent(Number(params.id));
  return NextResponse.json({ ok: true });
}
