import { describe, it, expect, beforeEach } from "vitest";
import Database from "better-sqlite3";
import { initSchema } from "../db";
import {
  createWork,
  getAllWorks,
  getWorkBySlug,
  getFeaturedWorks,
  getAllWorkSlugs,
  updateWork,
  deleteWork,
  reorderWorks,
} from "./works";
import type { WorksType } from "../types";

let db: Database.Database;
beforeEach(() => {
  db = new Database(":memory:");
  initSchema(db);
});

const sample: WorksType = {
  slug: "bagel-bro",
  title: "Bagel Bro",
  description: "A bagel shop site",
  bgColor: "#feeadd",
  categories: ["web", "design"],
  link: { url: "https://bagelbro.de", label: "bagelbro.de" },
  show: true,
  featured: true,
  inProgress: true,
  caseStudy: {
    coverImage: "cover.webp",
    colors: { primary: "#E7650D", contrast: "#1F6686", faded: "#fafafa" },
    blocks: [{ type: "section", title: "Overview", content: "Hello" }],
  },
};

describe("works repository", () => {
  it("round-trips a work with nested case study", () => {
    const id = createWork(sample, db);
    const got = getWorkBySlug("bagel-bro", db)!;
    expect(got.id).toBe(id);
    expect(got.title).toBe("Bagel Bro");
    expect(got.show).toBe(true);
    expect(got.featured).toBe(true);
    expect(got.categories).toEqual(["web", "design"]);
    expect(got.link).toEqual({ url: "https://bagelbro.de", label: "bagelbro.de" });
    expect(got.caseStudy?.colors?.primary).toBe("#E7650D");
    expect(got.caseStudy?.blocks?.[0]).toMatchObject({ type: "section", content: "Hello" });
  });

  it("filters featured and lists slugs", () => {
    createWork(sample, db);
    createWork({ ...sample, slug: "hidden", featured: false, show: false }, db);
    expect(getFeaturedWorks(db).map((w) => w.slug)).toEqual(["bagel-bro"]);
    expect(getAllWorkSlugs(db)).toEqual(["bagel-bro"]);
    expect(getAllWorks(db)).toHaveLength(2);
  });

  it("updates and deletes", () => {
    const id = createWork(sample, db);
    updateWork(id, { ...sample, title: "Renamed" }, db);
    expect(getWorkBySlug("bagel-bro", db)!.title).toBe("Renamed");
    deleteWork(id, db);
    expect(getWorkBySlug("bagel-bro", db)).toBeNull();
  });

  it("reorders by index", () => {
    const a = createWork({ ...sample, slug: "a" }, db);
    const b = createWork({ ...sample, slug: "b" }, db);
    reorderWorks([b, a], db);
    expect(getAllWorks(db).map((w) => w.slug)).toEqual(["b", "a"]);
  });
});
