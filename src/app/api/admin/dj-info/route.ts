import { NextResponse } from "next/server";
import { hasValidSession } from "@/lib/auth";
import { HttpError, errorResponse, readJson, requireStringArray, requireStrings } from "@/lib/adminApi";
import { saveDjInfo } from "@/lib/repositories/djInfo";
import type { DjInfo } from "@/lib/types";

export const runtime = "nodejs";

export async function PUT(req: Request) {
  if (!(await hasValidSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await readJson<DjInfo>(req);
    requireStrings(body, ["summary", "bookingEmail"]);
    requireStringArray(body, "photos");
    requireStringArray(body, "partners");
    const riderOk =
      Array.isArray(body.technicalRider) &&
      body.technicalRider.every((r) => r && ["name", "description", "image"].every((k) => typeof (r as Record<string, unknown>)[k] === "string"));
    if (!riderOk) throw new HttpError(400, "technicalRider must be an array of { name, description, image }");
    await saveDjInfo(body);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
