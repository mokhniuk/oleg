import path from "node:path";

/** Baked-in media shipped with the image/repo: <cwd>/public/projects. */
export function bakedProjectsDir(): string {
  return path.join(process.cwd(), "public", "projects");
}

/**
 * Writable directory for admin uploads (a persistent volume in production).
 * Read per call so tests and deploys can change UPLOAD_DIR.
 */
export function uploadDir(): string {
  const dir = process.env.UPLOAD_DIR;
  return dir ? path.resolve(dir) : bakedProjectsDir();
}
