import styles from "@/components/admin/admin.module.scss";
import AdminNav from "@/components/admin/AdminNav";

export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.wrap}>
      <AdminNav />
      {children}
    </div>
  );
}
