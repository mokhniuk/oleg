import type Database from "better-sqlite3";
import { getDb } from "../db";
import type { WorksType, CaseStudy } from "../types";

type Row = {
  id: number;
  slug: string;
  title: string;
  description: string;
  synopsis: string | null;
  bg_color: string;
  categories: string;
  link: string | null;
  link2: string | null;
  show: number;
  featured: number;
  in_progress: number;
  sort_order: number;
  case_study: string | null;
};

function toWork(row: Row): WorksType {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    synopsis: row.synopsis ?? undefined,
    bgColor: row.bg_color,
    categories: JSON.parse(row.categories) as string[],
    link: row.link ? JSON.parse(row.link) : undefined,
    link2: row.link2 ? JSON.parse(row.link2) : undefined,
    show: row.show === 1,
    featured: row.featured === 1,
    inProgress: row.in_progress === 1,
    sortOrder: row.sort_order,
    caseStudy: row.case_study ? (JSON.parse(row.case_study) as CaseStudy) : undefined,
  };
}

function bindParams(input: WorksType) {
  return {
    slug: input.slug ?? "",
    title: input.title,
    description: input.description ?? "",
    synopsis: input.synopsis ?? null,
    bg_color: input.bgColor ?? "#ffffff",
    categories: JSON.stringify(input.categories ?? []),
    link: input.link ? JSON.stringify(input.link) : null,
    link2: input.link2 ? JSON.stringify(input.link2) : null,
    show: input.show ? 1 : 0,
    featured: input.featured ? 1 : 0,
    in_progress: input.inProgress ? 1 : 0,
    case_study: input.caseStudy ? JSON.stringify(input.caseStudy) : null,
  };
}

export function getAllWorks(db: Database.Database = getDb()): WorksType[] {
  return (db.prepare("SELECT * FROM works ORDER BY sort_order, id").all() as Row[]).map(toWork);
}

export function getFeaturedWorks(db: Database.Database = getDb()): WorksType[] {
  return (
    db
      .prepare("SELECT * FROM works WHERE show = 1 AND featured = 1 ORDER BY sort_order, id")
      .all() as Row[]
  ).map(toWork);
}

export function getWorkBySlug(slug: string, db: Database.Database = getDb()): WorksType | null {
  const row = db.prepare("SELECT * FROM works WHERE slug = ?").get(slug) as Row | undefined;
  return row ? toWork(row) : null;
}

export function getAllWorkSlugs(db: Database.Database = getDb()): string[] {
  return (
    db.prepare("SELECT slug FROM works WHERE show = 1 ORDER BY sort_order, id").all() as {
      slug: string;
    }[]
  ).map((r) => r.slug);
}

export function createWork(input: WorksType, db: Database.Database = getDb()): number {
  const nextOrder =
    (db.prepare("SELECT COALESCE(MAX(sort_order), -1) AS m FROM works").get() as { m: number }).m + 1;
  const info = db
    .prepare(
      `INSERT INTO works
       (slug, title, description, synopsis, bg_color, categories, link, link2, show, featured, in_progress, sort_order, case_study)
       VALUES (@slug, @title, @description, @synopsis, @bg_color, @categories, @link, @link2, @show, @featured, @in_progress, @sort_order, @case_study)`
    )
    .run({ ...bindParams(input), sort_order: input.sortOrder ?? nextOrder });
  return Number(info.lastInsertRowid);
}

export function updateWork(id: number, input: WorksType, db: Database.Database = getDb()): void {
  db.prepare(
    `UPDATE works SET
       slug=@slug, title=@title, description=@description, synopsis=@synopsis,
       bg_color=@bg_color, categories=@categories, link=@link, link2=@link2,
       show=@show, featured=@featured, in_progress=@in_progress, case_study=@case_study
     WHERE id=@id`
  ).run({ ...bindParams(input), id });
}

export function deleteWork(id: number, db: Database.Database = getDb()): void {
  db.prepare("DELETE FROM works WHERE id = ?").run(id);
}

export function reorderWorks(ids: number[], db: Database.Database = getDb()): void {
  const stmt = db.prepare("UPDATE works SET sort_order = ? WHERE id = ?");
  const tx = db.transaction((list: number[]) => {
    list.forEach((id, i) => stmt.run(i, id));
  });
  tx(ids);
}
