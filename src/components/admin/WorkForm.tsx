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
    <div>
      <h1>{work.id ? "Edit work" : "New work"}</h1>

      <div className={styles.field}><label>Slug</label>
        <input value={slug} onChange={(e) => set({ slug: e.target.value })} /></div>
      <div className={styles.field}><label>Title</label>
        <input value={work.title} onChange={(e) => set({ title: e.target.value })} /></div>
      <div className={styles.field}><label>Description</label>
        <textarea rows={2} value={work.description} onChange={(e) => set({ description: e.target.value })} /></div>
      <div className={styles.field}><label>Synopsis</label>
        <textarea rows={2} value={work.synopsis ?? ""} onChange={(e) => set({ synopsis: e.target.value })} /></div>
      <div className={styles.field}><label>Background color</label>
        <input value={work.bgColor} onChange={(e) => set({ bgColor: e.target.value })} /></div>
      <div className={styles.field}><label>Categories (comma-separated)</label>
        <input value={work.categories.join(", ")}
          onChange={(e) => set({ categories: e.target.value.split(",").map((c) => c.trim()).filter(Boolean) })} /></div>

      <div className={styles.row}>
        <label><input type="checkbox" checked={work.show} onChange={(e) => set({ show: e.target.checked })} /> Show</label>
        <label><input type="checkbox" checked={!!work.featured} onChange={(e) => set({ featured: e.target.checked })} /> Featured</label>
        <label><input type="checkbox" checked={!!work.inProgress} onChange={(e) => set({ inProgress: e.target.checked })} /> In progress</label>
      </div>

      <div className={styles.field}><label>Primary link URL</label>
        <input value={work.link?.url ?? ""} onChange={(e) => set({ link: { url: e.target.value, label: work.link?.label ?? "" } })} /></div>
      <div className={styles.field}><label>Primary link label</label>
        <input value={work.link?.label ?? ""} onChange={(e) => set({ link: { url: work.link?.url ?? "", label: e.target.value } })} /></div>

      <h2>Case study</h2>
      <div className={styles.field}><label>Template</label>
        <select value={work.caseStudy?.template ?? "case-study"} onChange={(e) => setCs({ template: e.target.value as any })}>
          <option value="case-study">case-study</option><option value="font">font</option><option value="movie">movie</option>
        </select></div>
      <ImageUploader value={work.caseStudy?.coverImage} slug={slug} onChange={(p) => setCs({ coverImage: p })} label="Cover image" />
      <div className={styles.field}><label>Role</label>
        <input value={work.caseStudy?.role ?? ""} onChange={(e) => setCs({ role: e.target.value })} /></div>
      <div className={styles.field}><label>Client</label>
        <input value={work.caseStudy?.client ?? ""} onChange={(e) => setCs({ client: e.target.value })} /></div>
      <div className={styles.field}><label>Task</label>
        <input value={work.caseStudy?.task ?? ""} onChange={(e) => setCs({ task: e.target.value })} /></div>
      <div className={styles.field}><label>Release date</label>
        <input value={work.caseStudy?.releaseDate ?? ""} onChange={(e) => setCs({ releaseDate: e.target.value })} /></div>

      <h3>Colors</h3>
      <div className={styles.row}>
        <div className={styles.field}><label>Primary</label>
          <input value={work.caseStudy?.colors?.primary ?? ""} onChange={(e) => setCs({ colors: { ...(work.caseStudy?.colors ?? { primary: "", contrast: "", faded: "" }), primary: e.target.value } })} /></div>
        <div className={styles.field}><label>Contrast</label>
          <input value={work.caseStudy?.colors?.contrast ?? ""} onChange={(e) => setCs({ colors: { ...(work.caseStudy?.colors ?? { primary: "", contrast: "", faded: "" }), contrast: e.target.value } })} /></div>
        <div className={styles.field}><label>Faded</label>
          <input value={work.caseStudy?.colors?.faded ?? ""} onChange={(e) => setCs({ colors: { ...(work.caseStudy?.colors ?? { primary: "", contrast: "", faded: "" }), faded: e.target.value } })} /></div>
      </div>

      <h3>Fonts</h3>
      <div className={styles.row}>
        <div className={styles.field}><label>Title font</label>
          <input value={work.caseStudy?.fonts?.title ?? ""} onChange={(e) => setCs({ fonts: { ...(work.caseStudy?.fonts ?? { title: "" }), title: e.target.value } })} /></div>
        <div className={styles.field}><label>Text font</label>
          <input value={work.caseStudy?.fonts?.text ?? ""} onChange={(e) => setCs({ fonts: { ...(work.caseStudy?.fonts ?? { title: "" }), text: e.target.value } })} /></div>
      </div>

      <BlocksEditor blocks={work.caseStudy?.blocks ?? []} slug={slug} onChange={(blocks: CaseStudyBlock[]) => setCs({ blocks })} />

      <div className={styles.row} style={{ marginTop: "1.5rem" }}>
        <button className={styles.button} disabled={saving} onClick={save}>{saving ? "Saving…" : "Save"}</button>
        <button className={`${styles.button} ${styles.secondary}`} onClick={() => router.push("/admin/works")}>Cancel</button>
      </div>
    </div>
  );
}
