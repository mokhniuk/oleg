import { describe, it, expect, beforeEach } from "vitest";
import Database from "better-sqlite3";
import { initSchema } from "../db";
import { getAllDjEvents, createDjEvent, updateDjEvent, deleteDjEvent } from "./djEvents";

let db: Database.Database;
beforeEach(() => {
  db = new Database(":memory:");
  initSchema(db);
});

it("round-trips events including optional link", () => {
  const id = createDjEvent({ date: "2025-03-11", venue: "Kafe Kyiv", city: "Berlin" }, db);
  createDjEvent({ date: "2025-12-21", venue: "Skrynya", city: "Berlin", link: "https://x" }, db);
  const all = getAllDjEvents(db);
  expect(all).toHaveLength(2);
  expect(all[0]).toMatchObject({ id, venue: "Kafe Kyiv" });
  expect(all[1].link).toBe("https://x");
  updateDjEvent(id, { date: "2025-03-11", venue: "Cafe Kyiv", city: "Berlin" }, db);
  expect(getAllDjEvents(db)[0].venue).toBe("Cafe Kyiv");
  deleteDjEvent(id, db);
  expect(getAllDjEvents(db)).toHaveLength(1);
});
