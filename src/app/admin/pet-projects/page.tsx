import { getAllPetProjects } from "@/lib/repositories/petProjects";
import PetProjectsManager from "@/components/admin/PetProjectsManager";

export const dynamic = "force-dynamic";

export default function PetProjectsAdminPage() {
  return <PetProjectsManager initial={getAllPetProjects()} />;
}
