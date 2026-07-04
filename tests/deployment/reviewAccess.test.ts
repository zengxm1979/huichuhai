import { describe, expect, it } from "vitest";
import { DEFAULT_OPS_REVIEW_TOKEN, getOpsPreviewToken } from "@/lib/deployment/reviewAccess";

describe("review access token", () => {
  it("uses the approved review token fallback instead of the old preview token", () => {
    expect(DEFAULT_OPS_REVIEW_TOKEN).toBe("hch-review-202607");
    expect(getOpsPreviewToken({})).toBe("hch-review-202607");
    expect(getOpsPreviewToken({ OPS_PREVIEW_TOKEN: "  custom-token  " })).toBe("custom-token");
    const oldPreviewToken = ["huichuhai", "ops", "preview"].join("-");
    expect(getOpsPreviewToken({})).not.toBe(oldPreviewToken);
  });
});
