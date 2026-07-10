import { notFound, redirect } from "next/navigation";
import { getAllWorks } from "@/lib/repositories/works";
import { hasValidSession } from "@/lib/auth";
import WorkForm from "@/components/admin/WorkForm";

export const dynamic = "force-dynamic";

export default async function WorkEditPage({ params }: { params: { id: string } }) {
  if (!(await hasValidSession())) redirect("/admin/login");
  if (params.id === "new") return <WorkForm />;
  const work = (await getAllWorks()).find((w) => w.id === Number(params.id));
  if (!work) notFound();
  return <WorkForm initial={work} />;
}
