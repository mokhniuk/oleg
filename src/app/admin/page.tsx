import Link from "next/link";
import { redirect } from "next/navigation";
import { getAllWorks } from "@/lib/repositories/works";
import { getAllPetProjects } from "@/lib/repositories/petProjects";
import { getAllDjEvents } from "@/lib/repositories/djEvents";
import { hasValidSession } from "@/lib/auth";
import styles from "@/components/admin/admin.module.scss";

export const dynamic = "force-dynamic";

export default function AdminDashboard() {
  if (!hasValidSession()) redirect("/admin/login");
  const works = getAllWorks();
  const pets = getAllPetProjects();
  const events = getAllDjEvents();
  return (
    <div className={styles.list}>
      <h1>Dashboard</h1>
      <div className={styles.item}><span>Works</span><Link href="/admin/works">{works.length} →</Link></div>
      <div className={styles.item}><span>Pet projects</span><Link href="/admin/pet-projects">{pets.length} →</Link></div>
      <div className={styles.item}><span>DJ events</span><Link href="/admin/dj">{events.length} →</Link></div>
      <div className={styles.item}><span>CV</span><Link href="/admin/cv">Edit →</Link></div>
    </div>
  );
}
