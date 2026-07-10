"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PetProject } from "@/lib/types";
import styles from "@/components/admin/admin.module.scss";

export default function PetProjectsManager({ initial }: { initial: PetProject[] }) {
  const [items, setItems] = useState<PetProject[]>(initial);
  const router = useRouter();

  const set = (i: number, patch: Partial<PetProject>) =>
    setItems((xs) => xs.map((x, j) => (j === i ? { ...x, ...patch } : x)));

  async function save(p: PetProject) {
    const isEdit = typeof p.id === "number";
    const res = await fetch(isEdit ? `/api/admin/pet-projects/${p.id}` : "/api/admin/pet-projects", {
      method: isEdit ? "PUT" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(p),
    });
    if (res.ok) router.refresh();
    else alert("Save failed");
  }
  async function del(p: PetProject) {
    if (p.id && confirm("Delete?")) {
      const res = await fetch(`/api/admin/pet-projects/${p.id}`, { method: "DELETE" });
      if (res.ok) router.refresh();
      else alert("Delete failed");
    } else {
      setItems((xs) => xs.filter((x) => x !== p));
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
            <button className={styles.button} onClick={() => save(items[i])}>Save</button>
            <button className={`${styles.button} ${styles.danger}`} onClick={() => del(items[i])}>Delete</button>
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
