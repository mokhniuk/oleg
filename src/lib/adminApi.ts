import { NextResponse } from "next/server";

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function readJson<T>(req: Request): Promise<T> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new HttpError(400, "Invalid JSON body");
  }
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    throw new HttpError(400, "JSON body must be an object");
  }
  return body as T;
}

/** Throws 400 unless every listed field is a non-empty string. */
export function requireStrings(body: object, fields: string[]): void {
  const record = body as Record<string, unknown>;
  for (const f of fields) {
    const v = record[f];
    if (typeof v !== "string" || !v.trim()) throw new HttpError(400, `${f} is required`);
  }
}

export function parseId(raw: string): number {
  const id = Number(raw);
  if (!Number.isInteger(id) || id < 1) throw new HttpError(400, "Invalid id");
  return id;
}

/** Throws 404 when an update/delete matched no row. */
export function assertFound(found: boolean): void {
  if (!found) throw new HttpError(404, "Not found");
}

/** Optional fields must be arrays of strings when present. */
export function requireStringArray(body: object, field: string): void {
  const v = (body as Record<string, unknown>)[field];
  if (v !== undefined && !(Array.isArray(v) && v.every((x) => typeof x === "string"))) {
    throw new HttpError(400, `${field} must be an array of strings`);
  }
}

/** Maps thrown errors to JSON responses the admin UI shows in a toast. */
export function errorResponse(e: unknown): NextResponse {
  if (e instanceof HttpError) return NextResponse.json({ error: e.message }, { status: e.status });
  if ((e as { code?: string })?.code === "ER_DUP_ENTRY") {
    return NextResponse.json({ error: "That slug already exists" }, { status: 409 });
  }
  console.error(e);
  return NextResponse.json({ error: "Server error" }, { status: 500 });
}
