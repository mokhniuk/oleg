import { describe, it, expect } from "vitest";
import Database from "better-sqlite3";
import { initSchema } from "./db";

describe("initSchema", () => {
  it("creates all content tables", () => {
    const db = new Database(":memory:");
    initSchema(db);
    const tables = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table'")
      .all()
      .map((r: any) => r.name);
    for (const t of [
      "works",
      "pet_projects",
      "dj_events",
      "dj_info",
      "cv",
      "settings",
    ]) {
      expect(tables).toContain(t);
    }
  });

  it("is idempotent", () => {
    const db = new Database(":memory:");
    initSchema(db);
    expect(() => initSchema(db)).not.toThrow();
  });
});
