import { describe, it, expect, afterAll, vi } from "vitest";
import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";

const session = vi.hoisted(() => ({ valid: true }));
vi.mock("@/lib/auth", () => ({ hasValidSession: async () => session.valid }));

import { POST } from "./route";

const SLUG = "vitest-upload";
const dir = path.join(process.cwd(), "public", "projects", SLUG);

async function png() {
  return sharp({ create: { width: 4, height: 4, channels: 3, background: "#f00" } }).png().toBuffer();
}
async function upload(name: string, data: Buffer | string, type = "image/png", slug = SLUG) {
  const fd = new FormData();
  fd.append("file", new File([data as BlobPart], name, { type }));
  fd.append("slug", slug);
  // browsers send Content-Length for FormData bodies; Request() in tests doesn't, so add it
  const raw = new Request("http://test", { method: "POST", body: fd });
  const body = await raw.arrayBuffer();
  return POST(new Request("http://test", {
    method: "POST",
    body,
    headers: { "content-type": raw.headers.get("content-type")!, "content-length": String(body.byteLength) },
  }));
}

afterAll(() => fs.rm(dir, { recursive: true, force: true }));

describe("upload route", () => {
  it("401 without a session", async () => {
    session.valid = false;
    expect((await upload("a.png", await png())).status).toBe(401);
    session.valid = true;
  });

  it("411 without Content-Length", async () => {
    const fd = new FormData();
    fd.append("file", new File([(await png()) as BlobPart], "a.png", { type: "image/png" }));
    expect((await POST(new Request("http://test", { method: "POST", body: fd }))).status).toBe(411);
  });

  it("converts to webp and never overwrites", async () => {
    const buf = await png();
    expect((await (await upload("Pic.png", buf)).json()).path).toBe(`/projects/${SLUG}/pic.webp`);
    expect((await (await upload("Pic.png", buf)).json()).path).toBe(`/projects/${SLUG}/pic-2.webp`);
  });

  it("falls back to a name for empty basenames", async () => {
    expect((await (await upload("!!!.png", await png())).json()).path).toBe(`/projects/${SLUG}/image.webp`);
  });

  it("rejects non-images", async () => {
    expect((await upload("a.txt", "hello", "text/plain")).status).toBe(400);
    expect((await upload("a.png", "not really a png")).status).toBe(400);
  });
});
