import { redirect } from "next/navigation";
import { getDjInfo } from "@/lib/repositories/djInfo";
import { getAllDjEvents } from "@/lib/repositories/djEvents";
import { hasValidSession } from "@/lib/auth";
import DjManager from "@/components/admin/DjManager";

export const dynamic = "force-dynamic";

export default function DjAdminPage() {
  if (!hasValidSession()) redirect("/admin/login");
  const info = getDjInfo() ?? { summary: "", technicalRider: [], bookingEmail: "", photos: [], partners: [] };
  return <DjManager info={info} events={getAllDjEvents()} />;
}
