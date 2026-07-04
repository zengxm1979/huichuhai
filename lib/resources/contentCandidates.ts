import type { ResourceContentStatus, ResourceMaster } from "@/lib/resources/types";

export type ContentCandidateGap =
  | "missing_city_tags"
  | "missing_use_cases"
  | "missing_faq_seeds"
  | "missing_public_summary"
  | "missing_public_notes"
  | "missing_image_authorization"
  | "needs_chris_review"
  | "missing_reference_price";

export type ContentCandidateSummary = {
  id: string;
  resourceName: string;
  resourceType: ResourceMaster["resourceType"];
  city: string;
  district: string;
  publicSummaryDraft: string;
  publicContentNotes: string;
  commonUseCases: string[];
  cityContentTags: string[];
  faqSeeds: string[];
  casePotential: ResourceMaster["casePotential"];
  imageAuthorizationStatus: ResourceMaster["imageAuthorizationStatus"];
  contentStatus: ResourceContentStatus;
  gaps: ContentCandidateGap[];
};

export function deriveContentCandidateGaps(resource: ResourceMaster): ContentCandidateGap[] {
  const gaps: ContentCandidateGap[] = [];

  if (resource.cityContentTags.length === 0) gaps.push("missing_city_tags");
  if (resource.commonUseCases.length === 0) gaps.push("missing_use_cases");
  if (resource.faqSeeds.length === 0) gaps.push("missing_faq_seeds");
  if (resource.publicSummaryDraft.trim().length === 0) gaps.push("missing_public_summary");
  if (resource.publicContentNotes.trim().length === 0) gaps.push("missing_public_notes");
  if (resource.imageAuthorizationStatus !== "public_approved") gaps.push("missing_image_authorization");
  if (resource.contentStatus === "draft" || resource.contentStatus === "needs_review") gaps.push("needs_chris_review");
  if (resource.referencePriceMin <= 0 || resource.referencePriceMax <= 0) gaps.push("missing_reference_price");

  return gaps;
}

export function canMarkPublicReady(resource: ResourceMaster): boolean {
  return deriveContentCandidateGaps(resource).length === 0;
}

export function nextContentStatus(resource: ResourceMaster, requested: ResourceContentStatus): ResourceContentStatus {
  if (requested === "public_ready" && !canMarkPublicReady(resource)) {
    return resource.contentStatus;
  }

  return requested;
}

export function buildContentCandidateSummary(resource: ResourceMaster): ContentCandidateSummary {
  return {
    id: resource.id,
    resourceName: resource.resourceName,
    resourceType: resource.resourceType,
    city: resource.city,
    district: resource.district,
    publicSummaryDraft: resource.publicSummaryDraft,
    publicContentNotes: resource.publicContentNotes,
    commonUseCases: resource.commonUseCases,
    cityContentTags: resource.cityContentTags,
    faqSeeds: resource.faqSeeds,
    casePotential: resource.casePotential,
    imageAuthorizationStatus: resource.imageAuthorizationStatus,
    contentStatus: resource.contentStatus,
    gaps: deriveContentCandidateGaps(resource),
  };
}
