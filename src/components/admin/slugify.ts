export const slugify = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

/** Splits `{error: "title is required"}`-style API messages onto the field they belong to. */
export function fieldError(message: string): Partial<Record<"title" | "slug", string>> {
  const m = /^(title|slug) is required/.exec(message);
  if (m) return { [m[1]]: "Required" };
  if (/slug/i.test(message)) return { slug: message };
  return {};
}
