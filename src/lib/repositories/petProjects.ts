import { rows, run, reorderRows } from "../db";
import type { PetProject } from "../types";

type Row = {
  id: number;
  slug: string;
  title: string;
  icon: string;
  image: string;
  url: string;
  description: string;
  sort_order: number;
};

const toPet = (r: Row): PetProject => ({
  id: r.id,
  slug: r.slug,
  title: r.title,
  icon: r.icon,
  image: r.image,
  url: r.url,
  description: r.description,
  sortOrder: r.sort_order,
});

export async function getAllPetProjects(): Promise<PetProject[]> {
  return (await rows<Row>("SELECT * FROM pet_projects ORDER BY sort_order, id")).map(toPet);
}

export async function createPetProject(input: PetProject): Promise<number> {
  const [{ n }] = await rows<{ n: number }>(
    "SELECT COALESCE(MAX(sort_order), -1) + 1 AS n FROM pet_projects",
  );
  const res = await run(
    "INSERT INTO pet_projects (slug, title, icon, image, url, description, sort_order) VALUES (:slug, :title, :icon, :image, :url, :description, :sort_order)",
    {
      slug: input.slug,
      title: input.title,
      icon: input.icon ?? "",
      image: input.image ?? "",
      url: input.url ?? "",
      description: input.description ?? "",
      sort_order: input.sortOrder ?? n,
    },
  );
  return res.insertId;
}

export async function updatePetProject(id: number, input: PetProject): Promise<boolean> {
  const res = await run(
    "UPDATE pet_projects SET slug=:slug, title=:title, icon=:icon, image=:image, url=:url, description=:description WHERE id=:id",
    {
      id,
      slug: input.slug,
      title: input.title,
      icon: input.icon ?? "",
      image: input.image ?? "",
      url: input.url ?? "",
      description: input.description ?? "",
    },
  );
  return res.affectedRows > 0;
}

export async function deletePetProject(id: number): Promise<boolean> {
  return (await run("DELETE FROM pet_projects WHERE id = :id", { id })).affectedRows > 0;
}

export async function reorderPetProjects(ids: number[]): Promise<boolean> {
  return reorderRows("pet_projects", ids);
}
