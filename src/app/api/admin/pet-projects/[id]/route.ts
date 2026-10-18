import { NextResponse } from "next/server";
import { hasValidSession } from "@/lib/auth";
import { assertFound, errorResponse, parseId, readJson, requireStrings } from "@/lib/adminApi";
import { updatePetProject, deletePetProject } from "@/lib/repositories/petProjects";
import type { PetProject } from "@/lib/types";

export const runtime = "nodejs";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  if (!(await hasValidSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await readJson<PetProject>(req);
    requireStrings(body, ["slug", "title"]);
    assertFound(await updatePetProject(parseId(params.id), body));
    return NextResponse.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  if (!(await hasValidSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    assertFound(await deletePetProject(parseId(params.id)));
    return NextResponse.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
