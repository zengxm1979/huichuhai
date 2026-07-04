import type { AdvisorRequirementSummary } from "@/lib/advisor/lightConversation";
import type { CustomerAdvisorState } from "@/lib/advisor/types";

export type AdvisorSearchParams = {
  state?: string;
  city?: string;
  eventType?: string;
  attendeeCount?: string;
  budgetRange?: string;
  services?: string;
  eventDate?: string;
};

export function buildAdvisorConfigurationHref(summary: Partial<AdvisorRequirementSummary>) {
  const params = new URLSearchParams({ state: "configuration" });

  if (summary.eventCity) params.set("city", summary.eventCity);
  if (summary.eventType) params.set("eventType", summary.eventType);
  if (summary.attendeeCount) params.set("attendeeCount", String(summary.attendeeCount));
  if (summary.budgetRange) params.set("budgetRange", summary.budgetRange);
  if (summary.eventDate) params.set("eventDate", summary.eventDate);
  if (summary.requestedServices?.length) params.set("services", summary.requestedServices.join(","));

  return `/advisor?${params.toString()}`;
}

export function applyAdvisorSearchParamsToCustomerState(
  state: CustomerAdvisorState,
  params: AdvisorSearchParams,
): CustomerAdvisorState {
  const attendeeCount = parseAttendeeCount(params.attendeeCount);

  return {
    ...state,
    inquiry: {
      ...state.inquiry,
      city: params.city ?? state.inquiry.city,
      eventType: params.eventType ?? state.inquiry.eventType,
      attendeeCount: attendeeCount ?? state.inquiry.attendeeCount,
      budgetRange: params.budgetRange ?? state.inquiry.budgetRange,
      eventStartDate: params.eventDate ?? state.inquiry.eventStartDate,
    },
  };
}

function parseAttendeeCount(value?: string) {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}
