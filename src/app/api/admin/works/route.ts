import { NextResponse } from "next/server";
import { hasValidSession } from "@/lib/auth";
import { createWork } from "@/lib/repositories/works";
import type { WorksType } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!hasValidSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await req.json()) as WorksType;
  const id = createWork(body);
  return NextResponse.json({ id });
}
