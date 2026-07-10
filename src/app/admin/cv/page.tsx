import { getCv } from "@/lib/repositories/cv";
import CvEditor from "@/components/admin/CvEditor";

export const dynamic = "force-dynamic";

export default function CvAdminPage() {
  const cv = getCv();
  if (!cv) return <p>No CV yet — run the seed.</p>;
  return <CvEditor initial={cv} />;
}
