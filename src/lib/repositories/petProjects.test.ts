import { describe, it, expect, beforeEach } from "vitest";
import { dbAvailable, resetDb } from "./testHelpers";
import { getAllPetProjects, createPetProject, updatePetProject, deletePetProject } from "./petProjects";

const available = await dbAvailable();

describe.skipIf(!available)("pet-projects repository", () => {
  beforeEach(resetDb);

  it("round-trips a pet project", async () => {
    const id = await createPetProject({
      slug: "budget", title: "Budget", icon: "", image: "", url: "https://budget.mokhni.uk", description: "Budgeting",
    });
    const all = await getAllPetProjects();
    expect(all).toHaveLength(1);
    expect(all[0]).toMatchObject({ id, slug: "budget", title: "Budget", url: "https://budget.mokhni.uk" });
    await updatePetProject(id, { slug: "budget", title: "Budget 2", icon: "", image: "", url: "x", description: "y" });
    expect((await getAllPetProjects())[0].title).toBe("Budget 2");
    await deletePetProject(id);
    expect(await getAllPetProjects()).toHaveLength(0);
  });
});
