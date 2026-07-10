import { redirect } from "next/navigation";
import { getCv } from "@/lib/repositories/cv";
import { hasValidSession } from "@/lib/auth";
import CvEditor from "@/components/admin/CvEditor";

export const dynamic = "force-dynamic";

export default async function CvAdminPage() {
  if (!(await hasValidSession())) redirect("/admin/login");
  const cv = await getCv();
  if (!cv) return <p>No CV yet — run the seed.</p>;
  return <CvEditor initial={cv} />;
}
