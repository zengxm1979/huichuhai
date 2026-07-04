import { describe, expect, it } from "vitest";
import { POST } from "@/app/ops/login/session/route";
import { OPS_REVIEW_SESSION_COOKIE } from "@/lib/deployment/reviewAccess";

function formRequest(body: Record<string, string>, headers: Record<string, string> = {}) {
  const params = new URLSearchParams(body);
  return new Request("https://hch.ideaegg.com.cn/ops/login/session", {
    body: params,
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      ...headers,
    },
    method: "POST",
  });
}

describe("ops login route", () => {
  it("sets the ops review session cookie on a 200 completion page", async () => {
    const response = await POST(
      formRequest({
        next: "/ops/content-candidates",
        password: "hch-ops-202607",
      }),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
    expect(response.headers.get("content-type")).toContain("text/html");

    const html = await response.text();
    expect(html).toContain('window.location.replace("/ops/content-candidates")');
    expect(html).toContain('url=/ops/content-candidates');

    const setCookie = response.headers.get("set-cookie") ?? "";
    expect(setCookie).toContain(`${OPS_REVIEW_SESSION_COOKIE}=`);
    expect(setCookie).toContain("HttpOnly");
    expect(setCookie).toContain("Path=/ops");
    expect(setCookie.toLowerCase()).toContain("samesite=lax");
  });

  it("redirects invalid passwords back to login without setting a session cookie", async () => {
    const response = await POST(
      formRequest({
        next: "/ops/content-candidates",
        password: "wrong-password",
      }),
    );

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe(
      "https://hch.ideaegg.com.cn/ops/login?error=1&next=%2Fops%2Fcontent-candidates",
    );
    expect(response.headers.get("set-cookie")).toBeNull();
  });

  it("uses forwarded host headers for failed login redirect origin", async () => {
    const response = await POST(
      new Request("http://localhost:3000/ops/login/session", {
        body: new URLSearchParams({
          next: "/ops/resources",
          password: "wrong-password",
        }),
        headers: {
          "content-type": "application/x-www-form-urlencoded",
          "x-forwarded-host": "hch.ideaegg.com.cn",
          "x-forwarded-proto": "https",
        },
        method: "POST",
      }),
    );

    expect(response.headers.get("location")).toBe("https://hch.ideaegg.com.cn/ops/login?error=1&next=%2Fops%2Fresources");
  });
});
