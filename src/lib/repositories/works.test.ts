import { describe, it, expect, beforeEach } from "vitest";
import { dbAvailable, resetDb } from "./testHelpers";
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

const available = await dbAvailable();

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

describe.skipIf(!available)("works repository", () => {
  beforeEach(resetDb);

  it("round-trips a work with nested case study", async () => {
    const id = await createWork(sample);
    const got = (await getWorkBySlug("bagel-bro"))!;
    expect(got.id).toBe(id);
    expect(got.title).toBe("Bagel Bro");
    expect(got.show).toBe(true);
    expect(got.featured).toBe(true);
    expect(got.categories).toEqual(["web", "design"]);
    expect(got.link).toEqual({ url: "https://bagelbro.de", label: "bagelbro.de" });
    expect(got.caseStudy?.colors?.primary).toBe("#E7650D");
    expect(got.caseStudy?.blocks?.[0]).toMatchObject({ type: "section", content: "Hello" });
  });

  it("filters featured and lists slugs", async () => {
    await createWork(sample);
    await createWork({ ...sample, slug: "hidden", featured: false, show: false });
    expect((await getFeaturedWorks()).map((w) => w.slug)).toEqual(["bagel-bro"]);
    expect(await getAllWorkSlugs()).toEqual(["bagel-bro"]);
    expect(await getAllWorks()).toHaveLength(2);
  });

  it("updates and deletes", async () => {
    const id = await createWork(sample);
    await updateWork(id, { ...sample, title: "Renamed" });
    expect((await getWorkBySlug("bagel-bro"))!.title).toBe("Renamed");
    await deleteWork(id);
    expect(await getWorkBySlug("bagel-bro")).toBeNull();
  });

  it("reorders by index", async () => {
    const a = await createWork({ ...sample, slug: "a" });
    const b = await createWork({ ...sample, slug: "b" });
    await reorderWorks([b, a]);
    expect((await getAllWorks()).map((w) => w.slug)).toEqual(["b", "a"]);
  });
});
