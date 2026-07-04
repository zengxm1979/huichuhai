import { describe, expect, it } from "vitest";
import { mockResources } from "@/content/mockResources";

describe("resource content candidate fields", () => {
  it("uses Phase 2 content statuses and structured authorization values", () => {
    expect(mockResources.length).toBeGreaterThan(0);
    expect(mockResources.map((resource) => resource.contentStatus)).toEqual(
      expect.arrayContaining(["draft", "needs_review", "verified", "public_ready"]),
    );
    expect(mockResources.every((resource) => Array.isArray(resource.cityContentTags))).toBe(true);
    expect(mockResources.every((resource) => Array.isArray(resource.commonUseCases))).toBe(true);
    expect(mockResources.every((resource) => Array.isArray(resource.faqSeeds))).toBe(true);
    expect(
      mockResources.every((resource) =>
        ["unknown", "internal_only", "public_approved", "needs_replacement"].includes(
          resource.imageAuthorizationStatus,
        ),
      ),
    ).toBe(true);
    expect(
      mockResources.every((resource) =>
        ["none", "anonymous_candidate", "named_candidate", "approved"].includes(resource.casePotential),
      ),
    ).toBe(true);
  });
});
