import Link from "next/link";
import { redirect } from "next/navigation";
import { getAllWorks } from "@/lib/repositories/works";
import { getAllPetProjects } from "@/lib/repositories/petProjects";
import { getAllDjEvents } from "@/lib/repositories/djEvents";
import { hasValidSession } from "@/lib/auth";
import { isDarkColor } from "@/lib/color";
import styles from "@/components/admin/admin.module.scss";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  if (!(await hasValidSession())) redirect("/admin/login");
  const works = await getAllWorks();
  const pets = await getAllPetProjects();
  const events = await getAllDjEvents();
  const shown = works.filter((w) => w.show).length;
  const recent = works.slice(0, 4);

  return (
    <div className={styles.wrap}>
      <div className={styles.pagehead}>
        <div className={styles.pageheadInner}>
          <div>
            <h1>Dashboard</h1>
            <p className={styles.sub}>Everything on mokhniuk.online</p>
          </div>
          <div className={styles.actions}>
            <Link className={styles.button} href="/admin/works/new">+ New work</Link>
          </div>
        </div>
      </div>

      <div className={styles.tiles}>
        <Link href="/admin/works" className={`${styles.tile} ${styles.tileA}`}>
          <span className={styles.tileKey}>Works</span>
          <span className={styles.tileVal}>{works.length}</span>
          <span className={styles.tileMeta}>{shown} shown · {works.length - shown} hidden</span>
        </Link>
        <Link href="/admin/pet-projects" className={`${styles.tile} ${styles.tileB}`}>
          <span className={styles.tileKey}>Pet projects</span>
          <span className={styles.tileVal}>{pets.length}</span>
          <span className={styles.tileMeta}>Hidden publicly</span>
        </Link>
        <Link href="/admin/dj" className={`${styles.tile} ${styles.tileC}`}>
          <span className={styles.tileKey}>DJ events</span>
          <span className={styles.tileVal}>{events.length}</span>
          <span className={styles.tileMeta}>Bookings &amp; rider</span>
        </Link>
        <Link href="/admin/cv" className={`${styles.tile} ${styles.tileD}`}>
          <span className={styles.tileKey}>CV</span>
          <span className={styles.tileVal} style={{ fontSize: 30 }}>Edit</span>
          <span className={styles.tileMeta}>Experience &amp; skills</span>
        </Link>
      </div>

      <div className={styles.seclbl}>
        <h2>Recent works</h2>
        <Link href="/admin/works" className={styles.more}>All works <ArrowRightIcon aria-hidden /></Link>
      </div>
      <div className={styles.works}>
        {recent.map((w) => (
          <Link key={w.id} href={`/admin/works/${w.id}`} className={`${styles.wcard} ${isDarkColor(w.bgColor) ? styles.onDark : ""}`} style={{ background: w.bgColor }}>
            <span className={styles.wtitle}>{w.title}</span>
            {w.description && <span className={styles.wdesc}>{w.description}</span>}
            <span className={styles.wfoot}>
              <span className={`${styles.wbubble} ${w.featured ? styles.feat : w.show ? "" : styles.hid}`}>
                {w.show && <span className={styles.dot} />}
                {w.featured ? "Featured" : w.show ? "Shown" : "Hidden"}
              </span>
              <span className={styles.wcats}>{w.categories.join(" · ")}</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
