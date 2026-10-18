"use client";
import { useState } from "react";
import { ArrowTopRightOnSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import type { CvContent } from "@/lib/types";
import styles from "@/components/admin/admin.module.scss";
import { apiError, useFeedback } from "./Feedback";
import TagsInput from "./TagsInput";
import SaveBar from "./SaveBar";
import RowList from "./RowList";
import Tabs from "./Tabs";
import { useDirtyForm } from "./useDirtyForm";

type Experience = CvContent["experience"][number];
type Education = CvContent["education"][number];

const emptyExperience = (): Experience => ({ position: "", company: "", period: "", type: "", location: "", description: "" });
const emptyEducation = (): Education => ({ institution: "", degree: "", field: "", period: "", location: "" });

type Tab = "profile" | "experience" | "skills" | "education";

// the part of the CV each tab edits, for the "unsaved" dot
const part = (cv: CvContent, tab: Tab) =>
  JSON.stringify(
    tab === "profile" ? [cv.personalInfo, cv.summary]
      : tab === "experience" ? cv.experience
      : tab === "skills" ? [cv.topSkills, cv.stack]
      : [cv.education, cv.languages],
  );

export default function CvEditor({ initial }: { initial: CvContent }) {
  const [cv, setCv] = useState<CvContent>(initial);
  const [tab, setTab] = useState<Tab>("profile");
  const [saving, setSaving] = useState(false);
  const [rev, setRev] = useState(0); // remounts the row lists after Discard
  const { toast } = useFeedback();
  const { dirty, baseline, markSaved, revert, runSave } = useDirtyForm(cv, save);

  const set = (patch: Partial<CvContent>) => setCv((c) => ({ ...c, ...patch }));
  const setInfo = (patch: Partial<CvContent["personalInfo"]>) =>
    setCv((c) => ({ ...c, personalInfo: { ...c.personalInfo, ...patch } }));

  const stackEntries = Object.entries(cv.stack);
  const setStack = (entries: [string, string[]][]) => set({ stack: Object.fromEntries(entries) });

  async function save() {
    if (saving) return;
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

  const dirtyTab = (t: Tab) => part(cv, t) !== part(baseline, t);

  return (
    <div className={styles.wrap}>
      <div className={styles.pagehead}>
        <div className={styles.pageheadInner}>
          <div>
            <h1>CV</h1>
            <p className={styles.sub}>Experience, skills, languages and education</p>
          </div>
          <div className={styles.actions}>
            <a className={`${styles.button} ${styles.secondary}`} href="/cv" target="_blank" rel="noreferrer">
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
              { id: "experience", label: "Experience", count: cv.experience.length, dirty: dirtyTab("experience") },
              { id: "skills", label: "Skills", dirty: dirtyTab("skills") },
              { id: "education", label: "Education & languages", dirty: dirtyTab("education") },
            ]}
          />

          {tab === "profile" && (
            <div role="tabpanel" id="panel-profile" aria-labelledby="tab-profile">
              <div className={styles.grid2}>
                <div className={styles.field}><label htmlFor="cv-name">Name</label>
                  <input id="cv-name" value={cv.personalInfo.name} onChange={(e) => setInfo({ name: e.target.value })} /></div>
                <div className={styles.field}><label htmlFor="cv-title">Title</label>
                  <input id="cv-title" value={cv.personalInfo.title} onChange={(e) => setInfo({ title: e.target.value })} /></div>
                <div className={styles.field}><label htmlFor="cv-web">Website</label>
                  <input id="cv-web" value={cv.personalInfo.website} onChange={(e) => setInfo({ website: e.target.value })} /></div>
                <div className={styles.field}><label htmlFor="cv-mail">Email</label>
                  <input id="cv-mail" type="email" value={cv.personalInfo.email} onChange={(e) => setInfo({ email: e.target.value })} /></div>
              </div>
              <div className={styles.field}><label htmlFor="cv-sum">Summary</label>
                <textarea id="cv-sum" rows={6} value={cv.summary} onChange={(e) => set({ summary: e.target.value })} /></div>
            </div>
          )}

          {tab === "experience" && (
            <div role="tabpanel" id="panel-experience" aria-labelledby="tab-experience">
              <p className={styles.fsp}>Roles, most recent first. Drag to reorder.</p>
              <RowList<Experience>
                key={rev}
                items={cv.experience} onChange={(experience) => set({ experience })} create={emptyExperience}
                title={(x) => [x.position, x.company].filter(Boolean).join(" at ")} meta={(x) => x.period}
                addLabel="Add role" emptyText="No roles yet."
                render={(x, up) => (
                  <>
                    <div className={styles.grid2}>
                      <div className={styles.field}><label>Position</label><input value={x.position} onChange={(e) => up({ position: e.target.value })} /></div>
                      <div className={styles.field}><label>Company</label><input value={x.company} onChange={(e) => up({ company: e.target.value })} /></div>
                      <div className={styles.field}><label>Period</label><input value={x.period} placeholder="2021 – now" onChange={(e) => up({ period: e.target.value })} /></div>
                      <div className={styles.field}><label>Type</label><input value={x.type} placeholder="Full-time" onChange={(e) => up({ type: e.target.value })} /></div>
                    </div>
                    <div className={styles.field}><label>Location</label><input value={x.location} onChange={(e) => up({ location: e.target.value })} /></div>
                    <div className={styles.field}><label>Description</label><textarea rows={4} value={x.description} onChange={(e) => up({ description: e.target.value })} /></div>
                  </>
                )}
              />
            </div>
          )}

          {tab === "skills" && (
            <div role="tabpanel" id="panel-skills" aria-labelledby="tab-skills">
              <div className={styles.field}><label>Top skills</label>
                <TagsInput value={cv.topSkills} label="Top skills" placeholder="Add a skill and press Enter" onChange={(topSkills) => set({ topSkills })} />
                <span className={styles.help}>The headline skills at the top of the CV. Drag to reorder.</span></div>

              <h3 className={styles.subhead}>Stack</h3>
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
            </div>
          )}

          {tab === "education" && (
            <div role="tabpanel" id="panel-education" aria-labelledby="tab-education">
              <h3 className={styles.subhead} style={{ marginTop: 0 }}>Education</h3>
              <RowList<Education>
                key={rev}
                items={cv.education} onChange={(education) => set({ education })} create={emptyEducation}
                title={(x) => x.institution} meta={(x) => x.period}
                addLabel="Add education" emptyText="No education yet."
                render={(x, up) => (
                  <>
                    <div className={styles.field}><label>Institution</label><input value={x.institution} onChange={(e) => up({ institution: e.target.value })} /></div>
                    <div className={styles.grid2}>
                      <div className={styles.field}><label>Degree</label><input value={x.degree} onChange={(e) => up({ degree: e.target.value })} /></div>
                      <div className={styles.field}><label>Field</label><input value={x.field} onChange={(e) => up({ field: e.target.value })} /></div>
                      <div className={styles.field}><label>Period</label><input value={x.period} onChange={(e) => up({ period: e.target.value })} /></div>
                      <div className={styles.field}><label>Location</label><input value={x.location} onChange={(e) => up({ location: e.target.value })} /></div>
                    </div>
                  </>
                )}
              />

              <h3 className={styles.subhead}>Languages</h3>
              <div className={styles.langs}>
                {cv.languages.map((l, i) => (
                  <div key={i} className={styles.langRow}>
                    <input aria-label="Language" placeholder="Language" value={l.language}
                      onChange={(e) => set({ languages: cv.languages.map((x, j) => (j === i ? { ...x, language: e.target.value } : x)) })} />
                    <input aria-label="Level" placeholder="Level" value={l.level}
                      onChange={(e) => set({ languages: cv.languages.map((x, j) => (j === i ? { ...x, level: e.target.value } : x)) })} />
                    <button type="button" className={`${styles.blockBtn} ${styles.del}`} aria-label={`Remove ${l.language || "language"}`} title="Remove"
                      onClick={() => set({ languages: cv.languages.filter((_, j) => j !== i) })}><TrashIcon /></button>
                  </div>
                ))}
              </div>
              <div className={styles.addrow}>
                <button type="button" className={styles.chip} onClick={() => set({ languages: [...cv.languages, { language: "", level: "" }] })}>+ Add language</button>
              </div>
            </div>
          )}
        </div>

        <aside className={styles.sidebar} aria-label="CV overview">
          <div className={styles.scard}>
            <h3>Status</h3>
            <p className={styles.state} data-dirty={dirty}>{dirty ? "Unsaved changes" : "All changes saved"}</p>
          </div>
          <div className={styles.scard}>
            <h3>Contents</h3>
            <dl className={styles.stats}>
              <div><dt>Roles</dt><dd>{cv.experience.length}</dd></div>
              <div><dt>Top skills</dt><dd>{cv.topSkills.length}</dd></div>
              <div><dt>Stack categories</dt><dd>{stackEntries.length}</dd></div>
              <div><dt>Education</dt><dd>{cv.education.length}</dd></div>
              <div><dt>Languages</dt><dd>{cv.languages.length}</dd></div>
            </dl>
          </div>
        </aside>
      </div>

      <SaveBar dirty={dirty} saving={saving} onSave={runSave} label="Save CV" onDiscard={() => { setCv(revert()); setRev((r) => r + 1); }} />
    </div>
  );
}
