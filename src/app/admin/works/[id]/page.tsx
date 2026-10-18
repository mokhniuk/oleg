import { notFound, redirect } from "next/navigation";
import { getAllWorks } from "@/lib/repositories/works";
import { hasValidSession } from "@/lib/auth";
import WorkForm from "@/components/admin/WorkForm";

export const dynamic = "force-dynamic";

export default async function WorkEditPage({ params }: { params: { id: string } }) {
  if (!(await hasValidSession())) redirect("/admin/login");
  const works = await getAllWorks();
  const categories = Array.from(new Set(works.flatMap((w) => w.categories.map((c) => c.toLowerCase())))).sort();
  if (params.id === "new") return <WorkForm key="new" categorySuggestions={categories} />;
  const work = works.find((w) => w.id === Number(params.id));
  if (!work) notFound();
  return <WorkForm key={work.id} initial={work} categorySuggestions={categories} />;
}
