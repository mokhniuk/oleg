import { describe, it, expect } from "vitest";
import { getPool, initSchema } from "./db";
import { dbAvailable } from "./repositories/testHelpers";

const available = await dbAvailable();

describe.skipIf(!available)("initSchema", () => {
  it("creates all content tables", async () => {
    await initSchema();
    const [rows] = await getPool().query("SHOW TABLES");
    const names = (rows as Record<string, string>[]).map((r) => Object.values(r)[0]);
    for (const t of ["works", "pet_projects", "dj_events", "dj_info", "cv", "settings"]) {
      expect(names).toContain(t);
    }
  });

  it("is idempotent", async () => {
    await initSchema();
    await expect(initSchema()).resolves.not.toThrow();
  });
});
