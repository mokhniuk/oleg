import { redirect } from "next/navigation";
import { getAllPetProjects } from "@/lib/repositories/petProjects";
import { hasValidSession } from "@/lib/auth";
import PetProjectsManager from "@/components/admin/PetProjectsManager";

export const dynamic = "force-dynamic";

export default function PetProjectsAdminPage() {
  if (!hasValidSession()) redirect("/admin/login");
  return <PetProjectsManager initial={getAllPetProjects()} />;
}
