import { redirect } from "next/navigation";
import { getAllWorks } from "@/lib/repositories/works";
import { hasValidSession } from "@/lib/auth";
import WorksBrowser from "@/components/admin/WorksBrowser";

export const dynamic = "force-dynamic";

export default async function WorksListPage() {
  if (!(await hasValidSession())) redirect("/admin/login");
  return <WorksBrowser works={await getAllWorks()} />;
}
