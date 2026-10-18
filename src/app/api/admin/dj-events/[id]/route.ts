import { NextResponse } from "next/server";
import { hasValidSession } from "@/lib/auth";
import { assertFound, errorResponse, parseId, readJson, requireStrings } from "@/lib/adminApi";
import { updateDjEvent, deleteDjEvent } from "@/lib/repositories/djEvents";
import type { DjEvent } from "@/lib/types";

export const runtime = "nodejs";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  if (!(await hasValidSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await readJson<DjEvent>(req);
    requireStrings(body, ["date", "venue"]);
    assertFound(await updateDjEvent(parseId(params.id), body));
    return NextResponse.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  if (!(await hasValidSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    assertFound(await deleteDjEvent(parseId(params.id)));
    return NextResponse.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
