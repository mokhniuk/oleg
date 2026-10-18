import { NextResponse } from "next/server";
import { hasValidSession } from "@/lib/auth";
import { assertFound, errorResponse, parseId, readJson, requireStringArray, requireStrings } from "@/lib/adminApi";
import { updateWork, deleteWork } from "@/lib/repositories/works";
import type { WorksType } from "@/lib/types";

export const runtime = "nodejs";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  if (!(await hasValidSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await readJson<WorksType>(req);
    requireStrings(body, ["slug", "title"]);
    requireStringArray(body, "categories");
    assertFound(await updateWork(parseId(params.id), body));
    return NextResponse.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  if (!(await hasValidSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    assertFound(await deleteWork(parseId(params.id)));
    return NextResponse.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
