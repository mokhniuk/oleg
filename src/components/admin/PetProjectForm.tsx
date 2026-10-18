"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import type { PetProject } from "@/lib/types";
import ImageUploader from "./ImageUploader";
import SaveBar from "./SaveBar";
import { apiError, useFeedback } from "./Feedback";
import { useDirtyForm } from "./useDirtyForm";
import { fieldError, slugify } from "./slugify";
import styles from "@/components/admin/admin.module.scss";

const empty: PetProject = { slug: "", title: "", icon: "", image: "", url: "", description: "" };
type Errors = Partial<Record<"title" | "slug", string>>;

export default function PetProjectForm({ initial }: { initial?: PetProject }) {
  const [project, setProject] = useState<PetProject>(initial ?? empty);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [slugTouched, setSlugTouched] = useState(!!initial?.id);
  const router = useRouter();
  const { toast, confirm } = useFeedback();
  const isEdit = typeof project.id === "number";
  const { dirty, markSaved, revert, runSave } = useDirtyForm(project, save);

  const set = (patch: Partial<PetProject>) => setProject((p) => ({ ...p, ...patch }));
  const field = (name: keyof Errors) => (errors[name] ? `${styles.field} ${styles.fieldErr}` : styles.field);

  function setTitle(title: string) {
    setErrors((e) => ({ ...e, title: undefined }));
    setProject((p) => ({ ...p, title, slug: slugTouched ? p.slug : slugify(title) }));
  }

  async function save() {
    if (saving) return;
    const local: Errors = {};
    if (!project.title.trim()) local.title = "Required";
    if (!project.slug.trim()) local.slug = "Required";
    if (local.title || local.slug) {
      setErrors(local);
      return toast("Fill in the highlighted fields", "error");
    }
    setSaving(true);
    try {
      const res = await fetch(isEdit ? `/api/admin/pet-projects/${project.id}` : "/api/admin/pet-projects", {
        method: isEdit ? "PUT" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(project),
      });
      if (!res.ok) {
        const message = await apiError(res, "Save failed");
        setErrors(fieldError(message));
        return toast(message, "error");
      }
      setErrors({});
      if (isEdit) {
        markSaved(project);
        toast("Pet project saved");
        router.refresh();
      } else {
        const { id } = await res.json();
        const created = { ...project, id };
        setProject(created);
        markSaved(created);
        toast("Pet project created");
        router.replace(`/admin/pet-projects/${id}`);
      }
    } catch {
      toast("Network error, not saved", "error");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!(await confirm({ title: `Delete ${project.title || "this pet project"}?`, message: "This cannot be undone.", confirmLabel: "Delete", danger: true }))) return;
    try {
      const res = await fetch(`/api/admin/pet-projects/${project.id}`, { method: "DELETE" });
      if (!res.ok) return toast(await apiError(res, "Delete failed"), "error");
      markSaved(project);
      toast("Pet project deleted");
      router.push("/admin/pet-projects");
      router.refresh();
    } catch {
      toast("Network error, not deleted", "error");
    }
  }

  const slug = project.slug;
  return (
    <div className={styles.wrap}>
      <div className={styles.pagehead}>
        <div className={styles.pageheadInner}>
          <div>
            <Link href="/admin/pet-projects" className={styles.back}><ArrowLeftIcon aria-hidden /> Pet projects</Link>
            <h1>{isEdit ? project.title || "Edit pet project" : "New pet project"}</h1>
            <p className={styles.sub}>{project.url || "A new side project"}</p>
          </div>
          <div className={styles.actions}>
            {project.url && (
              <a className={`${styles.button} ${styles.secondary}`} href={project.url} target="_blank" rel="noreferrer">
                Open project <ArrowTopRightOnSquareIcon aria-hidden />
              </a>
            )}
          </div>
        </div>
      </div>

      <div className={styles.editor}>
        <div className={styles.editorMain}>
          <div className={styles.grid2}>
            <div className={field("title")}><label htmlFor="p-title">Title</label>
              <input id="p-title" value={project.title} onChange={(e) => setTitle(e.target.value)} aria-invalid={!!errors.title} />
              {errors.title && <span className={styles.fieldMsg}>{errors.title}</span>}</div>
            <div className={field("slug")}><label htmlFor="p-slug">Slug</label>
              <input id="p-slug" value={slug} aria-invalid={!!errors.slug}
                onChange={(e) => { setSlugTouched(true); setErrors((er) => ({ ...er, slug: undefined })); set({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, "-") }); }}
                onBlur={() => set({ slug: slugify(slug) })} />
              {errors.slug ? <span className={styles.fieldMsg}>{errors.slug}</span>
                : <span className={styles.help}>{slugTouched ? "A unique name for this project." : "Follows the title until you edit it."}</span>}</div>
          </div>
          <div className={styles.field}><label htmlFor="p-url">URL</label>
            <input id="p-url" value={project.url} placeholder="https://" onChange={(e) => set({ url: e.target.value })} /></div>
          <div className={styles.field}><label htmlFor="p-desc">Description</label>
            <textarea id="p-desc" rows={3} value={project.description} onChange={(e) => set({ description: e.target.value })} />
            <span className={styles.help}>{project.description.length} characters</span></div>
        </div>

        <aside className={styles.sidebar} aria-label="Project details">
          <div className={styles.scard}>
            <h3>Status</h3>
            <p className={styles.state} data-dirty={dirty}>{dirty ? "Unsaved changes" : isEdit ? "All changes saved" : "Not created yet"}</p>
            <p className={styles.help}>Pet projects are hidden on the public site for now.</p>
          </div>
          <div className={styles.scard}>
            <h3>Icon</h3>
            <ImageUploader value={project.icon} slug="pet-projects" label="" onChange={(icon) => set({ icon })} />
          </div>
          <div className={styles.scard}>
            <h3>Preview image</h3>
            <ImageUploader value={project.image} slug="pet-projects" label="" onChange={(image) => set({ image })} />
          </div>
          {isEdit && <button type="button" className={`${styles.button} ${styles.danger}`} onClick={remove}>Delete pet project</button>}
        </aside>
      </div>

      <SaveBar dirty={dirty} saving={saving} onSave={runSave} label={isEdit ? "Save" : "Create"} onDiscard={() => { setProject(revert()); setErrors({}); }} />
    </div>
  );
}
