"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { DjInfo, DjEvent } from "@/lib/types";
import ImageListEditor from "./ImageListEditor";
import TagsInput from "./TagsInput";
import SaveBar from "./SaveBar";
import { useDirtyForm } from "./useDirtyForm";
import styles from "@/components/admin/admin.module.scss";
import { apiError, useFeedback } from "./Feedback";
import { useExclusive } from "./useExclusive";
import { ArrowDownIcon, ArrowUpIcon } from "@heroicons/react/24/outline";

export default function DjManager({ info, events }: { info: DjInfo; events: DjEvent[] }) {
  const [dj, setDj] = useState<DjInfo>(info);
  const [evs, setEvs] = useState<DjEvent[]>(events);
  const router = useRouter();
  const { toast, confirm } = useFeedback();
  const { busy, exclusive } = useExclusive();
  const [savingInfo, setSavingInfo] = useState(false);
  const { dirty, markSaved, revert, runSave } = useDirtyForm(dj, saveInfo);
  const resync = useRef(false); // adopt the server list on the next refresh (after a failed reorder)
  useEffect(() => {
    if (resync.current) {
      resync.current = false;
      setEvs(events);
    }
  }, [events]);

  const setEv = (i: number, patch: Partial<DjEvent>) =>
    setEvs((xs) => xs.map((x, j) => (j === i ? { ...x, ...patch } : x)));

  async function saveInfo() {
    if (savingInfo) return;
    setSavingInfo(true);
    try {
      const res = await fetch("/api/admin/dj-info", {
        method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(dj),
      });
      if (!res.ok) return toast(await apiError(res, "Save failed"), "error");
      markSaved(dj);
      toast("DJ info saved");
      router.refresh();
    } catch {
      toast("Network error, not saved", "error");
    } finally {
      setSavingInfo(false);
    }
  }
  async function saveEvent(i: number) {
    const e = evs[i];
    const isEdit = typeof e.id === "number";
    try {
      const res = await fetch(isEdit ? `/api/admin/dj-events/${e.id}` : "/api/admin/dj-events", {
        method: isEdit ? "PUT" : "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(e),
      });
      if (!res.ok) return toast(await apiError(res, "Save failed"), "error");
      // a created row needs its new id, otherwise the next Save would POST a duplicate
      if (!isEdit) setEv(i, { id: (await res.json()).id });
      toast(isEdit ? "Event saved" : "Event created");
      router.refresh();
    } catch {
      toast("Network error, not saved", "error");
    }
  }
  async function moveEvent(i: number, delta: -1 | 1) {
    if (evs.some((x) => typeof x.id !== "number")) return toast("Save new rows before reordering", "error");
    const next = [...evs];
    const [moved] = next.splice(i, 1);
    next.splice(i + delta, 0, moved);
    setEvs(next);
    try {
      const res = await fetch("/api/admin/dj-events/reorder", {
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
  async function delEvent(i: number) {
    const e = evs[i];
    if (typeof e.id !== "number") return setEvs((xs) => xs.filter((_, j) => j !== i));
    if (!(await confirm({ title: "Delete this event?", message: "This cannot be undone.", confirmLabel: "Delete", danger: true }))) return;
    try {
      const res = await fetch(`/api/admin/dj-events/${e.id}`, { method: "DELETE" });
      if (!res.ok) return toast(await apiError(res, "Delete failed"), "error");
      setEvs((xs) => xs.filter((x) => x.id !== e.id));
      toast("Event deleted");
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
            <h1>DJ</h1>
            <p className={styles.sub}>Summary, technical rider, photos and events</p>
          </div>
          <div className={styles.actions}>
            <button className={styles.button} disabled={savingInfo} onClick={saveInfo}>Save DJ info</button>
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
        <TagsInput value={dj.partners} onChange={(partners) => setDj({ ...dj, partners })} /></div>

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
            <button className={`${styles.button} ${styles.secondary}`} disabled={busy || i === 0} onClick={() => exclusive(() => moveEvent(i, -1))} aria-label="Move up" title="Move up"><ArrowUpIcon /></button>
            <button className={`${styles.button} ${styles.secondary}`} disabled={busy || i === evs.length - 1} onClick={() => exclusive(() => moveEvent(i, 1))} aria-label="Move down" title="Move down"><ArrowDownIcon /></button>
            <button className={styles.button} disabled={busy} onClick={() => exclusive(() => saveEvent(i))}>Save</button>
            <button className={`${styles.button} ${styles.danger}`} disabled={busy} onClick={() => exclusive(() => delEvent(i))}>Delete</button>
          </div>
        </div>
      ))}
      <button className={`${styles.button} ${styles.secondary}`} onClick={() => setEvs((xs) => [...xs, { date: "", venue: "", city: "Berlin" }])}>+ Add event</button>
      <SaveBar dirty={dirty} saving={savingInfo} onSave={runSave} label="Save DJ info" onDiscard={() => setDj(revert())} />
    </div>
  );
}
