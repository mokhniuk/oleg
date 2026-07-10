import Link from "next/link";
import styles from "@/components/admin/admin.module.scss";
import LogoutButton from "@/components/admin/LogoutButton";

export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.wrap}>
      <nav className={styles.nav}>
        <Link href="/admin">Dashboard</Link>
        <Link href="/admin/works">Works</Link>
        <Link href="/admin/pet-projects">Pet projects</Link>
        <Link href="/admin/dj">DJ</Link>
        <Link href="/admin/cv">CV</Link>
        <span style={{ marginLeft: "auto" }}>
          <LogoutButton />
        </span>
      </nav>
      {children}
    </div>
  );
}
