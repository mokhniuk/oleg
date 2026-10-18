import crypto from "node:crypto";
import fs from "node:fs";
import { getPool, initSchema } from "../src/lib/db.ts";
import { getAllWorks, createWork } from "../src/lib/repositories/works.ts";
import { getAllPetProjects, createPetProject } from "../src/lib/repositories/petProjects.ts";
import { getAllDjEvents, createDjEvent } from "../src/lib/repositories/djEvents.ts";
import { getDjInfo, saveDjInfo } from "../src/lib/repositories/djInfo.ts";
import { getCv, saveCv } from "../src/lib/repositories/cv.ts";
import { getPasswordHash, setPasswordHash, getSessionSecret, setSessionSecret } from "../src/lib/repositories/settings.ts";

const data = JSON.parse(fs.readFileSync(new URL("./seed-data.json", import.meta.url), "utf8"));

function scryptHash(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

await initSchema();

// Works
if ((await getAllWorks()).length === 0) {
  for (const w of data.works) await createWork(w);
  console.log(`Seeded ${data.works.length} works`);
} else {
  console.log("Works already present — skipping");
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
