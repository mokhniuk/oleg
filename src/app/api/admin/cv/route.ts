import { NextResponse } from "next/server";
import { hasValidSession } from "@/lib/auth";
import { HttpError, errorResponse, readJson } from "@/lib/adminApi";
import { saveCv } from "@/lib/repositories/cv";
import type { CvContent } from "@/lib/types";

export const runtime = "nodejs";

export async function PUT(req: Request) {
  if (!(await hasValidSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await readJson<CvContent>(req);
    const ok =
      body && typeof body.personalInfo === "object" && body.personalInfo !== null &&
      Array.isArray(body.experience) && Array.isArray(body.education) && Array.isArray(body.languages) &&
      typeof body.stack === "object" && body.stack !== null && !Array.isArray(body.stack);
    if (!ok) throw new HttpError(400, "Invalid CV content");
    await saveCv(body);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
