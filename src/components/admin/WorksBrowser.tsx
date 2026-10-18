"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { WorksType } from "@/lib/types";
import { isDarkColor } from "@/lib/color";
import styles from "@/components/admin/admin.module.scss";
import WorksListActions from "./WorksListActions";
import { SortableItem, SortableList } from "./Sortable";
import { apiError, useFeedback } from "./Feedback";

type View = "grid" | "list";
type Filter = "all" | "featured" | "hidden";
const VIEW_KEY = "admin.works.view";

export default function WorksBrowser({ works }: { works: WorksType[] }) {
  const router = useRouter();
  const { toast } = useFeedback();
  const [order, setOrder] = useState<number[]>(works.map((w) => w.id!));
  const [view, setView] = useState<View>("grid");
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const saving = useRef(false);

  // adopt server data after router.refresh()
  useEffect(() => setOrder(works.map((w) => w.id!)), [works]);
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

  const byId = useMemo(() => new Map(works.map((w) => [w.id!, w])), [works]);
  const ordered = order.map((id) => byId.get(id)).filter((w): w is WorksType => !!w);
  const q = query.trim().toLowerCase();
  const shown = ordered.filter((w) => {
    if (filter === "featured" && !(w.show && w.featured)) return false;
    if (filter === "hidden" && w.show) return false;
    if (!q) return true;
    return [w.title, w.slug, w.description, ...w.categories].some((s) => s?.toLowerCase().includes(q));
  });
  const filtering = filter !== "all" || !!q;
  const hiddenCount = works.filter((w) => !w.show).length;

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
      const res = await fetch("/api/admin/works/reorder", {
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

  return (
    <div className={styles.wrap}>
      <div className={styles.pagehead}>
        <div className={styles.pageheadInner}>
          <div>
            <h1>Works</h1>
            <p className={styles.sub}>{works.length} projects{hiddenCount ? ` · ${hiddenCount} hidden` : ""}</p>
          </div>
          <div className={styles.actions}>
            <Link className={styles.button} href="/admin/works/new">+ New work</Link>
          </div>
        </div>
      </div>

      <div className={styles.toolbar}>
        <input
          className={styles.search} type="search" placeholder="Search works" aria-label="Search works"
          value={query} onChange={(e) => setQuery(e.target.value)}
        />
        <div className={styles.seg} role="group" aria-label="Filter">
          {(["all", "featured", "hidden"] as Filter[]).map((f) => (
            <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)}>
              {f[0].toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <div className={styles.seg} role="group" aria-label="View">
          {(["grid", "list"] as View[]).map((v) => (
            <button key={v} type="button" aria-pressed={view === v} onClick={() => chooseView(v)}>
              {v[0].toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>
      {filtering && shown.length > 0 && <p className={styles.help} style={{ marginBottom: 14 }}>Clear the search and filter to drag and reorder.</p>}

      {shown.length === 0 ? (
        <p className={styles.empty}>
          {works.length === 0 ? "No works yet. Create the first one." : "No works match. Clear the search or switch the filter to All."}
        </p>
      ) : (
        <SortableList
          ids={shown.map((w) => String(w.id))} onReorder={reorder} disabled={filtering}
          layout={view === "grid" ? "grid" : "vertical"}
        >
          <div className={view === "grid" ? styles.works : styles.worksList}>
            {shown.map((w) => (
              <SortableItem key={w.id} id={String(w.id)}>
                {(handle) => (
                  <div className={`${styles.wcard} ${view === "list" ? styles.wrow : ""} ${isDarkColor(w.bgColor) ? styles.onDark : ""}`} style={{ background: w.bgColor }}>
                    {!filtering && (
                      <button type="button" className={styles.wgrip} aria-label={`Drag ${w.title}`} {...handle}>⋮⋮</button>
                    )}
                    <span className={styles.wacts}>
                      {w.show && (
                        <a href={`/work/${w.slug}`} target="_blank" rel="noreferrer" aria-label="View on site" title="View on site">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></svg>
                        </a>
                      )}
                      <Link href={`/admin/works/${w.id}`} aria-label="Edit work" title="Edit">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                        </svg>
                      </Link>
                      <WorksListActions id={w.id!} ids={order} show={w.show} featured={!!w.featured} />
                    </span>
                    <Link href={`/admin/works/${w.id}`} className={styles.wtitle} style={{ textDecoration: "none" }}>{w.title}</Link>
                    {w.description && view === "grid" && <span className={styles.wdesc}>{w.description}</span>}
                    <span className={styles.wfoot}>
                      <span className={`${styles.wbubble} ${w.featured ? styles.feat : w.show ? "" : styles.hid}`}>
                        {w.show && <span className={styles.dot} />}
                        {w.featured ? "Featured" : w.show ? "Shown" : "Hidden"}
                      </span>
                      <span className={styles.wcats}>{w.categories.join(" · ")}</span>
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
