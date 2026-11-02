import { describe, it, expect, beforeAll, afterAll } from "vitest";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { GET, HEAD } from "./route";

const tmp = path.join(os.tmpdir(), `vitest-media-${process.pid}`);
const uploads = path.join(tmp, "uploads");
const cwd = path.join(tmp, "cwd");
const baked = path.join(cwd, "public", "projects");
const origCwd = process.cwd();
const get = (segs: string[], headers: Record<string, string> = {}) =>
  GET(new Request("http://test/x", { headers }), { params: { path: segs } });
const text = async (r: Response) => Buffer.from(await r.arrayBuffer()).toString();

beforeAll(async () => {
  await fs.mkdir(path.join(uploads, "p"), { recursive: true });
  await fs.mkdir(path.join(baked, "p"), { recursive: true });
  await fs.writeFile(path.join(uploads, "p", "both.webp"), "from-uploads");
  await fs.writeFile(path.join(baked, "p", "both.webp"), "from-baked");
  await fs.writeFile(path.join(baked, "p", "only-baked.txt"), "baked-only");
  await fs.writeFile(path.join(uploads, "p", "clip.mp4"), "0123456789");
  await fs.writeFile(path.join(tmp, "secret.txt"), "secret");
  await fs.writeFile(path.join(uploads, "p", "weird.xyz"), "x");
  await fs.symlink(path.join(tmp, "secret.txt"), path.join(uploads, "p", "link.txt"));
  process.env.UPLOAD_DIR = uploads;
  process.chdir(cwd);
});
afterAll(async () => {
  process.chdir(origCwd);
  delete process.env.UPLOAD_DIR;
  await fs.rm(tmp, { recursive: true, force: true });
});

describe("media route", () => {
  it("does not follow symlinks that leave the base dir", async () => {
    expect((await get(["p", "link.txt"])).status).toBe(404);
  });

  it("upload dir takes precedence over the baked dir", async () => {
    const res = await get(["p", "both.webp"]);
    expect(res.status).toBe(200);
    expect(await text(res)).toBe("from-uploads");
    expect(res.headers.get("content-type")).toBe("image/webp");
    expect(res.headers.get("content-length")).toBe("12");
    expect(res.headers.get("cache-control")).toBe("public, max-age=0, must-revalidate");
  });

  it("falls back to the baked dir", async () => {
    const res = await get(["p", "only-baked.txt"]);
    expect(res.status).toBe(200);
    expect(await text(res)).toBe("baked-only");
    expect(res.headers.get("content-type")).toContain("text/plain");
  });

  it("404 for missing files and directories", async () => {
    expect((await get(["p", "nope.webp"])).status).toBe(404);
    expect((await get(["p"])).status).toBe(404);
  });

  it("blocks path traversal", async () => {
    const attempts = [
      ["..", "secret.txt"],
      ["p", "..", "..", "secret.txt"],
      ["/etc/passwd"],
      ["p\0", "both.webp"],
      ["..\\secret.txt"],
    ];
    for (const segs of attempts) expect((await get(segs)).status).toBe(404);
  });

  it("default content type", async () => {
    expect((await get(["p", "weird.xyz"])).headers.get("content-type")).toBe("application/octet-stream");
  });

  it("supports Range requests", async () => {
    const r = await get(["p", "clip.mp4"], { range: "bytes=2-5" });
    expect(r.status).toBe(206);
    expect(r.headers.get("content-range")).toBe("bytes 2-5/10");
    expect(r.headers.get("content-length")).toBe("4");
    expect(await text(r)).toBe("2345");
    expect(await text(await get(["p", "clip.mp4"], { range: "bytes=7-" }))).toBe("789");
    expect(await text(await get(["p", "clip.mp4"], { range: "bytes=-3" }))).toBe("789");
    const bad = await get(["p", "clip.mp4"], { range: "bytes=50-60" });
    expect(bad.status).toBe(416);
    expect(bad.headers.get("content-range")).toBe("bytes */10");
  });

  it("304 on matching ETag; HEAD has no body", async () => {
    const first = await get(["p", "clip.mp4"]);
    const etag = first.headers.get("etag")!;
    expect(etag).toBeTruthy();
    expect((await get(["p", "clip.mp4"], { "if-none-match": etag })).status).toBe(304);
    const head = await HEAD(new Request("http://test/x"), { params: { path: ["p", "clip.mp4"] } });
    expect(head.status).toBe(200);
    expect(head.headers.get("content-length")).toBe("10");
    expect((await head.arrayBuffer()).byteLength).toBe(0);
  });
});
