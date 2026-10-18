"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowTopRightOnSquareIcon, Bars2Icon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import type { PetProject } from "@/lib/types";
import styles from "@/components/admin/admin.module.scss";
import { SortableItem, SortableList } from "./Sortable";
import { apiError, useFeedback } from "./Feedback";

type View = "grid" | "list";
const VIEW_KEY = "admin.petProjects.view";
const TINTS = ["#feeadd", "#e6eef9", "#eef1e4", "#f0eeeb"];

export default function PetProjectsBrowser({ projects }: { projects: PetProject[] }) {
  const router = useRouter();
  const { toast, confirm } = useFeedback();
  const [order, setOrder] = useState<number[]>(projects.map((p) => p.id!));
  const [view, setView] = useState<View>("grid");
  const [query, setQuery] = useState("");
  const saving = useRef(false);

  useEffect(() => setOrder(projects.map((p) => p.id!)), [projects]);
  useEffect(() => {
    try {
      const saved = localStorage.getItem(VIEW_KEY);
      if (saved === "grid" || saved === "list") setView(saved);
    } catch {}
  }, []);
  const chooseView = (v: View) => {
    setView(v);
    try { localStorage.setItem(VIEW_KEY, v); } catch {}
  };

  const byId = useMemo(() => new Map(projects.map((p) => [p.id!, p])), [projects]);
  const ordered = order.map((id) => byId.get(id)).filter((p): p is PetProject => !!p);
  const q = query.trim().toLowerCase();
  const shown = q ? ordered.filter((p) => [p.title, p.slug, p.description, p.url].some((s) => s?.toLowerCase().includes(q))) : ordered;

  async function reorder(ids: string[]) {
    if (saving.current) {
      toast("Still saving the previous move, try again", "error");
      router.refresh();
      return;
    }
    saving.current = true;
    const previous = order;
    const next = ids.map(Number);
    setOrder(next);
    try {
      const res = await fetch("/api/admin/pet-projects/reorder", {
        method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ids: next }),
      });
      if (!res.ok) throw new Error(await apiError(res, "Reorder failed"));
      router.refresh();
    } catch (e) {
      setOrder(previous);
      toast(e instanceof Error ? e.message : "Reorder failed", "error");
      router.refresh();
    } finally {
      saving.current = false;
    }
  }

  async function remove(p: PetProject) {
    if (!(await confirm({ title: `Delete ${p.title || "this pet project"}?`, message: "This cannot be undone.", confirmLabel: "Delete", danger: true }))) return;
    try {
      const res = await fetch(`/api/admin/pet-projects/${p.id}`, { method: "DELETE" });
      if (!res.ok) return toast(await apiError(res, "Delete failed"), "error");
      toast("Pet project deleted");
      router.refresh();
    } catch {
      toast("Network error, not deleted", "error");
    }
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.pagehead}>
        <div className={styles.pageheadInner}>
          <div>
            <h1>Pet projects</h1>
            <p className={styles.sub}>{projects.length} projects · managed here, hidden on the site for now</p>
          </div>
          <div className={styles.actions}>
            <Link className={styles.button} href="/admin/pet-projects/new">+ New pet project</Link>
          </div>
        </div>
      </div>

      <div className={styles.toolbar}>
        <input
          className={styles.search} type="search" placeholder="Search pet projects" aria-label="Search pet projects"
          value={query} onChange={(e) => setQuery(e.target.value)}
        />
        <div className={styles.seg} role="group" aria-label="View">
          {(["grid", "list"] as View[]).map((v) => (
            <button key={v} type="button" aria-pressed={view === v} onClick={() => chooseView(v)}>
              {v[0].toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>
      {q && shown.length > 0 && <p className={styles.help} style={{ marginBottom: 14 }}>Clear the search to drag and reorder.</p>}

      {shown.length === 0 ? (
        <p className={styles.empty}>{projects.length === 0 ? "No pet projects yet. Create the first one." : "No pet projects match the search."}</p>
      ) : (
        <SortableList ids={shown.map((p) => String(p.id))} onReorder={reorder} disabled={!!q} layout={view === "grid" ? "grid" : "vertical"}>
          <div className={view === "grid" ? styles.works : styles.worksList}>
            {shown.map((p, i) => (
              <SortableItem key={p.id} id={String(p.id)}>
                {(handle) => (
                  <div className={`${styles.wcard} ${view === "list" ? styles.wrow : ""}`} style={{ background: TINTS[i % TINTS.length] }}>
                    {!q && (
                      <button type="button" className={styles.wgrip} aria-label={`Drag ${p.title}`} {...handle}><Bars2Icon /></button>
                    )}
                    <span className={styles.wacts}>
                      {p.url && (
                        <a href={p.url} target="_blank" rel="noreferrer" aria-label="Open project" title="Open project"><ArrowTopRightOnSquareIcon /></a>
                      )}
                      <Link href={`/admin/pet-projects/${p.id}`} aria-label="Edit pet project" title="Edit"><PencilIcon /></Link>
                      <button type="button" className={styles.del} onClick={() => remove(p)} aria-label="Delete pet project" title="Delete"><TrashIcon /></button>
                    </span>
                    <Link href={`/admin/pet-projects/${p.id}`} className={`${styles.wtitle} ${styles.petTitle}`} style={{ textDecoration: "none" }}>
                      {p.icon && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.icon} alt="" className={styles.petIcon} />
                      )}
                      {p.title}
                    </Link>
                    {p.description && view === "grid" && <span className={styles.wdesc}>{p.description}</span>}
                    <span className={styles.wfoot}>
                      <span className={styles.wcats}>{p.url.replace(/^https?:\/\//, "")}</span>
                    </span>
                  </div>
                )}
              </SortableItem>
            ))}
          </div>
        </SortableList>
      )}
    </div>
  );
}
