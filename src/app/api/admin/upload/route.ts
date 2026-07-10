import { NextResponse } from "next/server";
import { hasValidSession } from "@/lib/auth";
import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

function safeSlug(s: string): string {
  return (s || "misc").toLowerCase().replace(/[^a-z0-9-_]/g, "-").replace(/-+/g, "-");
}

export async function POST(req: Request) {
  if (!hasValidSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file");
  const slug = safeSlug(String(form.get("slug") || "misc"));
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }

  const MAX_BYTES = 15 * 1024 * 1024;
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large (max 15MB)" }, { status: 413 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const base = path.parse(file.name).name.toLowerCase().replace(/[^a-z0-9-_]/g, "-");
  const dir = path.join(process.cwd(), "public", "projects", slug);
  await fs.mkdir(dir, { recursive: true });

  const webpName = `${base}.webp`;
  try {
    await sharp(buf).webp({ quality: 82 }).toFile(path.join(dir, webpName));
  } catch {
    return NextResponse.json({ error: "Invalid image file" }, { status: 400 });
  }

  return NextResponse.json({ path: `/projects/${slug}/${webpName}` });
}
