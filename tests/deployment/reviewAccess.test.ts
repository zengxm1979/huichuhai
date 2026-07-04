import { describe, expect, it } from "vitest";
import {
  DEFAULT_OPS_REVIEW_PASSWORD,
  DEFAULT_OPS_REVIEW_TOKEN,
  OPS_REVIEW_SESSION_COOKIE,
  createOpsSessionValue,
  getOpsAccessState,
  getOpsPreviewToken,
  getOpsReviewPassword,
  isOpsReviewPassword,
  sanitizeOpsNextPath,
} from "@/lib/deployment/reviewAccess";

describe("review access token", () => {
  it("uses the approved review token fallback instead of the old preview token", () => {
    expect(DEFAULT_OPS_REVIEW_TOKEN).toBe("hch-review-202607");
    expect(getOpsPreviewToken({})).toBe("hch-review-202607");
    expect(getOpsPreviewToken({ OPS_PREVIEW_TOKEN: "  custom-token  " })).toBe("custom-token");
    const oldPreviewToken = ["huichuhai", "ops", "preview"].join("-");
    expect(getOpsPreviewToken({})).not.toBe(oldPreviewToken);
  });

  it("uses an environment-controlled review password fallback", () => {
    expect(DEFAULT_OPS_REVIEW_PASSWORD).toBe("hch-ops-202607");
    expect(getOpsReviewPassword({})).toBe("hch-ops-202607");
    expect(getOpsReviewPassword({ OPS_REVIEW_PASSWORD: "  custom-password  " })).toBe("custom-password");
    expect(isOpsReviewPassword("custom-password", { OPS_REVIEW_PASSWORD: "custom-password" })).toBe(true);
    expect(isOpsReviewPassword("wrong", { OPS_REVIEW_PASSWORD: "custom-password" })).toBe(false);
  });

  it("authorizes ops access by cookie session or legacy token only", () => {
    const env = {
      OPS_PREVIEW_TOKEN: "token-for-review",
      OPS_REVIEW_PASSWORD: "password-for-review",
    };
    const sessionValue = createOpsSessionValue(env);

    expect(OPS_REVIEW_SESSION_COOKIE).toBe("hch_ops_review_session");
    expect(getOpsAccessState({ sessionCookie: sessionValue }, env)).toBe("authenticated");
    expect(getOpsAccessState({ token: "token-for-review" }, env)).toBe("token");
    expect(getOpsAccessState({ sessionCookie: "bad-cookie" }, env)).toBe("denied");
    expect(getOpsAccessState({}, env)).toBe("denied");
  });

  it("keeps ops login redirects inside the internal ops area", () => {
    expect(sanitizeOpsNextPath("/ops/resources")).toBe("/ops/resources");
    expect(sanitizeOpsNextPath("/ops/quote-requests")).toBe("/ops/quote-requests");
    expect(sanitizeOpsNextPath("/")).toBe("/ops/resources");
    expect(sanitizeOpsNextPath("https://example.com/ops/resources")).toBe("/ops/resources");
    expect(sanitizeOpsNextPath("/ops/login")).toBe("/ops/resources");
  });
});
