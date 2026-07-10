"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { WorksType, CaseStudyBlock } from "@/lib/types";
import BlocksEditor from "./BlocksEditor";
import ImageUploader from "./ImageUploader";
import styles from "@/components/admin/admin.module.scss";

const emptyWork: WorksType = {
  slug: "", title: "", description: "", bgColor: "#ffffff", categories: [], show: true, caseStudy: { blocks: [] },
};

export default function WorkForm({ initial }: { initial?: WorksType }) {
  const [work, setWork] = useState<WorksType>(initial ?? emptyWork);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const slug = work.slug ?? "";

  const set = (patch: Partial<WorksType>) => setWork((w) => ({ ...w, ...patch }));
  const setCs = (patch: Partial<NonNullable<WorksType["caseStudy"]>>) =>
    setWork((w) => ({ ...w, caseStudy: { ...(w.caseStudy ?? {}), ...patch } }));
  const colors = work.caseStudy?.colors ?? { primary: "", contrast: "", faded: "" };

  async function save() {
    setSaving(true);
    const isEdit = typeof work.id === "number";
    const res = await fetch(isEdit ? `/api/admin/works/${work.id}` : "/api/admin/works", {
      method: isEdit ? "PUT" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(work),
    });
    setSaving(false);
    if (res.ok) router.push("/admin/works");
    else alert("Save failed");
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.pagehead}>
        <div className={styles.pageheadInner}>
          <div>
            <h1>{work.id ? "Edit work" : "New work"}</h1>
            <p className={styles.sub}>{slug ? `/work/${slug}` : "A new project"}</p>
          </div>
          <div className={styles.actions}>
            <button className={`${styles.button} ${styles.ghost}`} onClick={() => router.push("/admin/works")}>Cancel</button>
            <button className={styles.button} disabled={saving} onClick={save}>{saving ? "Saving…" : "Save changes"}</button>
          </div>
        </div>
      </div>

      <div className={styles.form}>
        {/* Details */}
        <section className={styles.fsec}>
          <h2>Details</h2>
          <p className={styles.fsp}>How this project appears in the grid.</p>
          <div className={styles.grid2}>
            <div className={styles.field}><label>Title</label>
              <input value={work.title} onChange={(e) => set({ title: e.target.value })} /></div>
            <div className={styles.field}><label>Slug</label>
              <input value={slug} onChange={(e) => set({ slug: e.target.value })} /></div>
          </div>
          <div className={styles.field}><label>Description</label>
            <textarea rows={2} value={work.description} onChange={(e) => set({ description: e.target.value })} /></div>
          <div className={styles.field}><label>Synopsis</label>
            <textarea rows={2} value={work.synopsis ?? ""} onChange={(e) => set({ synopsis: e.target.value })} /></div>
          <div className={styles.grid2}>
            <div className={styles.field}><label>Background colour</label>
              <div className={styles.row}>
                <span className={styles.swatch} style={{ background: work.bgColor }} />
                <input value={work.bgColor} onChange={(e) => set({ bgColor: e.target.value })} style={{ flex: 1 }} />
              </div>
            </div>
            <div className={styles.field}><label>Categories</label>
              <input value={work.categories.join(", ")}
                onChange={(e) => set({ categories: e.target.value.split(",").map((c) => c.trim()).filter(Boolean) })} />
              <span className={styles.help}>Comma-separated tags.</span>
            </div>
          </div>

          <div className={styles.field}><label>Visibility</label>
            <div className={styles.toggles}>
              <label className={styles.tog}>
                <span className={styles.togText}>Shown<div className={styles.help}>Visible on the site</div></span>
                <input type="checkbox" checked={work.show} onChange={(e) => set({ show: e.target.checked })} />
              </label>
              <label className={styles.tog}>
                <span className={styles.togText}>Featured<div className={styles.help}>Appears on the homepage</div></span>
                <input type="checkbox" checked={!!work.featured} onChange={(e) => set({ featured: e.target.checked })} />
              </label>
              <label className={styles.tog}>
                <span className={styles.togText}>In progress<div className={styles.help}>Shows a work-in-progress note</div></span>
                <input type="checkbox" checked={!!work.inProgress} onChange={(e) => set({ inProgress: e.target.checked })} />
              </label>
            </div>
          </div>

          <div className={styles.grid2}>
            <div className={styles.field}><label>Primary link URL</label>
              <input value={work.link?.url ?? ""} onChange={(e) => set({ link: { url: e.target.value, label: work.link?.label ?? "" } })} /></div>
            <div className={styles.field}><label>Primary link label</label>
              <input value={work.link?.label ?? ""} onChange={(e) => set({ link: { url: work.link?.url ?? "", label: e.target.value } })} /></div>
          </div>
        </section>

        {/* Case study */}
        <section className={styles.fsec}>
          <h2>Case study</h2>
          <p className={styles.fsp}>Cover, palette and type for the detail page.</p>
          <div className={styles.grid2}>
            <div className={styles.field}><label>Template</label>
              <select value={work.caseStudy?.template ?? "case-study"} onChange={(e) => setCs({ template: e.target.value as NonNullable<WorksType["caseStudy"]>["template"] })}>
                <option value="case-study">Case study</option><option value="font">Font</option><option value="movie">Movie</option>
              </select></div>
            <ImageUploader value={work.caseStudy?.coverImage} slug={slug} onChange={(p) => setCs({ coverImage: p })} label="Cover image" />
          </div>
          <div className={styles.grid2}>
            <div className={styles.field}><label>Role</label>
              <input value={work.caseStudy?.role ?? ""} onChange={(e) => setCs({ role: e.target.value })} /></div>
            <div className={styles.field}><label>Client</label>
              <input value={work.caseStudy?.client ?? ""} onChange={(e) => setCs({ client: e.target.value })} /></div>
          </div>
          <div className={styles.grid2}>
            <div className={styles.field}><label>Task</label>
              <input value={work.caseStudy?.task ?? ""} onChange={(e) => setCs({ task: e.target.value })} /></div>
            <div className={styles.field}><label>Release date</label>
              <input value={work.caseStudy?.releaseDate ?? ""} onChange={(e) => setCs({ releaseDate: e.target.value })} /></div>
          </div>

          <div className={styles.field}><label>Colours</label>
            <div className={styles.grid3}>
              <div className={styles.row}><span className={styles.swatch} style={{ background: colors.primary || "transparent" }} />
                <input value={colors.primary} placeholder="Primary" onChange={(e) => setCs({ colors: { ...colors, primary: e.target.value } })} style={{ flex: 1 }} /></div>
              <div className={styles.row}><span className={styles.swatch} style={{ background: colors.contrast || "transparent" }} />
                <input value={colors.contrast} placeholder="Contrast" onChange={(e) => setCs({ colors: { ...colors, contrast: e.target.value } })} style={{ flex: 1 }} /></div>
              <div className={styles.row}><span className={styles.swatch} style={{ background: colors.faded || "transparent" }} />
                <input value={colors.faded} placeholder="Faded" onChange={(e) => setCs({ colors: { ...colors, faded: e.target.value } })} style={{ flex: 1 }} /></div>
            </div>
          </div>

          <div className={styles.grid2}>
            <div className={styles.field}><label>Title font</label>
              <input value={work.caseStudy?.fonts?.title ?? ""} onChange={(e) => setCs({ fonts: { ...(work.caseStudy?.fonts ?? { title: "" }), title: e.target.value } })} /></div>
            <div className={styles.field}><label>Text font</label>
              <input value={work.caseStudy?.fonts?.text ?? ""} onChange={(e) => setCs({ fonts: { ...(work.caseStudy?.fonts ?? { title: "" }), text: e.target.value } })} /></div>
          </div>
        </section>

        {/* Content */}
        <section className={styles.fsec}>
          <h2>Content</h2>
          <p className={styles.fsp}>The story of the project, top to bottom.</p>
          <BlocksEditor blocks={work.caseStudy?.blocks ?? []} slug={slug} onChange={(blocks: CaseStudyBlock[]) => setCs({ blocks })} />
        </section>
      </div>
    </div>
  );
}
