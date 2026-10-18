import { notFound, redirect } from "next/navigation";
import { getAllPetProjects } from "@/lib/repositories/petProjects";
import { hasValidSession } from "@/lib/auth";
import PetProjectForm from "@/components/admin/PetProjectForm";

export const dynamic = "force-dynamic";

export default async function PetProjectEditPage({ params }: { params: { id: string } }) {
  if (!(await hasValidSession())) redirect("/admin/login");
  if (params.id === "new") return <PetProjectForm key="new" />;
  const project = (await getAllPetProjects()).find((p) => p.id === Number(params.id));
  if (!project) notFound();
  return <PetProjectForm key={project.id} initial={project} />;
}
