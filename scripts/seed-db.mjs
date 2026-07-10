import crypto from "node:crypto";
import fs from "node:fs";
import { createDb } from "../src/lib/db.ts";
import { getAllWorks, createWork } from "../src/lib/repositories/works.ts";
import { getAllPetProjects, createPetProject } from "../src/lib/repositories/petProjects.ts";
import { getAllDjEvents, createDjEvent } from "../src/lib/repositories/djEvents.ts";
import { getDjInfo, saveDjInfo } from "../src/lib/repositories/djInfo.ts";
import { getCv, saveCv } from "../src/lib/repositories/cv.ts";
import { getPasswordHash, setPasswordHash, getSessionSecret, setSessionSecret } from "../src/lib/repositories/settings.ts";

const data = JSON.parse(fs.readFileSync(new URL("./seed-data.json", import.meta.url), "utf8"));

const dbPath = process.env.DATABASE_PATH || "data/portfolio.db";
const db = createDb(dbPath);

function scryptHash(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

// Works
if (getAllWorks(db).length === 0) {
  for (const w of data.works) {
    createWork(w, db);
  }
  console.log(`Seeded ${data.works.length} works`);
} else {
  console.log("Works already present — skipping");
}

// Pet projects
if (getAllPetProjects(db).length === 0) {
  for (const p of data.petProjects) {
    createPetProject(p, db);
  }
  console.log(`Seeded ${data.petProjects.length} pet projects`);
} else {
  console.log("Pet projects already present — skipping");
}

// DJ events
if (getAllDjEvents(db).length === 0) {
  for (const e of data.djEvents) {
    createDjEvent(e, db);
  }
  console.log(`Seeded ${data.djEvents.length} DJ events`);
} else {
  console.log("DJ events already present — skipping");
}

// DJ info
if (!getDjInfo(db)) {
  saveDjInfo(data.djInfo, db);
  console.log("Seeded DJ info");
} else {
  console.log("DJ info already present — skipping");
}

// CV
if (!getCv(db)) {
  saveCv(data.cv, db);
  console.log("Seeded CV");
} else {
  console.log("CV already present — skipping");
}

// Auth settings
if (!getPasswordHash(db)) {
  setPasswordHash(scryptHash(process.env.ADMIN_PASSWORD || "changeme"), db);
  console.log("Set initial admin password");
}
if (!getSessionSecret(db)) {
  setSessionSecret(crypto.randomBytes(32).toString("hex"), db);
  console.log("Generated session secret");
}

console.log("Seed complete:", dbPath);
