import { notFound } from "next/navigation";
import { getAllWorks } from "@/lib/repositories/works";
import WorkForm from "@/components/admin/WorkForm";

export const dynamic = "force-dynamic";

export default function WorkEditPage({ params }: { params: { id: string } }) {
  if (params.id === "new") return <WorkForm />;
  const work = getAllWorks().find((w) => w.id === Number(params.id));
  if (!work) notFound();
  return <WorkForm initial={work} />;
}
