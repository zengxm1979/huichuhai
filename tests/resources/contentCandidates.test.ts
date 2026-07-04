import { describe, expect, it } from "vitest";
import { mockResources } from "@/content/mockResources";
import {
  buildContentCandidateSummary,
  canMarkPublicReady,
  deriveContentCandidateGaps,
} from "@/lib/resources/contentCandidates";

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

describe("content candidate summaries", () => {
  it("derives missing material gaps from resource content fields", () => {
    const resource = {
      ...mockResources[0],
      cityContentTags: [],
      commonUseCases: [],
      faqSeeds: [],
      imageAuthorizationStatus: "unknown" as const,
      publicSummaryDraft: "",
      publicContentNotes: "",
      contentStatus: "draft" as const,
    };

    expect(deriveContentCandidateGaps(resource)).toEqual(
      expect.arrayContaining([
        "missing_city_tags",
        "missing_use_cases",
        "missing_faq_seeds",
        "missing_public_summary",
        "missing_public_notes",
        "missing_image_authorization",
        "needs_chris_review",
      ]),
    );
  });

  it("blocks public_ready when image authorization is not public approved", () => {
    const resource = {
      ...mockResources[0],
      imageAuthorizationStatus: "needs_replacement" as const,
      contentStatus: "verified" as const,
    };

    expect(canMarkPublicReady(resource)).toBe(false);
  });

  it("builds a summary without supplier or internal notes", () => {
    const summary = buildContentCandidateSummary(mockResources[0]);
    const serialized = JSON.stringify(summary);

    expect(serialized).not.toContain("supplierName");
    expect(serialized).not.toContain("internalNegotiationNote");
    expect(serialized).not.toContain("internalRiskNote");
    expect(summary.resourceName).toBe(mockResources[0].resourceName);
  });
});
