"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowTopRightOnSquareIcon, Bars2Icon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import type { DjEvent } from "@/lib/types";
import styles from "@/components/admin/admin.module.scss";
import { SortableItem, SortableList } from "./Sortable";
import { apiError, useFeedback } from "./Feedback";

const emptyEvent = (): DjEvent => ({ date: "", venue: "", city: "Berlin", link: "" });
const today = () => new Date().toISOString().slice(0, 10);
const fmt = (d: string) => {
  const date = new Date(`${d}T00:00:00`);
  return Number.isNaN(date.getTime()) ? d : date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
};

function EventDialog({ event, onClose, onSaved }: { event: DjEvent; onClose: () => void; onSaved: (e: DjEvent) => void }) {
  const [draft, setDraft] = useState<DjEvent>({ ...event, link: event.link ?? "" });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ date?: string; venue?: string }>({});
  const { toast } = useFeedback();
  const isEdit = typeof event.id === "number";

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    const local = { date: draft.date ? undefined : "Required", venue: draft.venue.trim() ? undefined : "Required" };
    if (local.date || local.venue) return setErrors(local);
    setSaving(true);
    try {
      const res = await fetch(isEdit ? `/api/admin/dj-events/${event.id}` : "/api/admin/dj-events", {
        method: isEdit ? "PUT" : "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...draft, link: draft.link?.trim() || undefined }),
      });
      if (!res.ok) return toast(await apiError(res, "Save failed"), "error");
      const id = isEdit ? event.id : (await res.json()).id;
      toast(isEdit ? "Event saved" : "Event created");
      onSaved({ ...draft, id });
    } catch {
      toast("Network error, not saved", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <form className={styles.dialog} style={{ maxWidth: 480 }} role="dialog" aria-modal="true" aria-labelledby="ev-title" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <h3 id="ev-title">{isEdit ? "Edit event" : "New event"}</h3>
        <div className={styles.grid2} style={{ marginTop: 18 }}>
          <div className={errors.date ? `${styles.field} ${styles.fieldErr}` : styles.field}><label htmlFor="ev-date">Date</label>
            <input id="ev-date" type="date" autoFocus value={draft.date} onChange={(e) => { setErrors((x) => ({ ...x, date: undefined })); setDraft({ ...draft, date: e.target.value }); }} />
            {errors.date && <span className={styles.fieldMsg}>{errors.date}</span>}</div>
          <div className={styles.field}><label htmlFor="ev-city">City</label>
            <input id="ev-city" value={draft.city} onChange={(e) => setDraft({ ...draft, city: e.target.value })} /></div>
        </div>
        <div className={errors.venue ? `${styles.field} ${styles.fieldErr}` : styles.field}><label htmlFor="ev-venue">Venue</label>
          <input id="ev-venue" value={draft.venue} onChange={(e) => { setErrors((x) => ({ ...x, venue: undefined })); setDraft({ ...draft, venue: e.target.value }); }} />
          {errors.venue && <span className={styles.fieldMsg}>{errors.venue}</span>}</div>
        <div className={styles.field}><label htmlFor="ev-link">Link (optional)</label>
          <input id="ev-link" value={draft.link ?? ""} placeholder="https://" onChange={(e) => setDraft({ ...draft, link: e.target.value })} /></div>
        <div className={styles.dialogActions}>
          <button type="button" className={`${styles.button} ${styles.ghost}`} onClick={onClose}>Cancel</button>
          <button type="submit" className={styles.button} disabled={saving}>{saving ? "Saving…" : isEdit ? "Save" : "Create"}</button>
        </div>
      </form>
    </div>
  );
}

export default function DjEvents({ events }: { events: DjEvent[] }) {
  const router = useRouter();
  const { toast, confirm } = useFeedback();
  const [order, setOrder] = useState<number[]>(events.map((e) => e.id!));
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<DjEvent | null>(null);
  const saving = useRef(false);

  useEffect(() => setOrder(events.map((e) => e.id!)), [events]);

  const byId = useMemo(() => new Map(events.map((e) => [e.id!, e])), [events]);
  const ordered = order.map((id) => byId.get(id)).filter((e): e is DjEvent => !!e);
  const q = query.trim().toLowerCase();
  const shown = q ? ordered.filter((e) => [e.venue, e.city, e.date, e.link].some((s) => s?.toLowerCase().includes(q))) : ordered;
  const now = today();

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
      const res = await fetch("/api/admin/dj-events/reorder", {
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

  async function remove(ev: DjEvent) {
    if (!(await confirm({ title: `Delete ${ev.venue || "this event"}?`, message: "This cannot be undone.", confirmLabel: "Delete", danger: true }))) return;
    try {
      const res = await fetch(`/api/admin/dj-events/${ev.id}`, { method: "DELETE" });
      if (!res.ok) return toast(await apiError(res, "Delete failed"), "error");
      toast("Event deleted");
      router.refresh();
    } catch {
      toast("Network error, not deleted", "error");
    }
  }

  return (
    <div>
      <div className={styles.toolbar}>
        <input className={styles.search} type="search" placeholder="Search events" aria-label="Search events" value={query} onChange={(e) => setQuery(e.target.value)} />
        <button type="button" className={styles.button} onClick={() => setEditing(emptyEvent())}>+ New event</button>
      </div>
      {q && shown.length > 0 && <p className={styles.help} style={{ marginBottom: 14 }}>Clear the search to drag and reorder.</p>}

      {shown.length === 0 ? (
        <p className={styles.empty}>{events.length === 0 ? "No events yet. Add the first one." : "No events match the search."}</p>
      ) : (
        <SortableList ids={shown.map((e) => String(e.id))} onReorder={reorder} disabled={!!q}>
          <div className={styles.worksList}>
            {shown.map((ev) => {
              const upcoming = ev.date >= now;
              return (
                <SortableItem key={ev.id} id={String(ev.id)}>
                  {(handle) => (
                    <div className={styles.eventRow}>
                      {!q && <button type="button" className={styles.bgrip} aria-label={`Drag ${ev.venue}`} {...handle}><Bars2Icon /></button>}
                      <span className={styles.eventDate}>{fmt(ev.date)}</span>
                      <span className={styles.eventMain}>
                        <strong>{ev.venue}</strong>
                        <span className={styles.help}>{ev.city}</span>
                      </span>
                      <span className={`${styles.eventPill} ${upcoming ? styles.eventUp : ""}`}>{upcoming ? "Upcoming" : "Past"}</span>
                      <span className={styles.eventActs}>
                        {ev.link && <a href={ev.link} target="_blank" rel="noreferrer" aria-label="Open event link" title="Open link"><ArrowTopRightOnSquareIcon /></a>}
                        <button type="button" onClick={() => setEditing(ev)} aria-label={`Edit ${ev.venue}`} title="Edit"><PencilIcon /></button>
                        <button type="button" className={styles.del} onClick={() => remove(ev)} aria-label={`Delete ${ev.venue}`} title="Delete"><TrashIcon /></button>
                      </span>
                    </div>
                  )}
                </SortableItem>
              );
            })}
          </div>
        </SortableList>
      )}

      {editing && (
        <EventDialog
          event={editing} onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); router.refresh(); }}
        />
      )}
    </div>
  );
}
