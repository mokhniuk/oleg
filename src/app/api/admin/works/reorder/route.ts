import { NextResponse } from "next/server";
import { hasValidSession } from "@/lib/auth";
import { HttpError, errorResponse, readJson } from "@/lib/adminApi";
import { reorderWorks } from "@/lib/repositories/works";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!(await hasValidSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { ids } = await readJson<{ ids: unknown }>(req);
    if (!Array.isArray(ids) || !ids.every((n) => Number.isInteger(n))) throw new HttpError(400, "ids must be an integer array");
    if (!(await reorderWorks(ids as number[]))) throw new HttpError(409, "The list changed, reload and try again");
    return NextResponse.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
