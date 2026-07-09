import { describe, it, expect, beforeEach } from "vitest";
import Database from "better-sqlite3";
import { initSchema } from "../db";
import { getDjInfo, saveDjInfo } from "./djInfo";
import { getCv, saveCv } from "./cv";
import type { DjInfo, CvContent } from "../types";

let db: Database.Database;
beforeEach(() => {
  db = new Database(":memory:");
  initSchema(db);
});

it("stores and replaces DJ info", () => {
  expect(getDjInfo(db)).toBeNull();
  const info: DjInfo = {
    summary: "Vinyl only",
    technicalRider: [{ name: "Turntables", description: "2x", image: "/t.webp" }],
    bookingEmail: "a@b.c",
    photos: ["/1.jpg"],
    partners: ["SKRYNYA"],
  };
  saveDjInfo(info, db);
  expect(getDjInfo(db)).toEqual(info);
  saveDjInfo({ ...info, summary: "Changed" }, db);
  expect(getDjInfo(db)!.summary).toBe("Changed");
});

it("stores and replaces CV", () => {
  expect(getCv(db)).toBeNull();
  const cv = { topSkills: ["A"], personalInfo: { name: "O", title: "T", website: "w", email: "e" }, summary: "s", experience: [], stack: {}, languages: [], education: [] } as CvContent;
  saveCv(cv, db);
  expect(getCv(db)).toEqual(cv);
  saveCv({ ...cv, summary: "new" }, db);
  expect(getCv(db)!.summary).toBe("new");
});
