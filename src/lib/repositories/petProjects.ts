import type Database from "better-sqlite3";
import { getDb } from "../db";
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

export function getAllPetProjects(db: Database.Database = getDb()): PetProject[] {
  return (db.prepare("SELECT * FROM pet_projects ORDER BY sort_order, id").all() as Row[]).map(toPet);
}

export function createPetProject(input: PetProject, db: Database.Database = getDb()): number {
  const nextOrder =
    (db.prepare("SELECT COALESCE(MAX(sort_order), -1) AS m FROM pet_projects").get() as { m: number })
      .m + 1;
  const info = db
    .prepare(
      `INSERT INTO pet_projects (slug, title, icon, image, url, description, sort_order)
       VALUES (@slug, @title, @icon, @image, @url, @description, @sort_order)`
    )
    .run({
      slug: input.slug,
      title: input.title,
      icon: input.icon ?? "",
      image: input.image ?? "",
      url: input.url ?? "",
      description: input.description ?? "",
      sort_order: input.sortOrder ?? nextOrder,
    });
  return Number(info.lastInsertRowid);
}

export function updatePetProject(id: number, input: PetProject, db: Database.Database = getDb()): void {
  db.prepare(
    `UPDATE pet_projects SET slug=@slug, title=@title, icon=@icon, image=@image, url=@url, description=@description WHERE id=@id`
  ).run({
    id,
    slug: input.slug,
    title: input.title,
    icon: input.icon ?? "",
    image: input.image ?? "",
    url: input.url ?? "",
    description: input.description ?? "",
  });
}

export function deletePetProject(id: number, db: Database.Database = getDb()): void {
  db.prepare("DELETE FROM pet_projects WHERE id = ?").run(id);
}

export function reorderPetProjects(ids: number[], db: Database.Database = getDb()): void {
  const stmt = db.prepare("UPDATE pet_projects SET sort_order = ? WHERE id = ?");
  const tx = db.transaction((list: number[]) => list.forEach((id, i) => stmt.run(i, id)));
  tx(ids);
}
