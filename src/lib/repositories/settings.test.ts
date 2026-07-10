import { describe, it, expect, beforeEach } from "vitest";
import { dbAvailable, resetDb } from "./testHelpers";
import { getPasswordHash, setPasswordHash, getSessionSecret, setSessionSecret } from "./settings";

const available = await dbAvailable();

describe.skipIf(!available)("settings repository", () => {
  beforeEach(resetDb);

  it("stores password hash and session secret independently", async () => {
    expect(await getPasswordHash()).toBeNull();
    await setPasswordHash("hash1");
    expect(await getPasswordHash()).toBe("hash1");
    await setSessionSecret("secret1");
    expect(await getSessionSecret()).toBe("secret1");
    expect(await getPasswordHash()).toBe("hash1"); // unaffected
    await setPasswordHash("hash2");
    expect(await getPasswordHash()).toBe("hash2");
  });
});
