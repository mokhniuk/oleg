import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { hasValidSession } from "@/lib/auth";
import styles from "@/components/admin/admin.module.scss";
import AdminNav from "@/components/admin/AdminNav";
import { FeedbackProvider } from "@/components/admin/Feedback";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // middleware only checks the cookie exists; verify its signature here for every admin page
  if (!headers().get("x-admin-public") && !(await hasValidSession())) redirect("/admin/login");
  return (
    <div className={styles.shell}>
      <FeedbackProvider>
        <AdminNav />
        {children}
      </FeedbackProvider>
    </div>
  );
}
