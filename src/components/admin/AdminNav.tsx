"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "@/components/admin/admin.module.scss";
import LogoutButton from "@/components/admin/LogoutButton";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";

/**
 * Admin navigation bar. Hidden on the login page, where there is no
 * session and nothing to navigate to yet.
 */
const LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/works", label: "Works" },
  { href: "/admin/pet-projects", label: "Pet projects" },
  { href: "/admin/dj", label: "DJ" },
  { href: "/admin/cv", label: "CV" },
];

export default function AdminNav() {
  const pathname = usePathname();
  if (pathname === "/admin/login") return null;

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <header className={styles.head}>
      <span className={styles.logo}>Oleg Mokhniuk</span>
      <nav className={styles.topnav}>
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} className={isActive(l.href) ? styles.active : undefined}>
            {l.label}
          </Link>
        ))}
      </nav>
      <span className={styles.headRight}>
        <a href="/" target="_blank" rel="noreferrer" className={styles.viewSite}>View site <ArrowTopRightOnSquareIcon aria-hidden /></a>
        <LogoutButton />
      </span>
    </header>
  );
}
