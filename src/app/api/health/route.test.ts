import { describe, it, expect, vi } from "vitest";

const db = vi.hoisted(() => ({ fail: false }));
vi.mock("@/lib/db", () => ({
  rows: async () => {
    if (db.fail) throw new Error("connection refused");
    return [{ 1: 1 }];
  },
}));

import { GET } from "./route";

describe("health route", () => {
  it("200 {ok:true} when the database answers", async () => {
    db.fail = false;
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  it("503 {ok:false} when the database fails", async () => {
    db.fail = true;
    const res = await GET();
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ ok: false });
  });
});
