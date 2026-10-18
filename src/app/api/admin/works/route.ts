import { NextResponse } from "next/server";
import { hasValidSession } from "@/lib/auth";
import { errorResponse, readJson, requireStringArray, requireStrings } from "@/lib/adminApi";
import { createWork } from "@/lib/repositories/works";
import type { WorksType } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!(await hasValidSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await readJson<WorksType>(req);
    requireStrings(body, ["slug", "title"]);
    requireStringArray(body, "categories");
    return NextResponse.json({ id: await createWork(body) });
  } catch (e) {
    return errorResponse(e);
  }
}
