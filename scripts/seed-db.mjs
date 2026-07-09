import crypto from "node:crypto";
import { createDb } from "../src/lib/db.ts";
import { getAllWorks, createWork } from "../src/lib/repositories/works.ts";
import { getAllPetProjects, createPetProject } from "../src/lib/repositories/petProjects.ts";
import { getAllDjEvents, createDjEvent } from "../src/lib/repositories/djEvents.ts";
import { getDjInfo, saveDjInfo } from "../src/lib/repositories/djInfo.ts";
import { getCv, saveCv } from "../src/lib/repositories/cv.ts";
import { getPasswordHash, setPasswordHash, getSessionSecret, setSessionSecret } from "../src/lib/repositories/settings.ts";

import { WORKS } from "../src/data/works.ts";
import { PET_PROJECTS } from "../src/data/pet-projects.ts";
import { DJ_INFO, DJ_EVENTS, DJ_PHOTOS, DJ_PARTNERS } from "../src/data/dj.ts";
import { CV, TOP_SKILLS } from "../src/data/cv.ts";

const dbPath = process.env.DATABASE_PATH || "data/portfolio.db";
const db = createDb(dbPath);

function scryptHash(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

// Works
if (getAllWorks(db).length === 0) {
  for (const w of WORKS) {
    createWork(
      {
        slug: w.slug ?? w.title.toLowerCase().replace(/\s+/g, "-"),
        title: w.title,
        description: w.description,
        synopsis: w.synopsis,
        bgColor: w.bgColor,
        categories: w.categories,
        link: w.link,
        link2: w.link2,
        show: w.show,
        featured: w.featured,
        inProgress: w.inProgress,
        caseStudy: w.caseStudy,
      },
      db
    );
  }
  console.log(`Seeded ${WORKS.length} works`);
} else {
  console.log("Works already present — skipping");
}

// Pet projects
if (getAllPetProjects(db).length === 0) {
  for (const p of PET_PROJECTS) {
    createPetProject(
      { slug: p.id, title: p.title, icon: p.icon, image: p.image, url: p.url, description: p.description },
      db
    );
  }
  console.log(`Seeded ${PET_PROJECTS.length} pet projects`);
} else {
  console.log("Pet projects already present — skipping");
}

// DJ events
if (getAllDjEvents(db).length === 0) {
  for (const e of DJ_EVENTS) {
    createDjEvent({ date: e.date, venue: e.venue, city: e.city, link: e.link }, db);
  }
  console.log(`Seeded ${DJ_EVENTS.length} DJ events`);
} else {
  console.log("DJ events already present — skipping");
}

// DJ info
if (!getDjInfo(db)) {
  saveDjInfo(
    {
      summary: DJ_INFO.summary,
      technicalRider: DJ_INFO.technicalRider,
      bookingEmail: DJ_INFO.bookingEmail,
      photos: DJ_PHOTOS,
      partners: DJ_PARTNERS,
    },
    db
  );
  console.log("Seeded DJ info");
} else {
  console.log("DJ info already present — skipping");
}

// CV
if (!getCv(db)) {
  saveCv({ topSkills: TOP_SKILLS, ...CV }, db);
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
