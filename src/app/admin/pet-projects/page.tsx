import { redirect } from "next/navigation";
import { getAllPetProjects } from "@/lib/repositories/petProjects";
import { hasValidSession } from "@/lib/auth";
import PetProjectsBrowser from "@/components/admin/PetProjectsBrowser";

export const dynamic = "force-dynamic";

export default async function PetProjectsAdminPage() {
  if (!(await hasValidSession())) redirect("/admin/login");
  return <PetProjectsBrowser projects={await getAllPetProjects()} />;
}
