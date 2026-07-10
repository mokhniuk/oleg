import { NextResponse } from "next/server";
import { hasValidSession } from "@/lib/auth";
import { createPetProject } from "@/lib/repositories/petProjects";
import type { PetProject } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!hasValidSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = createPetProject((await req.json()) as PetProject);
  return NextResponse.json({ id });
}
