"use client";
import { useState } from "react";
import type { CvContent } from "@/lib/types";
import styles from "@/components/admin/admin.module.scss";
import { apiError, useFeedback } from "./Feedback";

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
          <p className={styles.fsp}>The headline skills shown at the top of the CV.</p>
          <div className={styles.list}>
            {cv.topSkills.map((s, i) => (
              <div key={i} className={styles.row}>
                <input style={{ flex: 1 }} value={s}
                  onChange={(e) => set({ topSkills: cv.topSkills.map((x, j) => (j === i ? e.target.value : x)) })} />
                <button className={`${styles.button} ${styles.danger} ${styles.sm}`} onClick={() => set({ topSkills: removeAt(cv.topSkills, i) })}>Remove</button>
              </div>
            ))}
          </div>
          <div className={styles.addrow}>
            <button className={styles.chip} onClick={() => set({ topSkills: [...cv.topSkills, ""] })}>+ Add skill</button>
          </div>
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
          <p className={styles.fsp}>Tools grouped by category. Tags are comma-separated.</p>
          {stackEntries.map(([key, values], i) => (
            <div key={i} className={styles.block}>
              <div className={styles.grid2}>
                <div className={styles.field}><label>Category</label>
                  <input value={key} onChange={(e) => setStack(stackEntries.map((en, j) => (j === i ? [e.target.value, en[1]] : en)))} /></div>
                <div className={styles.field} style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                  <button className={`${styles.button} ${styles.danger} ${styles.sm}`}
                    onClick={() => setStack(stackEntries.filter((_, j) => j !== i))}>Remove category</button>
                </div>
              </div>
              <div className={styles.field}><label>Items</label>
                <input value={values.join(", ")}
                  onChange={(e) => setStack(stackEntries.map((en, j) => (j === i ? [en[0], e.target.value.split(",").map((s) => s.trim()).filter(Boolean)] : en)))} /></div>
            </div>
          ))}
          <div className={styles.addrow}>
            <button className={styles.chip} onClick={() => setStack([...stackEntries, ["new category", []]])}>+ Add category</button>
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
    </div>
  );
}
