import { NextResponse } from "next/server";
import { hasValidSession } from "@/lib/auth";
import { HttpError, assertFound, errorResponse, parseId, readJson } from "@/lib/adminApi";
import { setWorkFlags, type WorkFlags } from "@/lib/repositories/works";

export const runtime = "nodejs";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (!(await hasValidSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await readJson<WorkFlags>(req);
    const keys = ["show", "featured", "inProgress"] as const;
    const given = keys.filter((k) => body[k] !== undefined);
    if (!given.length || !given.every((k) => typeof body[k] === "boolean")) {
      throw new HttpError(400, "Provide show, featured or inProgress as booleans");
    }
    assertFound(await setWorkFlags(parseId(params.id), {
      show: body.show,
      featured: body.featured,
      inProgress: body.inProgress,
    }));
    return NextResponse.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
