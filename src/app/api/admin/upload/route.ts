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
  if (!(await hasValidSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // reject oversized bodies before buffering them (multipart overhead is small)
  const MAX_BYTES = 15 * 1024 * 1024;
  const length = Number(req.headers.get("content-length"));
  if (!length) return NextResponse.json({ error: "Content-Length required" }, { status: 411 });
  if (length > MAX_BYTES + 1024 * 1024) {
    return NextResponse.json({ error: "File too large (max 15MB)" }, { status: 413 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload" }, { status: 400 });
  }
  const file = form.get("file");
  const slug = safeSlug(String(form.get("slug") || "misc"));
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large (max 15MB)" }, { status: 413 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const base = path.parse(file.name).name.toLowerCase().replace(/[^a-z0-9-_]/g, "-").replace(/^-+|-+$/g, "") || "image";
  const dir = path.join(process.cwd(), "public", "projects", slug);
  let webp: Buffer;
  try {
    webp = await sharp(buf).rotate().webp({ quality: 82 }).toBuffer();
  } catch {
    return NextResponse.json({ error: "Invalid image file" }, { status: 400 });
  }

  await fs.mkdir(dir, { recursive: true });

  // never overwrite: "wx" fails atomically if the name is taken, so retry as name-2, name-3, ...
  let webpName = `${base}.webp`;
  for (let n = 2; ; n++) {
    try {
      await fs.writeFile(path.join(dir, webpName), webp, { flag: "wx" });
      break;
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code !== "EEXIST") throw e;
      webpName = `${base}-${n}.webp`;
    }
  }

  return NextResponse.json({ path: `/projects/${slug}/${webpName}` });
}
