// Best-effort .env load for local runs (Node 20.12+). Harmless if .env or the API is missing.
try { process.loadEnvFile(); } catch {}

import crypto from "node:crypto";
import fs from "node:fs";

// Imports are dynamic so they run after the env is loaded (static imports are hoisted).
const { getPool, initSchema, rows } = await import("../src/lib/db.ts");
const { getAllWorks, createWork, updateWork } = await import("../src/lib/repositories/works.ts");
const { getAllPetProjects, createPetProject } = await import("../src/lib/repositories/petProjects.ts");
const { getAllDjEvents, createDjEvent } = await import("../src/lib/repositories/djEvents.ts");
const { getDjInfo, saveDjInfo } = await import("../src/lib/repositories/djInfo.ts");
const { getCv, saveCv } = await import("../src/lib/repositories/cv.ts");
const { getPasswordHash, setPasswordHash, getSessionSecret, setSessionSecret } = await import("../src/lib/repositories/settings.ts");

const data = JSON.parse(fs.readFileSync(new URL("./seed-data.json", import.meta.url), "utf8"));

function scryptHash(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

await initSchema();

// Works. SEED_UPDATE=1 also upserts by slug: overwrites matching works with seed-data.json
// (admin edits to those works are lost) and adds missing ones. Without it, an existing DB is untouched.
if ((await getAllWorks()).length === 0) {
  for (const w of data.works) await createWork(w);
  console.log(`Seeded ${data.works.length} works`);
} else if (process.env.SEED_UPDATE === "1") {
  const ids = new Map((await rows("SELECT id, slug FROM works")).map((r) => [r.slug, r.id]));
  for (const w of data.works) {
    const id = ids.get(w.slug);
    if (id) await updateWork(id, w);
    else await createWork(w);
  }
  console.log(`Upserted ${data.works.length} works (SEED_UPDATE=1)`);
} else {
  console.log("Works already present — skipping (set SEED_UPDATE=1 to overwrite by slug)");
}

// Pet projects
if ((await getAllPetProjects()).length === 0) {
  for (const p of data.petProjects) await createPetProject(p);
  console.log(`Seeded ${data.petProjects.length} pet projects`);
} else {
  console.log("Pet projects already present — skipping");
}

// DJ events
if ((await getAllDjEvents()).length === 0) {
  for (const e of data.djEvents) await createDjEvent(e);
  console.log(`Seeded ${data.djEvents.length} DJ events`);
} else {
  console.log("DJ events already present — skipping");
}

// DJ info
if (!(await getDjInfo())) {
  await saveDjInfo(data.djInfo);
  console.log("Seeded DJ info");
} else {
  console.log("DJ info already present — skipping");
}

// CV
if (!(await getCv())) {
  await saveCv(data.cv);
  console.log("Seeded CV");
} else {
  console.log("CV already present — skipping");
}

// Auth settings
if (!(await getPasswordHash())) {
  if (!process.env.ADMIN_PASSWORD) {
    console.error("ADMIN_PASSWORD is required to set the initial admin password");
    process.exit(1);
  }
  await setPasswordHash(scryptHash(process.env.ADMIN_PASSWORD));
  console.log("Set initial admin password");
}
if (!(await getSessionSecret())) {
  await setSessionSecret(crypto.randomBytes(32).toString("hex"));
  console.log("Generated session secret");
}

await getPool().end();
console.log("Seed complete.");
