import { redirect } from "next/navigation";
import { getCv } from "@/lib/repositories/cv";
import { hasValidSession } from "@/lib/auth";
import CvEditor from "@/components/admin/CvEditor";

export const dynamic = "force-dynamic";

export default function CvAdminPage() {
  if (!hasValidSession()) redirect("/admin/login");
  const cv = getCv();
  if (!cv) return <p>No CV yet — run the seed.</p>;
  return <CvEditor initial={cv} />;
}
