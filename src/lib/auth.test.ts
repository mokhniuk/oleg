import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword, signSession, verifySession } from "./auth";

describe("password hashing", () => {
  it("verifies a correct password and rejects a wrong one", () => {
    const stored = hashPassword("hunter2");
    expect(stored).toMatch(/^[0-9a-f]+:[0-9a-f]+$/);
    expect(verifyPassword("hunter2", stored)).toBe(true);
    expect(verifyPassword("wrong", stored)).toBe(false);
  });
});

describe("session tokens", () => {
  const secret = "test-secret";
  it("accepts a valid unexpired token", () => {
    const token = signSession(secret, Date.now() + 10_000);
    expect(verifySession(token, secret, Date.now())).toBe(true);
  });
  it("rejects a tampered token", () => {
    const token = signSession(secret, Date.now() + 10_000);
    expect(verifySession(token + "x", secret, Date.now())).toBe(false);
  });
  it("rejects a token signed with a different secret", () => {
    const token = signSession(secret, Date.now() + 10_000);
    expect(verifySession(token, "other-secret", Date.now())).toBe(false);
  });
  it("rejects an expired token", () => {
    const token = signSession(secret, Date.now() - 1);
    expect(verifySession(token, secret, Date.now())).toBe(false);
  });
});
