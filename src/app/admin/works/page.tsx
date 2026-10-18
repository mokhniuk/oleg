import Link from "next/link";
import { redirect } from "next/navigation";
import { getAllWorks } from "@/lib/repositories/works";
import { hasValidSession } from "@/lib/auth";
import { isDarkColor } from "@/lib/color";
import styles from "@/components/admin/admin.module.scss";
import WorksListActions from "@/components/admin/WorksListActions";

export const dynamic = "force-dynamic";

export default async function WorksListPage() {
  if (!(await hasValidSession())) redirect("/admin/login");
  const works = await getAllWorks();

  return (
    <div className={styles.wrap}>
      <div className={styles.pagehead}>
        <div className={styles.pageheadInner}>
          <div>
            <h1>Works</h1>
            <p className={styles.sub}>{works.length} projects</p>
          </div>
          <div className={styles.actions}>
            <Link className={styles.button} href="/admin/works/new">+ New work</Link>
          </div>
        </div>
      </div>

      <div className={styles.works}>
        {works.map((w) => (
          <div key={w.id} className={`${styles.wcard} ${isDarkColor(w.bgColor) ? styles.onDark : ""}`} style={{ background: w.bgColor }}>
            <span className={styles.wacts}>
              <Link href={`/admin/works/${w.id}`} aria-label="Edit work">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                </svg>
              </Link>
              <WorksListActions id={w.id!} ids={works.map((x) => x.id!)} show={w.show} featured={!!w.featured} />
            </span>
            <Link href={`/admin/works/${w.id}`} className={styles.wtitle} style={{ textDecoration: "none" }}>
              {w.title}
            </Link>
            {w.description && <span className={styles.wdesc}>{w.description}</span>}
            <span className={styles.wfoot}>
              <span className={`${styles.wbubble} ${w.featured ? styles.feat : w.show ? "" : styles.hid}`}>
                {w.show && <span className={styles.dot} />}
                {w.featured ? "Featured" : w.show ? "Shown" : "Hidden"}
              </span>
              <span className={styles.wcats}>{w.categories.join(" · ")}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
