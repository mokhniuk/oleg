import { NextResponse } from "next/server";
import { hasValidSession } from "@/lib/auth";
import { updateWork, deleteWork } from "@/lib/repositories/works";
import type { WorksType } from "@/lib/types";

export const runtime = "nodejs";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  if (!(await hasValidSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await req.json()) as WorksType;
  await updateWork(Number(params.id), body);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  if (!(await hasValidSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await deleteWork(Number(params.id));
  return NextResponse.json({ ok: true });
}
