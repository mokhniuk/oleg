import { describe, it, expect, beforeEach } from "vitest";
import { dbAvailable, resetDb } from "./testHelpers";
import { getDjInfo, saveDjInfo } from "./djInfo";
import { getCv, saveCv } from "./cv";
import type { DjInfo, CvContent } from "../types";

const available = await dbAvailable();

describe.skipIf(!available)("singleton repositories", () => {
  beforeEach(resetDb);

  it("stores and replaces DJ info", async () => {
    expect(await getDjInfo()).toBeNull();
    const info: DjInfo = {
      summary: "Vinyl only",
      technicalRider: [{ name: "Turntables", description: "2x", image: "/t.webp" }],
      bookingEmail: "a@b.c",
      photos: ["/1.jpg"],
      partners: ["SKRYNYA"],
    };
    await saveDjInfo(info);
    expect(await getDjInfo()).toEqual(info);
    await saveDjInfo({ ...info, summary: "Changed" });
    expect((await getDjInfo())!.summary).toBe("Changed");
  });

  it("stores and replaces CV", async () => {
    expect(await getCv()).toBeNull();
    const cv = {
      topSkills: ["A"], personalInfo: { name: "O", title: "T", website: "w", email: "e" },
      summary: "s", experience: [], stack: {}, languages: [], education: [],
    } as CvContent;
    await saveCv(cv);
    expect(await getCv()).toEqual(cv);
    await saveCv({ ...cv, summary: "new" });
    expect((await getCv())!.summary).toBe("new");
  });
});
