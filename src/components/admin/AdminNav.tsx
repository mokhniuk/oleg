"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "@/components/admin/admin.module.scss";
import LogoutButton from "@/components/admin/LogoutButton";

/**
 * Admin navigation bar. Hidden on the login page, where there is no
 * session and nothing to navigate to yet.
 */
export default function AdminNav() {
  const pathname = usePathname();
  if (pathname === "/admin/login") return null;

  return (
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
  );
}
