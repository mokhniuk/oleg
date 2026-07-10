import { rows, run } from "../db";
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

export async function updateWork(id: number, input: WorksType): Promise<void> {
  await run(
    "UPDATE works SET slug=:slug, title=:title, description=:description, synopsis=:synopsis, bg_color=:bg_color, categories=:categories, link=:link, link2=:link2, `show`=:show, featured=:featured, in_progress=:in_progress, case_study=:case_study WHERE id=:id",
    { ...bindParams(input), id },
  );
}

export async function deleteWork(id: number): Promise<void> {
  await run("DELETE FROM works WHERE id = :id", { id });
}

export async function reorderWorks(ids: number[]): Promise<void> {
  for (let i = 0; i < ids.length; i++) {
    await run("UPDATE works SET sort_order = :o WHERE id = :id", { o: i, id: ids[i] });
  }
}
