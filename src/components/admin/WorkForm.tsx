"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { WorksType, CaseStudyBlock } from "@/lib/types";
import BlocksEditor from "./BlocksEditor";
import ImageUploader from "./ImageUploader";
import TagsInput from "./TagsInput";
import SaveBar from "./SaveBar";
import { apiError, useFeedback } from "./Feedback";
import { useDirtyForm } from "./useDirtyForm";
import { fieldError, slugify } from "./slugify";
import styles from "@/components/admin/admin.module.scss";
import { ArrowLeftIcon, ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";

const emptyWork: WorksType = {
  slug: "", title: "", description: "", bgColor: "#ffffff", categories: [], show: true, featured: false, inProgress: false, caseStudy: { blocks: [] },
};

type Tab = "overview" | "case" | "content";
const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "case", label: "Case study" },
  { id: "content", label: "Content" },
];
type Errors = Partial<Record<"title" | "slug", string>>;

// the parts of a work each tab edits, for the "unsaved" dot on a tab
const part = (w: WorksType, tab: Tab) => {
  const { caseStudy, ...overview } = w;
  const { blocks, ...caseRest } = caseStudy ?? {};
  return JSON.stringify(tab === "overview" ? overview : tab === "case" ? caseRest : blocks ?? []);
};

export default function WorkForm({ initial, categorySuggestions = [] }: { initial?: WorksType; categorySuggestions?: string[] }) {
  const [work, setWork] = useState<WorksType>(initial ?? emptyWork);
  const [tab, setTab] = useState<Tab>("overview");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [slugTouched, setSlugTouched] = useState(!!initial?.id);
  const router = useRouter();
  const { toast, confirm } = useFeedback();
  const slug = work.slug ?? "";
  const isEdit = typeof work.id === "number";

  const { dirty, baseline, markSaved, revert, runSave } = useDirtyForm(work, save);
  const [rev, setRev] = useState(0); // remounts the block list after Discard

  const set = (patch: Partial<WorksType>) => setWork((w) => ({ ...w, ...patch }));
  const setCs = (patch: Partial<NonNullable<WorksType["caseStudy"]>>) =>
    setWork((w) => ({ ...w, caseStudy: { ...(w.caseStudy ?? {}), ...patch } }));
  const colors = work.caseStudy?.colors ?? { primary: "", contrast: "", faded: "" };

  function setTitle(title: string) {
    setErrors((e) => ({ ...e, title: undefined }));
    setWork((w) => ({ ...w, title, slug: slugTouched ? w.slug : slugify(title) }));
  }

  async function save() {
    if (saving) return;
    const local: Errors = {};
    if (!work.title.trim()) local.title = "Required";
    if (!slug.trim()) local.slug = "Required";
    if (local.title || local.slug) {
      setErrors(local);
      setTab("overview");
      return toast("Fill in the highlighted fields", "error");
    }
    setSaving(true);
    try {
      const res = await fetch(isEdit ? `/api/admin/works/${work.id}` : "/api/admin/works", {
        method: isEdit ? "PUT" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(work),
      });
      if (!res.ok) {
        const message = await apiError(res, "Save failed");
        const fe = fieldError(message);
        setErrors(fe);
        if (Object.keys(fe).length) setTab("overview");
        return toast(message, "error");
      }
      setErrors({});
      if (isEdit) {
        markSaved(work);
        toast("Work saved");
        router.refresh();
      } else {
        const { id } = await res.json();
        const created = { ...work, id };
        setWork(created);
        markSaved(created);
        toast("Work created");
        router.replace(`/admin/works/${id}`);
      }
    } catch {
      toast("Network error, work not saved", "error");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!(await confirm({ title: `Delete ${work.title || "this work"}?`, message: "This cannot be undone.", confirmLabel: "Delete", danger: true }))) return;
    try {
      const res = await fetch(`/api/admin/works/${work.id}`, { method: "DELETE" });
      if (!res.ok) return toast(await apiError(res, "Delete failed"), "error");
      markSaved(work);
      toast("Work deleted");
      router.push("/admin/works");
      router.refresh();
    } catch {
      toast("Network error, not deleted", "error");
    }
  }

  const tabDirty = (t: Tab) => part(work, t) !== part(baseline, t);
  const switchTab = (e: React.KeyboardEvent, i: number) => {
    const next = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : null;
    if (next === null) return;
    e.preventDefault();
    const t = TABS[(next + TABS.length) % TABS.length].id;
    setTab(t);
    document.getElementById(`tab-${t}`)?.focus();
  };

  const field = (name: keyof Errors) => (errors[name] ? `${styles.field} ${styles.fieldErr}` : styles.field);

  return (
    <div className={styles.wrap}>
      <div className={styles.pagehead}>
        <div className={styles.pageheadInner}>
          <div>
            <Link href="/admin/works" className={styles.back}><ArrowLeftIcon aria-hidden /> Works</Link>
            <h1>{work.id ? work.title || "Edit work" : "New work"}</h1>
            <p className={styles.sub}>{slug ? `/work/${slug}` : "A new project"}</p>
          </div>
          <div className={styles.actions}>
            {isEdit && work.show && (
              <a className={`${styles.button} ${styles.secondary}`} href={`/work/${work.slug}`} target="_blank" rel="noreferrer">
                View on site <ArrowTopRightOnSquareIcon aria-hidden />
              </a>
            )}
          </div>
        </div>
      </div>

      <div className={styles.editor}>
        <div className={styles.editorMain}>
          <div className={styles.tabs} role="tablist" aria-label="Sections">
            {TABS.map((t, i) => (
              <button
                key={t.id} id={`tab-${t.id}`} type="button" role="tab" aria-selected={tab === t.id}
                aria-controls={`panel-${t.id}`} tabIndex={tab === t.id ? 0 : -1}
                onClick={() => setTab(t.id)} onKeyDown={(e) => switchTab(e, i)}
              >
                {t.label}
                {t.id === "content" && <span className={styles.tabCount}>{work.caseStudy?.blocks?.length ?? 0}</span>}
                {tabDirty(t.id) && <span className={styles.tabDot} title="Unsaved changes" />}
                {t.id === "overview" && (errors.title || errors.slug) && <span className={`${styles.tabDot} ${styles.tabDotErr}`} title="Needs attention" />}
              </button>
            ))}
          </div>

          {tab === "overview" && (
            <div role="tabpanel" id="panel-overview" aria-labelledby="tab-overview">
              <div className={styles.grid2}>
                <div className={field("title")}><label htmlFor="w-title">Title</label>
                  <input id="w-title" value={work.title} onChange={(e) => setTitle(e.target.value)} aria-invalid={!!errors.title} />
                  {errors.title && <span className={styles.fieldMsg}>{errors.title}</span>}</div>
                <div className={field("slug")}><label htmlFor="w-slug">Slug</label>
                  <input id="w-slug" value={slug} aria-invalid={!!errors.slug}
                    onChange={(e) => { setSlugTouched(true); setErrors((er) => ({ ...er, slug: undefined })); set({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, "-") }); }}
                    onBlur={() => set({ slug: slugify(slug) })} />
                  {errors.slug ? <span className={styles.fieldMsg}>{errors.slug}</span>
                    : <span className={styles.help}>{slugTouched ? "The page address." : "Follows the title until you edit it."}</span>}</div>
              </div>
              <div className={styles.field}><label htmlFor="w-desc">Description</label>
                <textarea id="w-desc" rows={2} value={work.description} onChange={(e) => set({ description: e.target.value })} />
                <span className={styles.help}>Shown on the card in the grid.</span></div>
              <div className={styles.field}><label htmlFor="w-syn">Synopsis</label>
                <textarea id="w-syn" rows={2} value={work.synopsis ?? ""} onChange={(e) => set({ synopsis: e.target.value })} /></div>
              <div className={styles.field}><label>Categories</label>
                <TagsInput value={work.categories} lowercase label="Categories" suggestions={categorySuggestions}
                  placeholder="web, design, print" onChange={(categories) => set({ categories })} />
                <span className={styles.help}>Press Enter or comma to add. Saved in lowercase; each one becomes a page on the site.</span></div>
              <div className={styles.grid2}>
                <div className={styles.field}><label htmlFor="w-url">Primary link URL</label>
                  <input id="w-url" value={work.link?.url ?? ""} onChange={(e) => set({ link: { url: e.target.value, label: work.link?.label ?? "" } })} /></div>
                <div className={styles.field}><label htmlFor="w-lbl">Primary link label</label>
                  <input id="w-lbl" value={work.link?.label ?? ""} onChange={(e) => set({ link: { url: work.link?.url ?? "", label: e.target.value } })} /></div>
              </div>
            </div>
          )}

          {tab === "case" && (
            <div role="tabpanel" id="panel-case" aria-labelledby="tab-case">
              <p className={styles.fsp}>Palette, type and facts for the detail page.</p>
              <div className={styles.grid2}>
                <div className={styles.field}><label htmlFor="c-tpl">Template</label>
                  <select id="c-tpl" value={work.caseStudy?.template ?? "case-study"} onChange={(e) => setCs({ template: e.target.value as NonNullable<WorksType["caseStudy"]>["template"] })}>
                    <option value="case-study">Case study</option><option value="font">Font</option><option value="movie">Movie</option>
                  </select></div>
                <div className={styles.field}><label htmlFor="c-date">Release date</label>
                  <input id="c-date" value={work.caseStudy?.releaseDate ?? ""} onChange={(e) => setCs({ releaseDate: e.target.value })} /></div>
              </div>
              <div className={styles.grid2}>
                <div className={styles.field}><label htmlFor="c-role">Role</label>
                  <input id="c-role" value={work.caseStudy?.role ?? ""} onChange={(e) => setCs({ role: e.target.value })} /></div>
                <div className={styles.field}><label htmlFor="c-client">Client</label>
                  <input id="c-client" value={work.caseStudy?.client ?? ""} onChange={(e) => setCs({ client: e.target.value })} /></div>
              </div>
              <div className={styles.field}><label htmlFor="c-task">Task</label>
                <input id="c-task" value={work.caseStudy?.task ?? ""} onChange={(e) => setCs({ task: e.target.value })} /></div>

              <div className={styles.field}><label>Colours</label>
                <div className={styles.grid3}>
                  {(["primary", "contrast", "faded"] as const).map((k) => (
                    <div key={k} className={styles.row}>
                      <span className={styles.swatch} style={{ background: colors[k] || "transparent" }} />
                      <input aria-label={`${k} colour`} value={colors[k]} placeholder={k[0].toUpperCase() + k.slice(1)}
                        onChange={(e) => setCs({ colors: { ...colors, [k]: e.target.value } })} style={{ flex: 1, minWidth: 0 }} />
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.grid2}>
                <div className={styles.field}><label htmlFor="c-ft">Title font</label>
                  <input id="c-ft" value={work.caseStudy?.fonts?.title ?? ""} onChange={(e) => setCs({ fonts: { ...(work.caseStudy?.fonts ?? { title: "" }), title: e.target.value } })} /></div>
                <div className={styles.field}><label htmlFor="c-fx">Text font</label>
                  <input id="c-fx" value={work.caseStudy?.fonts?.text ?? ""} onChange={(e) => setCs({ fonts: { ...(work.caseStudy?.fonts ?? { title: "" }), text: e.target.value } })} /></div>
              </div>
            </div>
          )}

          {tab === "content" && (
            <div role="tabpanel" id="panel-content" aria-labelledby="tab-content">
              <p className={styles.fsp}>The story of the project, top to bottom.</p>
              <BlocksEditor key={rev} blocks={work.caseStudy?.blocks ?? []} slug={slug} onChange={(blocks: CaseStudyBlock[]) => setCs({ blocks })} />
            </div>
          )}
        </div>

        <aside className={styles.sidebar} aria-label="Publishing">
          <div className={styles.scard}>
            <h3>Publish</h3>
            <p className={styles.state} data-dirty={dirty}>{dirty ? "Unsaved changes" : isEdit ? "All changes saved" : "Not created yet"}</p>
            {([
              ["show", "Shown on site"],
              ["featured", "Featured on home"],
              ["inProgress", "In progress"],
            ] as const).map(([k, label]) => (
              <label key={k} className={styles.srow}>
                <span>{label}</span>
                <input type="checkbox" className={styles.switch} checked={!!work[k]} onChange={(e) => set({ [k]: e.target.checked })} />
              </label>
            ))}
            {!work.show && <p className={styles.help} style={{ marginTop: 8 }}>Hidden works are not reachable on the site at all.</p>}
          </div>

          <div className={styles.scard}>
            <h3>Cover</h3>
            <ImageUploader value={work.caseStudy?.coverImage} slug={slug} onChange={(p) => setCs({ coverImage: p })} label="" />
          </div>

          <div className={styles.scard}>
            <h3>Card colour</h3>
            <div className={styles.row}>
              <input type="color" aria-label="Pick card colour" className={styles.colorpick}
                value={/^#[0-9a-f]{6}$/i.test(work.bgColor) ? work.bgColor : "#ffffff"} onChange={(e) => set({ bgColor: e.target.value })} />
              <input aria-label="Card colour hex" value={work.bgColor} onChange={(e) => set({ bgColor: e.target.value })} style={{ flex: 1, minWidth: 0 }} />
            </div>
          </div>

          {isEdit && (
            <button type="button" className={`${styles.button} ${styles.danger}`} onClick={remove}>Delete work</button>
          )}
        </aside>
      </div>

      <SaveBar
        dirty={dirty} saving={saving} onSave={runSave} label={isEdit ? "Save" : "Create"}
        onDiscard={() => { setWork(revert()); setErrors({}); setRev((r) => r + 1); }}
      />
    </div>
  );
}
