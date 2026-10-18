import { rows, run, reorderRows } from "../db";
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

export function normalizeCategories(categories: unknown): string[] {
  if (!Array.isArray(categories)) return [];
  const tags = categories.filter((c): c is string => typeof c === "string").map((c) => c.trim().toLowerCase());
  return Array.from(new Set(tags.filter(Boolean)));
}

function bindParams(input: WorksType) {
  return {
    slug: input.slug ?? "",
    title: input.title,
    description: input.description ?? "",
    synopsis: input.synopsis ?? null,
    bg_color: input.bgColor ?? "#ffffff",
    categories: JSON.stringify(normalizeCategories(input.categories)),
    link: input.link ? JSON.stringify(input.link) : null,
    link2: input.link2 ? JSON.stringify(input.link2) : null,
    show: input.show ? 1 : 0,
    featured: input.featured ? 1 : 0,
    in_progress: input.inProgress ? 1 : 0,
    case_study: input.caseStudy ? JSON.stringify(input.caseStudy) : null,
  };
}

export async function getAllWorks(): Promise<WorksType[]> {
  return (await rows<Row>("SELECT * FROM works ORDER BY sort_order, id")).map(toWork);
}

export async function getFeaturedWorks(): Promise<WorksType[]> {
  return (
    await rows<Row>("SELECT * FROM works WHERE `show` = 1 AND featured = 1 ORDER BY sort_order, id")
  ).map(toWork);
}

export async function getWorkBySlug(slug: string): Promise<WorksType | null> {
  const r = await rows<Row>("SELECT * FROM works WHERE slug = :slug", { slug });
  return r.length ? toWork(r[0]) : null;
}

/** Public lookup: hidden works (`show = 0`) are treated as not existing. */
export async function getPublicWorkBySlug(slug: string): Promise<WorksType | null> {
  const r = await rows<Row>("SELECT * FROM works WHERE slug = :slug AND `show` = 1", { slug });
  return r.length ? toWork(r[0]) : null;
}

export async function getAllWorkSlugs(): Promise<string[]> {
  return (
    await rows<{ slug: string }>("SELECT slug FROM works WHERE `show` = 1 ORDER BY sort_order, id")
  ).map((r) => r.slug);
}

export async function createWork(input: WorksType): Promise<number> {
  const [{ n }] = await rows<{ n: number }>("SELECT COALESCE(MAX(sort_order), -1) + 1 AS n FROM works");
  const res = await run(
    "INSERT INTO works (slug, title, description, synopsis, bg_color, categories, link, link2, `show`, featured, in_progress, sort_order, case_study) VALUES (:slug, :title, :description, :synopsis, :bg_color, :categories, :link, :link2, :show, :featured, :in_progress, :sort_order, :case_study)",
    { ...bindParams(input), sort_order: input.sortOrder ?? n },
  );
  return res.insertId;
}

export async function updateWork(id: number, input: WorksType): Promise<boolean> {
  const res = await run(
    "UPDATE works SET slug=:slug, title=:title, description=:description, synopsis=:synopsis, bg_color=:bg_color, categories=:categories, link=:link, link2=:link2, `show`=:show, featured=:featured, in_progress=:in_progress, case_study=:case_study WHERE id=:id",
    { ...bindParams(input), id },
  );
  return res.affectedRows > 0;
}

export type WorkFlags = { show?: boolean; featured?: boolean; inProgress?: boolean };

export async function setWorkFlags(id: number, flags: WorkFlags): Promise<boolean> {
  const cols: Record<string, string> = { show: "`show`", featured: "featured", inProgress: "in_progress" };
  const sets = (Object.keys(cols) as (keyof WorkFlags)[]).filter((k) => typeof flags[k] === "boolean");
  if (!sets.length) return true;
  const params: Record<string, number> = { id };
  for (const k of sets) params[k] = flags[k] ? 1 : 0;
  return (await run(`UPDATE works SET ${sets.map((k) => `${cols[k]} = :${k}`).join(", ")} WHERE id = :id`, params)).affectedRows > 0;
}

export async function deleteWork(id: number): Promise<boolean> {
  return (await run("DELETE FROM works WHERE id = :id", { id })).affectedRows > 0;
}

export async function reorderWorks(ids: number[]): Promise<boolean> {
  return reorderRows("works", ids);
}
