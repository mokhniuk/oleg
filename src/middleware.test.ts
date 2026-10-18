import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { middleware } from "./middleware";

const req = (path: string, headers: Record<string, string> = {}) =>
  new NextRequest(`http://test${path}`, { headers });

// Next forwards modified request headers to the app as `x-middleware-request-<name>`.
const forwarded = (res: Response, name: string) => res.headers.get(`x-middleware-request-${name}`);
const overridden = (res: Response) => (res.headers.get("x-middleware-override-headers") ?? "").split(",");

describe("middleware", () => {
  it("marks login routes public", () => {
    expect(forwarded(middleware(req("/admin/login")), "x-admin-public")).toBe("1");
  });

  it("never lets a client-sent x-admin-public through on other admin pages", () => {
    const res = middleware(req("/admin/cv", { cookie: "admin_session=garbage", "x-admin-public": "1" }));
    expect(forwarded(res, "x-admin-public")).toBeNull();
    expect(overridden(res)).not.toContain("x-admin-public");
  });

  it("redirects pages and 401s APIs without a cookie", async () => {
    expect(middleware(req("/admin/cv")).status).toBe(307);
    expect(middleware(req("/api/admin/works")).status).toBe(401);
  });
});
