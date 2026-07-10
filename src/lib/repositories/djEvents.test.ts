import { describe, it, expect, beforeEach } from "vitest";
import { dbAvailable, resetDb } from "./testHelpers";
import { getAllDjEvents, createDjEvent, updateDjEvent, deleteDjEvent } from "./djEvents";

const available = await dbAvailable();

describe.skipIf(!available)("dj-events repository", () => {
  beforeEach(resetDb);

  it("round-trips events including optional link", async () => {
    const id = await createDjEvent({ date: "2025-03-11", venue: "Kafe Kyiv", city: "Berlin" });
    await createDjEvent({ date: "2025-12-21", venue: "Skrynya", city: "Berlin", link: "https://x" });
    const all = await getAllDjEvents();
    expect(all).toHaveLength(2);
    expect(all[0]).toMatchObject({ id, venue: "Kafe Kyiv" });
    expect(all[0].link).toBeUndefined();
    expect(all[1].link).toBe("https://x");
    await updateDjEvent(id, { date: "2025-03-11", venue: "Cafe Kyiv", city: "Berlin" });
    expect((await getAllDjEvents())[0].venue).toBe("Cafe Kyiv");
    await deleteDjEvent(id);
    expect(await getAllDjEvents()).toHaveLength(1);
  });
});
