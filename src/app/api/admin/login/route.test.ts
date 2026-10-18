import { describe, it, expect, beforeEach } from "vitest";
import { dbAvailable, resetDb } from "@/lib/repositories/testHelpers";
import { setPasswordHash, setSessionSecret } from "@/lib/repositories/settings";
import { hashPassword } from "@/lib/auth";
import { POST } from "./route";

const available = await dbAvailable();
let n = 0;
const attempt = (password: unknown, ip: string) =>
  POST(new Request("http://test", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify({ password }),
  }));

describe.skipIf(!available)("login route", () => {
  beforeEach(async () => {
    await resetDb();
    await setPasswordHash(hashPassword("right"));
    await setSessionSecret("secret");
    n++;
  });

  it("401 (not 500) for non-string passwords", async () => {
    expect((await attempt(123, `1.1.1.${n}`)).status).toBe(401);
    expect((await attempt({}, `1.1.1.${n}`)).status).toBe(401);
  });

  it("locks out after repeated failures, and a success clears the count", async () => {
    const ip = `2.2.2.${n}`;
    for (let i = 0; i < 4; i++) expect((await attempt("wrong", ip)).status).toBe(401);
    expect((await attempt("right", ip)).status).toBe(200);
    for (let i = 0; i < 5; i++) await attempt("wrong", ip);
    expect((await attempt("right", ip)).status).toBe(429);
  });
});
