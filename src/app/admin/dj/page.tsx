import { redirect } from "next/navigation";
import { getDjInfo } from "@/lib/repositories/djInfo";
import { getAllDjEvents } from "@/lib/repositories/djEvents";
import { hasValidSession } from "@/lib/auth";
import DjManager from "@/components/admin/DjManager";

export const dynamic = "force-dynamic";

export default async function DjAdminPage() {
  if (!(await hasValidSession())) redirect("/admin/login");
  const info = (await getDjInfo()) ?? { summary: "", technicalRider: [], bookingEmail: "", photos: [], partners: [] };
  return <DjManager info={info} events={await getAllDjEvents()} />;
}
