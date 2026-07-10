import { NextResponse } from "next/server";
import { hasValidSession } from "@/lib/auth";
import { updatePetProject, deletePetProject } from "@/lib/repositories/petProjects";
import type { PetProject } from "@/lib/types";

export const runtime = "nodejs";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  if (!(await hasValidSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await updatePetProject(Number(params.id), (await req.json()) as PetProject);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  if (!(await hasValidSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await deletePetProject(Number(params.id));
  return NextResponse.json({ ok: true });
}
