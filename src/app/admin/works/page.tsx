import Link from "next/link";
import { getAllWorks } from "@/lib/repositories/works";
import styles from "@/components/admin/admin.module.scss";
import WorksListActions from "@/components/admin/WorksListActions";

export const dynamic = "force-dynamic";

export default function WorksListPage() {
  const works = getAllWorks();
  return (
    <div>
      <div className={styles.blockHead}>
        <h1>Works</h1>
        <Link className={styles.button} href="/admin/works/new">+ New work</Link>
      </div>
      <div className={styles.list}>
        {works.map((w) => (
          <div key={w.id} className={styles.item}>
            <span>{w.title} <small>({w.slug})</small> {w.show ? "" : "· hidden"} {w.featured ? "· featured" : ""}</span>
            <span className={styles.row}>
              <Link href={`/admin/works/${w.id}`}>Edit</Link>
              <WorksListActions id={w.id!} />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
