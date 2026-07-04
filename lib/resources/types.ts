export type ResourceType =
  | "venue"
  | "banquet"
  | "materials"
  | "av"
  | "transfer"
  | "accommodation"
  | "interpretation"
  | "photo_video";

export type QuoteRequestType =
  | "venue_availability"
  | "banquet_menu"
  | "materials_production"
  | "av_stage"
  | "transport_schedule"
  | "room_block";

export type Currency = "CNY" | "MYR" | "USD";

export type ResourceContentStatus = "draft" | "needs_review" | "verified" | "public_ready";

export type ImageAuthorizationStatus = "unknown" | "internal_only" | "public_approved" | "needs_replacement";

export type CasePotential = "none" | "anonymous_candidate" | "named_candidate" | "approved";

export type ResourceMaster = {
  id: string;
  resourceType: ResourceType;
  resourceName: string;
  supplierName: string;
  city: string;
  district: string;
  serviceScope: string[];
  suitableScenarios: string[];
  capacityOrSpec: string;
  referencePriceMin: number;
  referencePriceMax: number;
  currency: Currency;
  pricingUnit: string;
  priceScopeNote: string;
  seasonalityRule: string;
  dateConflictSensitivity: "low" | "medium" | "high";
  minimumOrderRequirement: string;
  leadTimeRequirement: string;
  requiresQuoteConfirmation: boolean;
  strategicCooperationLevel: "strategic" | "preferred" | "candidate";
  agreementStatus: "active" | "pending" | "expired" | "mock";
  customerVisibleSummary: string;
  publicSummaryDraft: string;
  publicContentNotes: string;
  commonUseCases: string[];
  cityContentTags: string[];
  faqSeeds: string[];
  casePotential: CasePotential;
  imageAuthorizationStatus: ImageAuthorizationStatus;
  internalNegotiationNote: string;
  internalRiskNote: string;
  contentStatus: ResourceContentStatus;
  lastVerifiedAt: string;
};

export type InquiryQuoteRequest = {
  id: string;
  inquiryId: string;
  customerName: string;
  companyName: string;
  resourceMasterId: string;
  quoteRequestType: QuoteRequestType;
  eventType: string;
  eventDateStart: string;
  eventDateEnd: string;
  attendeeCount: number;
  customerBudgetRange: string;
  requestedServices: string[];
  requestedRoomNights?: number;
  requestedBanquetLevel?: string;
  requestedMaterialsScope?: string;
  requestedTransportScope?: string;
  availabilityStatus: "waiting_supplier" | "available" | "limited" | "unavailable";
  quotedPriceMin?: number;
  quotedPriceMax?: number;
  currency: Currency;
  seasonalityNote: string;
  conflictNote: string;
  supplierResponseSummary: string;
  paymentTermSummary: string;
  cancellationTermSummary: string;
  customerVisibleQuoteSummary: string;
  operatorFollowupNote: string;
  quoteStatus: "waiting_supplier" | "quoted" | "limited" | "unavailable" | "expired" | "confirmed";
  quotedBy?: string;
  quotedAt?: string;
  expiresAt?: string;
};

export type CustomerResourceSummary = {
  id: string;
  resourceType: ResourceType;
  resourceName: string;
  city: string;
  district: string;
  serviceScope: string[];
  suitableScenarios: string[];
  capacityOrSpec: string;
  referencePriceLabel: string;
  priceScopeNote: string;
  seasonalityRule: string;
  leadTimeRequirement: string;
  requiresQuoteConfirmation: boolean;
  customerVisibleSummary: string;
  lastVerifiedAt: string;
};

export type CustomerQuoteRequestPayload = {
  id: string;
  inquiryId: string;
  resourceMasterId: string;
  resourceName?: string;
  quoteRequestType: QuoteRequestType;
  eventType: string;
  eventDateStart: string;
  eventDateEnd: string;
  attendeeCount: number;
  requestedServices: string[];
  availabilityStatus: InquiryQuoteRequest["availabilityStatus"];
  quoteStatus: InquiryQuoteRequest["quoteStatus"];
  quotedPriceLabel: string;
  customerVisibleQuoteSummary: string;
  seasonalityNote: string;
  paymentTermSummary: string;
  cancellationTermSummary: string;
  customerNotice: string;
};
