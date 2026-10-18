import { NextResponse } from "next/server";
import { hasValidSession } from "@/lib/auth";
import { errorResponse, readJson, requireStrings } from "@/lib/adminApi";
import { createDjEvent } from "@/lib/repositories/djEvents";
import type { DjEvent } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!(await hasValidSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await readJson<DjEvent>(req);
    requireStrings(body, ["date", "venue"]);
    return NextResponse.json({ id: await createDjEvent(body) });
  } catch (e) {
    return errorResponse(e);
  }
}
