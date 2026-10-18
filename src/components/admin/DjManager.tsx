"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import type { DjInfo, DjEvent } from "@/lib/types";
import ImageListEditor from "./ImageListEditor";
import ImageUploader from "./ImageUploader";
import TagsInput from "./TagsInput";
import SaveBar from "./SaveBar";
import RowList from "./RowList";
import Tabs from "./Tabs";
import DjEvents from "./DjEvents";
import { apiError, useFeedback } from "./Feedback";
import { useDirtyForm } from "./useDirtyForm";
import styles from "@/components/admin/admin.module.scss";

type Rider = DjInfo["technicalRider"][number];
type Tab = "profile" | "events" | "rider" | "photos";

const part = (dj: DjInfo, tab: Tab) =>
  JSON.stringify(tab === "profile" ? [dj.summary, dj.bookingEmail, dj.partners] : tab === "rider" ? dj.technicalRider : tab === "photos" ? dj.photos : null);

export default function DjManager({ info, events }: { info: DjInfo; events: DjEvent[] }) {
  const [dj, setDj] = useState<DjInfo>(info);
  const [tab, setTab] = useState<Tab>("profile");
  const [saving, setSaving] = useState(false);
  const [rev, setRev] = useState(0); // remounts the rider list after Discard
  const router = useRouter();
  const { toast } = useFeedback();
  const { dirty, baseline, markSaved, revert, runSave } = useDirtyForm(dj, saveInfo);

  async function saveInfo() {
    if (saving) return;
    setSaving(true);
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
      setSaving(false);
    }
  }

  const dirtyTab = (t: Tab) => t !== "events" && part(dj, t) !== part(baseline, t);
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = events.filter((e) => e.date >= today).length;

  return (
    <div className={styles.wrap}>
      <div className={styles.pagehead}>
        <div className={styles.pageheadInner}>
          <div>
            <h1>DJ</h1>
            <p className={styles.sub}>Profile, events, technical rider and photos</p>
          </div>
          <div className={styles.actions}>
            <a className={`${styles.button} ${styles.secondary}`} href="/dj" target="_blank" rel="noreferrer">
              View on site <ArrowTopRightOnSquareIcon aria-hidden />
            </a>
          </div>
        </div>
      </div>

      <div className={styles.editor}>
        <div className={styles.editorMain}>
          <Tabs<Tab>
            active={tab} onChange={setTab}
            tabs={[
              { id: "profile", label: "Profile", dirty: dirtyTab("profile") },
              { id: "events", label: "Events", count: events.length },
              { id: "rider", label: "Technical rider", count: dj.technicalRider.length, dirty: dirtyTab("rider") },
              { id: "photos", label: "Photos", count: dj.photos.length, dirty: dirtyTab("photos") },
            ]}
          />

          {tab === "profile" && (
            <div role="tabpanel" id="panel-profile" aria-labelledby="tab-profile">
              <div className={styles.field}><label htmlFor="dj-sum">Summary</label>
                <textarea id="dj-sum" rows={6} value={dj.summary} onChange={(e) => setDj({ ...dj, summary: e.target.value })} /></div>
              <div className={styles.field}><label htmlFor="dj-mail">Booking email</label>
                <input id="dj-mail" type="email" value={dj.bookingEmail} onChange={(e) => setDj({ ...dj, bookingEmail: e.target.value })} /></div>
              <div className={styles.field}><label>Partners</label>
                <TagsInput value={dj.partners} label="Partners" placeholder="Add a partner and press Enter" onChange={(partners) => setDj({ ...dj, partners })} />
                <span className={styles.help}>Labels, clubs and collectives. Drag to reorder.</span></div>
            </div>
          )}

          {tab === "events" && (
            <div role="tabpanel" id="panel-events" aria-labelledby="tab-events">
              <DjEvents events={events} />
            </div>
          )}

          {tab === "rider" && (
            <div role="tabpanel" id="panel-rider" aria-labelledby="tab-rider">
              <p className={styles.fsp}>Equipment you need on stage. Drag to reorder.</p>
              <RowList<Rider>
                key={rev}
                items={dj.technicalRider} onChange={(technicalRider) => setDj({ ...dj, technicalRider })}
                create={() => ({ name: "", description: "", image: "" })}
                title={(r) => r.name} meta={(r) => (r.image ? "Has image" : "")}
                addLabel="Add rider item" emptyText="No rider items yet."
                render={(r, up) => (
                  <>
                    <div className={styles.field}><label>Name</label><input value={r.name} onChange={(e) => up({ name: e.target.value })} /></div>
                    <div className={styles.field}><label>Description</label><input value={r.description} onChange={(e) => up({ description: e.target.value })} /></div>
                    <ImageUploader value={r.image} slug="dj" label="Image" onChange={(image) => up({ image })} />
                  </>
                )}
              />
            </div>
          )}

          {tab === "photos" && (
            <div role="tabpanel" id="panel-photos" aria-labelledby="tab-photos">
              <ImageListEditor label="Photos" values={dj.photos} slug="dj" onChange={(photos) => setDj({ ...dj, photos })} />
            </div>
          )}
        </div>

        <aside className={styles.sidebar} aria-label="DJ overview">
          <div className={styles.scard}>
            <h3>Profile</h3>
            <p className={styles.state} data-dirty={dirty}>{dirty ? "Unsaved changes" : "All changes saved"}</p>
            <p className={styles.help}>Events save on their own. Profile, rider and photos save together.</p>
          </div>
          <div className={styles.scard}>
            <h3>Overview</h3>
            <dl className={styles.stats}>
              <div><dt>Events</dt><dd>{events.length}</dd></div>
              <div><dt>Upcoming</dt><dd>{upcoming}</dd></div>
              <div><dt>Rider items</dt><dd>{dj.technicalRider.length}</dd></div>
              <div><dt>Photos</dt><dd>{dj.photos.length}</dd></div>
              <div><dt>Partners</dt><dd>{dj.partners.length}</dd></div>
            </dl>
          </div>
        </aside>
      </div>

      <SaveBar dirty={dirty} saving={saving} onSave={runSave} label="Save" onDiscard={() => { setDj(revert()); setRev((r) => r + 1); }} />
    </div>
  );
}
