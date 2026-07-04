import {
  mergeRequirements,
  type AdvisorRequirementSummary,
} from "@/lib/advisor/lightConversation";
import type { AgentExtractedFacts, CustomerAgentTurnPayload } from "@/lib/agent/schemas";

export async function requestAdvisorAgentTurn({
  message,
  summary,
  entryPage,
}: {
  message: string;
  summary: Partial<AdvisorRequirementSummary>;
  entryPage: "home" | "inquiry" | "advisor";
}) {
  const response = await fetch("/api/advisor/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      entryPage,
      currentFacts: advisorSummaryToAgentFacts(summary),
    }),
  });

  if (!response.ok) {
    throw new Error(`Advisor agent request failed: ${response.status}`);
  }

  return (await response.json()) as CustomerAgentTurnPayload;
}

export function advisorSummaryToAgentFacts(summary: Partial<AdvisorRequirementSummary>): AgentExtractedFacts {
  return {
    city: summary.eventCity,
    eventType: summary.eventType,
    attendeeCount: summary.attendeeCount,
    budgetRange: summary.budgetRange,
    requestedServices: summary.requestedServices,
    customerPriorityFocus: summary.consultationFocus ? [summary.consultationFocus] : undefined,
  };
}

export function mergeAgentPayloadIntoSummary(
  current: Partial<AdvisorRequirementSummary>,
  payload: CustomerAgentTurnPayload,
): AdvisorRequirementSummary {
  const focus = payload.customerPriorityFocus?.[0] ?? payload.extractedFacts.customerPriorityFocus?.[0];

  return mergeRequirements(current, {
    eventCity: payload.extractedFacts.city,
    eventType: payload.extractedFacts.eventType,
    attendeeCount: payload.extractedFacts.attendeeCount,
    budgetRange: payload.extractedFacts.budgetRange,
    consultationFocus: focus,
    requestedServices: payload.extractedFacts.requestedServices,
    locationFlexibility: payload.extractedFacts.city === "暂未确定" ? "undecided" : payload.extractedFacts.city ? "locked" : undefined,
  });
}
