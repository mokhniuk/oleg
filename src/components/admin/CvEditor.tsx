"use client";
import { useState } from "react";
import type { CvContent } from "@/lib/types";
import styles from "@/components/admin/admin.module.scss";
import { apiError, useFeedback } from "./Feedback";
import TagsInput from "./TagsInput";
import SaveBar from "./SaveBar";
import { useDirtyForm } from "./useDirtyForm";
import { TrashIcon } from "@heroicons/react/24/outline";

type Experience = CvContent["experience"][number];
type Education = CvContent["education"][number];
type Language = CvContent["languages"][number];

const emptyExperience: Experience = { position: "", company: "", period: "", type: "", location: "", description: "" };
const emptyEducation: Education = { institution: "", degree: "", field: "", period: "", location: "" };
const emptyLanguage: Language = { language: "", level: "" };

export default function CvEditor({ initial }: { initial: CvContent }) {
  const [cv, setCv] = useState<CvContent>(initial);
  const [saving, setSaving] = useState(false);
  const { toast } = useFeedback();
  const { dirty, markSaved, revert, runSave } = useDirtyForm(cv, save);

  const set = (patch: Partial<CvContent>) => setCv((c) => ({ ...c, ...patch }));
  const setInfo = (patch: Partial<CvContent["personalInfo"]>) =>
    setCv((c) => ({ ...c, personalInfo: { ...c.personalInfo, ...patch } }));

  // generic array helpers
  const updateAt = <T,>(arr: T[], i: number, patch: Partial<T>) => arr.map((x, j) => (j === i ? { ...x, ...patch } : x));
  const removeAt = <T,>(arr: T[], i: number) => arr.filter((_, j) => j !== i);

  const stackEntries = Object.entries(cv.stack);
  const setStack = (entries: [string, string[]][]) => set({ stack: Object.fromEntries(entries) });

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/cv", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(cv),
      });
      if (!res.ok) return toast(await apiError(res, "Save failed"), "error");
      markSaved(cv);
      toast("CV saved");
    } catch {
      toast("Network error, CV not saved", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.pagehead}>
        <div className={styles.pageheadInner}>
          <div>
            <h1>CV</h1>
            <p className={styles.sub}>Experience, skills, languages and education</p>
          </div>
          <div className={styles.actions}>
            <button className={styles.button} disabled={saving} onClick={save}>{saving ? "Saving…" : "Save CV"}</button>
          </div>
        </div>
      </div>

      <div className={styles.form}>
        {/* Personal info */}
        <section className={styles.fsec}>
          <h2>Personal info</h2>
          <p className={styles.fsp}>Name, title and contact details.</p>
          <div className={styles.grid2}>
            <div className={styles.field}><label>Name</label>
              <input value={cv.personalInfo.name} onChange={(e) => setInfo({ name: e.target.value })} /></div>
            <div className={styles.field}><label>Title</label>
              <input value={cv.personalInfo.title} onChange={(e) => setInfo({ title: e.target.value })} /></div>
            <div className={styles.field}><label>Website</label>
              <input value={cv.personalInfo.website} onChange={(e) => setInfo({ website: e.target.value })} /></div>
            <div className={styles.field}><label>Email</label>
              <input value={cv.personalInfo.email} onChange={(e) => setInfo({ email: e.target.value })} /></div>
          </div>
          <div className={styles.field}><label>Summary</label>
            <textarea rows={4} value={cv.summary} onChange={(e) => set({ summary: e.target.value })} /></div>
        </section>

        {/* Top skills */}
        <section className={styles.fsec}>
          <h2>Top skills</h2>
          <p className={styles.fsp}>The headline skills shown at the top of the CV. Drag to reorder.</p>
          <TagsInput value={cv.topSkills} label="Top skills" placeholder="Add a skill and press Enter" onChange={(topSkills) => set({ topSkills })} />
        </section>

        {/* Experience */}
        <section className={styles.fsec}>
          <h2>Experience</h2>
          <p className={styles.fsp}>Roles, most recent first.</p>
          {cv.experience.map((x, i) => (
            <div key={i} className={styles.block}>
              <div className={styles.blockHead}>
                <strong>{x.company || `Role ${i + 1}`}</strong>
                <button className={`${styles.button} ${styles.danger} ${styles.sm}`} style={{ marginLeft: "auto" }}
                  onClick={() => set({ experience: removeAt(cv.experience, i) })}>Remove</button>
              </div>
              <div className={styles.grid2}>
                <div className={styles.field}><label>Position</label>
                  <input value={x.position} onChange={(e) => set({ experience: updateAt(cv.experience, i, { position: e.target.value }) })} /></div>
                <div className={styles.field}><label>Company</label>
                  <input value={x.company} onChange={(e) => set({ experience: updateAt(cv.experience, i, { company: e.target.value }) })} /></div>
                <div className={styles.field}><label>Period</label>
                  <input value={x.period} onChange={(e) => set({ experience: updateAt(cv.experience, i, { period: e.target.value }) })} /></div>
                <div className={styles.field}><label>Type</label>
                  <input value={x.type} onChange={(e) => set({ experience: updateAt(cv.experience, i, { type: e.target.value }) })} /></div>
              </div>
              <div className={styles.field}><label>Location</label>
                <input value={x.location} onChange={(e) => set({ experience: updateAt(cv.experience, i, { location: e.target.value }) })} /></div>
              <div className={styles.field}><label>Description</label>
                <textarea rows={3} value={x.description} onChange={(e) => set({ experience: updateAt(cv.experience, i, { description: e.target.value }) })} /></div>
            </div>
          ))}
          <div className={styles.addrow}>
            <button className={styles.chip} onClick={() => set({ experience: [...cv.experience, { ...emptyExperience }] })}>+ Add role</button>
          </div>
        </section>

        {/* Stack */}
        <section className={styles.fsec}>
          <h2>Stack</h2>
          <p className={styles.fsp}>Tools grouped by category.</p>
          <div className={styles.cvgrid}>
            {stackEntries.map(([key, values], i) => (
              <div key={i} className={styles.grp}>
                <div className={styles.grpHead}>
                  <input aria-label="Category name" value={key}
                    onChange={(e) => setStack(stackEntries.map((en, j) => (j === i ? [e.target.value, en[1]] : en)))} />
                  <button type="button" className={styles.blockBtn} aria-label={`Remove ${key || "category"}`} title="Remove category"
                    onClick={() => setStack(stackEntries.filter((_, j) => j !== i))}><TrashIcon /></button>
                </div>
                <TagsInput value={values} label={`${key} items`} placeholder="Add a tool"
                  onChange={(tags) => setStack(stackEntries.map((en, j) => (j === i ? [en[0], tags] : en)))} />
              </div>
            ))}
            <button type="button" className={styles.grpAdd}
              onClick={() => setStack([...stackEntries, [`category ${stackEntries.length + 1}`, []]])}>+ Add category</button>
          </div>
        </section>

        {/* Languages */}
        <section className={styles.fsec}>
          <h2>Languages</h2>
          <p className={styles.fsp}>Spoken languages and level.</p>
          {cv.languages.map((l, i) => (
            <div key={i} className={styles.block}>
              <div className={styles.grid2}>
                <div className={styles.field}><label>Language</label>
                  <input value={l.language} onChange={(e) => set({ languages: updateAt(cv.languages, i, { language: e.target.value }) })} /></div>
                <div className={styles.field}><label>Level</label>
                  <input value={l.level} onChange={(e) => set({ languages: updateAt(cv.languages, i, { level: e.target.value }) })} /></div>
              </div>
              <button className={`${styles.button} ${styles.danger} ${styles.sm}`} onClick={() => set({ languages: removeAt(cv.languages, i) })}>Remove</button>
            </div>
          ))}
          <div className={styles.addrow}>
            <button className={styles.chip} onClick={() => set({ languages: [...cv.languages, { ...emptyLanguage }] })}>+ Add language</button>
          </div>
        </section>

        {/* Education */}
        <section className={styles.fsec}>
          <h2>Education</h2>
          <p className={styles.fsp}>Degrees and institutions.</p>
          {cv.education.map((ed, i) => (
            <div key={i} className={styles.block}>
              <div className={styles.blockHead}>
                <strong>{ed.institution || `Entry ${i + 1}`}</strong>
                <button className={`${styles.button} ${styles.danger} ${styles.sm}`} style={{ marginLeft: "auto" }}
                  onClick={() => set({ education: removeAt(cv.education, i) })}>Remove</button>
              </div>
              <div className={styles.field}><label>Institution</label>
                <input value={ed.institution} onChange={(e) => set({ education: updateAt(cv.education, i, { institution: e.target.value }) })} /></div>
              <div className={styles.grid2}>
                <div className={styles.field}><label>Degree</label>
                  <input value={ed.degree} onChange={(e) => set({ education: updateAt(cv.education, i, { degree: e.target.value }) })} /></div>
                <div className={styles.field}><label>Field</label>
                  <input value={ed.field} onChange={(e) => set({ education: updateAt(cv.education, i, { field: e.target.value }) })} /></div>
                <div className={styles.field}><label>Period</label>
                  <input value={ed.period} onChange={(e) => set({ education: updateAt(cv.education, i, { period: e.target.value }) })} /></div>
                <div className={styles.field}><label>Location</label>
                  <input value={ed.location} onChange={(e) => set({ education: updateAt(cv.education, i, { location: e.target.value }) })} /></div>
              </div>
            </div>
          ))}
          <div className={styles.addrow}>
            <button className={styles.chip} onClick={() => set({ education: [...cv.education, { ...emptyEducation }] })}>+ Add education</button>
          </div>
        </section>
      </div>
      <SaveBar dirty={dirty} saving={saving} onSave={runSave} label="Save CV" onDiscard={() => setCv(revert())} />
    </div>
  );
}
