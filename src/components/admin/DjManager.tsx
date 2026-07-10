"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { DjInfo, DjEvent } from "@/lib/types";
import ImageListEditor from "./ImageListEditor";
import styles from "@/components/admin/admin.module.scss";

export default function DjManager({ info, events }: { info: DjInfo; events: DjEvent[] }) {
  const [dj, setDj] = useState<DjInfo>(info);
  const [evs, setEvs] = useState<DjEvent[]>(events);
  const router = useRouter();

  const setEv = (i: number, patch: Partial<DjEvent>) =>
    setEvs((xs) => xs.map((x, j) => (j === i ? { ...x, ...patch } : x)));

  async function saveInfo() {
    const res = await fetch("/api/admin/dj-info", {
      method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(dj),
    });
    if (res.ok) alert("DJ info saved");
    else alert("Save failed");
  }
  async function saveEvent(e: DjEvent) {
    const isEdit = typeof e.id === "number";
    const res = await fetch(isEdit ? `/api/admin/dj-events/${e.id}` : "/api/admin/dj-events", {
      method: isEdit ? "PUT" : "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(e),
    });
    if (res.ok) router.refresh();
    else alert("Save failed");
  }
  async function delEvent(e: DjEvent) {
    if (e.id && confirm("Delete event?")) {
      const res = await fetch(`/api/admin/dj-events/${e.id}`, { method: "DELETE" });
      if (res.ok) router.refresh();
      else alert("Delete failed");
    } else setEvs((xs) => xs.filter((x) => x !== e));
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.pagehead}>
        <div className={styles.pageheadInner}>
          <div>
            <h1>DJ</h1>
            <p className={styles.sub}>Summary, technical rider, photos and events</p>
          </div>
          <div className={styles.actions}>
            <button className={styles.button} onClick={saveInfo}>Save DJ info</button>
          </div>
        </div>
      </div>
      <div className={styles.field}><label>Summary</label>
        <textarea rows={4} value={dj.summary} onChange={(e) => setDj({ ...dj, summary: e.target.value })} /></div>
      <div className={styles.field}><label>Booking email</label>
        <input value={dj.bookingEmail} onChange={(e) => setDj({ ...dj, bookingEmail: e.target.value })} /></div>

      <h3>Technical rider</h3>
      {dj.technicalRider.map((r, i) => (
        <div key={i} className={styles.block}>
          <div className={styles.field}><label>Name</label>
            <input value={r.name} onChange={(e) => setDj({ ...dj, technicalRider: dj.technicalRider.map((x, j) => j === i ? { ...x, name: e.target.value } : x) })} /></div>
          <div className={styles.field}><label>Description</label>
            <input value={r.description} onChange={(e) => setDj({ ...dj, technicalRider: dj.technicalRider.map((x, j) => j === i ? { ...x, description: e.target.value } : x) })} /></div>
          <div className={styles.field}><label>Image path</label>
            <input value={r.image} onChange={(e) => setDj({ ...dj, technicalRider: dj.technicalRider.map((x, j) => j === i ? { ...x, image: e.target.value } : x) })} /></div>
          <button className={`${styles.button} ${styles.danger}`} onClick={() => setDj({ ...dj, technicalRider: dj.technicalRider.filter((_, j) => j !== i) })}>Remove</button>
        </div>
      ))}
      <button className={`${styles.button} ${styles.secondary}`} onClick={() => setDj({ ...dj, technicalRider: [...dj.technicalRider, { name: "", description: "", image: "" }] })}>+ Rider item</button>

      <ImageListEditor label="Photos" values={dj.photos} slug="dj" onChange={(photos) => setDj({ ...dj, photos })} />
      <div className={styles.field}><label>Partners (comma-separated)</label>
        <input value={dj.partners.join(", ")} onChange={(e) => setDj({ ...dj, partners: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} /></div>

      <button className={styles.button} onClick={saveInfo}>Save DJ info</button>

      <h2 style={{ marginTop: "2rem" }}>Events</h2>
      {evs.map((e, i) => (
        <div key={e.id ?? `new-${i}`} className={styles.block}>
          <div className={styles.row}>
            <div className={styles.field}><label>Date</label>
              <input type="date" value={e.date} onChange={(ev) => setEv(i, { date: ev.target.value })} /></div>
            <div className={styles.field}><label>Venue</label>
              <input value={e.venue} onChange={(ev) => setEv(i, { venue: ev.target.value })} /></div>
            <div className={styles.field}><label>City</label>
              <input value={e.city} onChange={(ev) => setEv(i, { city: ev.target.value })} /></div>
          </div>
          <div className={styles.field}><label>Link (optional)</label>
            <input value={e.link ?? ""} onChange={(ev) => setEv(i, { link: ev.target.value })} /></div>
          <div className={styles.row}>
            <button className={styles.button} onClick={() => saveEvent(evs[i])}>Save</button>
            <button className={`${styles.button} ${styles.danger}`} onClick={() => delEvent(evs[i])}>Delete</button>
          </div>
        </div>
      ))}
      <button className={`${styles.button} ${styles.secondary}`} onClick={() => setEvs((xs) => [...xs, { date: "", venue: "", city: "Berlin" }])}>+ Add event</button>
    </div>
  );
}
