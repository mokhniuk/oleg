import { getDjInfo } from "@/lib/repositories/djInfo";
import { getAllDjEvents } from "@/lib/repositories/djEvents";
import DjManager from "@/components/admin/DjManager";

export const dynamic = "force-dynamic";

export default function DjAdminPage() {
  const info = getDjInfo() ?? { summary: "", technicalRider: [], bookingEmail: "", photos: [], partners: [] };
  return <DjManager info={info} events={getAllDjEvents()} />;
}
