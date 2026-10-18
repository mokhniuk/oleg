import { describe, it, expect, beforeEach, vi } from "vitest";
import { dbAvailable, resetDb } from "@/lib/repositories/testHelpers";

const session = vi.hoisted(() => ({ valid: true }));
vi.mock("@/lib/auth", () => ({ hasValidSession: async () => session.valid, SESSION_COOKIE: "admin_session" }));

import { POST as createWorkRoute } from "./works/route";
import { PUT as updateWorkRoute, DELETE as deleteWorkRoute } from "./works/[id]/route";
import { PATCH as flagsRoute } from "./works/[id]/flags/route";
import { POST as reorderWorksRoute } from "./works/reorder/route";
import { POST as reorderPetsRoute } from "./pet-projects/reorder/route";
import { PUT as djInfoRoute } from "./dj-info/route";
import { PUT as cvRoute } from "./cv/route";
import { POST as logoutRoute } from "./logout/route";
import { POST as createEventRoute } from "./dj-events/route";
import { getAllWorks, getWorkBySlug } from "@/lib/repositories/works";

const available = await dbAvailable();

const json = (body: unknown) =>
  new Request("http://test", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
const work = { slug: "a", title: "A", description: "", bgColor: "#fff", categories: [], show: true };

describe.skipIf(!available)("admin API routes", () => {
  beforeEach(async () => {
    session.valid = true;
    await resetDb();
  });

  it("401 without a session", async () => {
    session.valid = false;
    expect((await createWorkRoute(json(work))).status).toBe(401);
    expect((await reorderWorksRoute(json({ ids: [] }))).status).toBe(401);
    expect((await flagsRoute(json({}), { params: { id: "1" } })).status).toBe(401);
  });

  it("400 on malformed JSON and missing fields", async () => {
    const bad = new Request("http://test", { method: "POST", body: "{nope" });
    expect((await createWorkRoute(bad)).status).toBe(400);
    const res = await createWorkRoute(json({ ...work, title: "" }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe("title is required");
    expect((await createEventRoute(json({ date: "2026-01-01" }))).status).toBe(400);
  });

  it("409 on duplicate slug", async () => {
    expect((await createWorkRoute(json(work))).status).toBe(200);
    const res = await createWorkRoute(json(work));
    expect(res.status).toBe(409);
    expect((await res.json()).error).toMatch(/slug/);
  });

  it("validates reorder ids", async () => {
    expect((await reorderWorksRoute(json({ ids: "x" }))).status).toBe(400);
    expect((await reorderPetsRoute(json({ ids: [1, "2"] }))).status).toBe(400);
    expect((await reorderPetsRoute(json({ ids: [] }))).status).toBe(200);
  });

  it("patches flags", async () => {
    const { id } = await (await createWorkRoute(json(work))).json();
    const res = await flagsRoute(json({ show: false }), { params: { id: String(id) } });
    expect(res.status).toBe(200);
    expect((await getWorkBySlug("a"))!.show).toBe(false);
    expect(await getAllWorks()).toHaveLength(1);
  });

  it("400 on a bad id, 404 on a missing row", async () => {
    expect((await deleteWorkRoute(json({}), { params: { id: "abc" } })).status).toBe(400);
    expect((await deleteWorkRoute(json({}), { params: { id: "999" } })).status).toBe(404);
    expect((await updateWorkRoute(json(work), { params: { id: "999" } })).status).toBe(404);
    expect((await flagsRoute(json({ show: true }), { params: { id: "999" } })).status).toBe(404);
  });

  it("rejects non-array categories and lowercases tags on save", async () => {
    expect((await createWorkRoute(json({ ...work, categories: "x" }))).status).toBe(400);
    await createWorkRoute(json({ ...work, categories: [" Web ", "web", "Branding", ""] }));
    expect((await getWorkBySlug("a"))!.categories).toEqual(["web", "branding"]);
  });

  it("rejects malformed flags, reorder lists, dj-info and cv bodies", async () => {
    const { id } = await (await createWorkRoute(json(work))).json();
    const p = { params: { id: String(id) } };
    expect((await flagsRoute(json({}), p)).status).toBe(400);
    expect((await flagsRoute(json({ show: "yes" }), p)).status).toBe(400);
    expect((await reorderWorksRoute(json({ ids: [] }))).status).toBe(409);
    expect((await djInfoRoute(json({ summary: "x" }))).status).toBe(400);
    expect((await cvRoute(json({ personalInfo: {} }))).status).toBe(400);
  });

  it("400 (not 500) for non-object JSON bodies", async () => {
    expect((await createWorkRoute(json(null))).status).toBe(400);
    expect((await createWorkRoute(json([1]))).status).toBe(400);
    expect((await flagsRoute(json(null), { params: { id: "1" } })).status).toBe(400);
    expect((await djInfoRoute(json({ summary: "x", bookingEmail: "e", technicalRider: [null] }))).status).toBe(400);
  });

  it("logout clears the cookie even without a valid session", async () => {
    session.valid = false;
    const res = await logoutRoute();
    expect(res.status).toBe(200);
    expect(res.headers.get("set-cookie")).toMatch(/admin_session=;/);
  });
});
