import { NextResponse } from "next/server";
import { hasValidSession } from "@/lib/auth";
import { errorResponse, readJson, requireStrings } from "@/lib/adminApi";
import { createPetProject } from "@/lib/repositories/petProjects";
import type { PetProject } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!(await hasValidSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await readJson<PetProject>(req);
    requireStrings(body, ["slug", "title"]);
    return NextResponse.json({ id: await createPetProject(body) });
  } catch (e) {
    return errorResponse(e);
  }
}
