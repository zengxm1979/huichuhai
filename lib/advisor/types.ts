import type { PackageTierId, PackageTierLabel } from "@/lib/constants/packageTiers";

export type CustomerStatus = "draft" | "ready_to_submit" | "submitted" | "consultant_confirming";

export type ServiceSelectionStatus =
  | "required"
  | "selected"
  | "optional"
  | "removed"
  | "pending_confirm";

export type AdvisorStep = "initial" | "configuration" | "budgetMismatch" | "submit";

export type ServiceSelection = {
  id: string;
  category: string;
  itemName: string;
  unit: string;
  quantity: number;
  selectionStatus: ServiceSelectionStatus;
  unitPriceMin?: number;
  unitPriceMax?: number;
  subtotalMin?: number;
  subtotalMax?: number;
  customerPreference?: string;
  tradeoffNote?: string;
  requiresHumanConfirmation: boolean;
};

export type CustomerAdvisorState = {
  step: AdvisorStep;
  inquiry: {
    company?: string;
    contactName?: string;
    phone?: string;
    whatsapp?: string;
    wechat?: string;
    email?: string;
    eventType?: string;
    eventStartDate?: string;
    eventEndDate?: string;
    city?: string;
    attendeeCount?: number;
    budgetRange?: string;
    budgetPreference?: PackageTierLabel | "自定义";
    selectedPackage?: PackageTierLabel | "自定义";
    customerStatus: CustomerStatus;
  };
  serviceSelections: ServiceSelection[];
  budgetEstimate?: {
    title: string;
    currency: "CNY" | "MYR";
    selectedPackage: PackageTierLabel | "自定义";
    totalMin: number;
    totalMax: number;
    customerMatchSummary: string;
    assumptions: string[];
    exclusions: string[];
    requiresHumanConfirmation: string[];
  };
  nextActions: Array<{
    label: string;
    action: "continue_adjusting" | "submit_to_advisor" | "confirm_missing_info";
  }>;
};

export type InternalAdvisorState = CustomerAdvisorState & {
  internal: {
    authenticityScore: number;
    intentScore: number;
    leadPriority: "urgent" | "high" | "medium" | "low";
    budgetRisks: string[];
    riskFlags: string[];
    recommendedNextAction: string;
    recommendedFollowupFocus: string;
    recommendedReply: string;
  };
};

export type PackageTierView = {
  id: PackageTierId;
  label: PackageTierLabel;
  description: string;
};
