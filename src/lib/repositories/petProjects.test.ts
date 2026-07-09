import { describe, it, expect, beforeEach } from "vitest";
import Database from "better-sqlite3";
import { initSchema } from "../db";
import {
  getAllPetProjects,
  createPetProject,
  updatePetProject,
  deletePetProject,
} from "./petProjects";

let db: Database.Database;
beforeEach(() => {
  db = new Database(":memory:");
  initSchema(db);
});

it("round-trips a pet project", () => {
  const id = createPetProject(
    { slug: "budget", title: "Budget", icon: "", image: "", url: "https://budget.mokhni.uk", description: "Budgeting" },
    db
  );
  const all = getAllPetProjects(db);
  expect(all).toHaveLength(1);
  expect(all[0]).toMatchObject({ id, slug: "budget", title: "Budget", url: "https://budget.mokhni.uk" });
  updatePetProject(id, { slug: "budget", title: "Budget 2", icon: "", image: "", url: "x", description: "y" }, db);
  expect(getAllPetProjects(db)[0].title).toBe("Budget 2");
  deletePetProject(id, db);
  expect(getAllPetProjects(db)).toHaveLength(0);
});
