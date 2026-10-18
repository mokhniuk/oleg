"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { PetProject } from "@/lib/types";
import styles from "@/components/admin/admin.module.scss";
import { apiError, useFeedback } from "./Feedback";
import { useExclusive } from "./useExclusive";

export default function PetProjectsManager({ initial }: { initial: PetProject[] }) {
  const [items, setItems] = useState<PetProject[]>(initial);
  const router = useRouter();
  const { toast, confirm } = useFeedback();
  const { busy, exclusive } = useExclusive();
  const resync = useRef(false); // adopt the server list on the next refresh (after a failed reorder)
  useEffect(() => {
    if (resync.current) {
      resync.current = false;
      setItems(initial);
    }
  }, [initial]);

  const set = (i: number, patch: Partial<PetProject>) =>
    setItems((xs) => xs.map((x, j) => (j === i ? { ...x, ...patch } : x)));

  async function save(i: number) {
    const p = items[i];
    const isEdit = typeof p.id === "number";
    try {
      const res = await fetch(isEdit ? `/api/admin/pet-projects/${p.id}` : "/api/admin/pet-projects", {
        method: isEdit ? "PUT" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(p),
      });
      if (!res.ok) return toast(await apiError(res, "Save failed"), "error");
      // a created row needs its new id, otherwise the next Save would POST a duplicate
      if (!isEdit) set(i, { id: (await res.json()).id });
      toast(isEdit ? "Pet project saved" : "Pet project created");
      router.refresh();
    } catch {
      toast("Network error, not saved", "error");
    }
  }
  async function move(i: number, delta: -1 | 1) {
    if (items.some((x) => typeof x.id !== "number")) return toast("Save new rows before reordering", "error");
    const next = [...items];
    const [moved] = next.splice(i, 1);
    next.splice(i + delta, 0, moved);
    setItems(next);
    try {
      const res = await fetch("/api/admin/pet-projects/reorder", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ids: next.map((x) => x.id).filter((id) => typeof id === "number") }),
      });
      if (!res.ok) throw new Error(await apiError(res, "Reorder failed"));
      router.refresh();
    } catch (e) {
      resync.current = true;
      router.refresh();
      toast(e instanceof Error ? e.message : "Reorder failed", "error");
    }
  }
  async function del(i: number) {
    const p = items[i];
    if (typeof p.id !== "number") return setItems((xs) => xs.filter((_, j) => j !== i));
    if (!(await confirm({ title: `Delete ${p.title || "this pet project"}?`, message: "This cannot be undone.", confirmLabel: "Delete", danger: true }))) return;
    try {
      const res = await fetch(`/api/admin/pet-projects/${p.id}`, { method: "DELETE" });
      if (!res.ok) return toast(await apiError(res, "Delete failed"), "error");
      setItems((xs) => xs.filter((x) => x.id !== p.id));
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
            <p className={styles.sub}>Managed here, hidden on the site for now</p>
          </div>
        </div>
      </div>
      {items.map((p, i) => (
        <div key={p.id ?? `new-${i}`} className={styles.block}>
          <div className={styles.field}><label>Slug</label>
            <input value={p.slug} onChange={(e) => set(i, { slug: e.target.value })} /></div>
          <div className={styles.field}><label>Title</label>
            <input value={p.title} onChange={(e) => set(i, { title: e.target.value })} /></div>
          <div className={styles.field}><label>URL</label>
            <input value={p.url} onChange={(e) => set(i, { url: e.target.value })} /></div>
          <div className={styles.field}><label>Description</label>
            <input value={p.description} onChange={(e) => set(i, { description: e.target.value })} /></div>
          <div className={styles.row}>
            <button className={`${styles.button} ${styles.secondary}`} disabled={busy || i === 0} onClick={() => exclusive(() => move(i, -1))} aria-label="Move up">↑</button>
            <button className={`${styles.button} ${styles.secondary}`} disabled={busy || i === items.length - 1} onClick={() => exclusive(() => move(i, 1))} aria-label="Move down">↓</button>
            <button className={styles.button} disabled={busy} onClick={() => exclusive(() => save(i))}>Save</button>
            <button className={`${styles.button} ${styles.danger}`} disabled={busy} onClick={() => exclusive(() => del(i))}>Delete</button>
          </div>
        </div>
      ))}
      <button className={`${styles.button} ${styles.secondary}`}
        onClick={() => setItems((xs) => [...xs, { slug: "", title: "", icon: "", image: "", url: "", description: "" }])}>
        + Add pet project
      </button>
    </div>
  );
}
