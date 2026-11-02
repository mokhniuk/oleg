import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { bakedProjectsDir, uploadDir } from "@/lib/uploadDir";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// /projects/* is rewritten here (next.config.mjs) so that files uploaded after
// startup are served: `next start` snapshots public/ once at boot.

const TYPES: Record<string, string> = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".avif": "image/avif",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".json": "application/json",
  ".txt": "text/plain; charset=utf-8",
};

type Ctx = { params: { path: string[] } };

/** Resolve segments under base, or null if they would escape it. */
function resolveInside(base: string, segments: string[]): string | null {
  for (const s of segments) {
    if (!s || s === "." || s === ".." || s.includes("\0") || s.includes("/") || s.includes("\\")) return null;
  }
  const root = path.resolve(base);
  const full = path.resolve(root, ...segments);
  return full.startsWith(root + path.sep) ? full : null;
}

/** Same as resolveInside but follows symlinks and re-checks containment. */
async function resolveReal(base: string, segments: string[]): Promise<string | null> {
  const full = resolveInside(base, segments);
  if (!full) return null;
  try {
    const [realRoot, realFull] = await Promise.all([fsp.realpath(base), fsp.realpath(full)]);
    return realFull.startsWith(realRoot + path.sep) ? realFull : null;
  } catch {
    return null;
  }
}

async function findFile(segments: string[]) {
  // Upload dir first so uploads win over baked-in files of the same name.
  for (const base of [uploadDir(), bakedProjectsDir()]) {
    const full = await resolveReal(base, segments);
    if (!full) continue;
    try {
      const st = await fsp.stat(full);
      if (st.isFile()) return { full, st };
    } catch {
      // not in this base; try the next
    }
  }
  return null;
}

function parseRange(header: string, size: number): { start: number; end: number } | "invalid" | null {
  const m = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!m) return null; // unsupported form (e.g. multi-range): ignore and send the whole file
  const [, a, b] = m;
  if (!a && !b) return "invalid";
  let start: number;
  let end: number;
  if (!a) {
    const n = Number(b);
    if (n === 0) return "invalid";
    start = Math.max(size - n, 0);
    end = size - 1;
  } else {
    start = Number(a);
    end = b ? Math.min(Number(b), size - 1) : size - 1;
  }
  if (start >= size || start > end) return "invalid";
  return { start, end };
}

async function serve(req: Request, { params }: Ctx, head: boolean) {
  const found = await findFile(params.path ?? []);
  if (!found) return new Response("Not found", { status: 404 });
  const { full, st } = found;

  const etag = `W/"${st.size.toString(16)}-${Math.floor(st.mtimeMs).toString(16)}"`;
  const headers: Record<string, string> = {
    "Content-Type": TYPES[path.extname(full).toLowerCase()] ?? "application/octet-stream",
    // Files can be replaced in place under the same name: always revalidate (ETag/304 below).
    "Cache-Control": "public, max-age=0, must-revalidate",
    "Accept-Ranges": "bytes",
    ETag: etag,
    "Last-Modified": st.mtime.toUTCString(),
  };

  const inm = req.headers.get("if-none-match");
  if (inm) {
    if (inm.split(",").some((t) => t.trim() === etag || t.trim() === "*")) {
      return new Response(null, { status: 304, headers });
    }
  } else {
    const ims = Date.parse(req.headers.get("if-modified-since") ?? "");
    if (!Number.isNaN(ims) && Math.floor(st.mtimeMs / 1000) * 1000 <= ims) {
      return new Response(null, { status: 304, headers });
    }
  }

  let start = 0;
  let end = st.size - 1;
  let status = 200;
  const rangeHeader = req.headers.get("range");
  if (rangeHeader) {
    const r = parseRange(rangeHeader, st.size);
    if (r === "invalid") {
      return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${st.size}` } });
    }
    if (r) {
      ({ start, end } = r);
      status = 206;
      headers["Content-Range"] = `bytes ${start}-${end}/${st.size}`;
    }
  }
  const length = st.size === 0 ? 0 : end - start + 1;
  headers["Content-Length"] = String(length);

  if (head || length === 0) return new Response(null, { status, headers });

  const stream = Readable.toWeb(fs.createReadStream(full, { start, end })) as ReadableStream;
  return new Response(stream, { status, headers });
}

export async function GET(req: Request, ctx: Ctx) {
  return serve(req, ctx, false);
}

export async function HEAD(req: Request, ctx: Ctx) {
  return serve(req, ctx, true);
}
