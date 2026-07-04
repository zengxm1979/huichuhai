import { AdvisorPanel } from "@/components/advisor/AdvisorPanel";
import { applyAdvisorSearchParamsToCustomerState, type AdvisorSearchParams } from "@/lib/advisor/advisorUrlState";
import { getCustomerAdvisorState } from "@/lib/advisor/mockAdvisorFlow";
import type { AdvisorStep } from "@/lib/advisor/types";

const allowedStates: AdvisorStep[] = ["initial", "configuration", "budgetMismatch", "submit"];

export default async function AdvisorPage({
  searchParams,
}: {
  searchParams: Promise<AdvisorSearchParams>;
}) {
  const params = await searchParams;
  const step = allowedStates.includes(params.state as AdvisorStep) ? (params.state as AdvisorStep) : "initial";
  const state = applyAdvisorSearchParamsToCustomerState(getCustomerAdvisorState(step), params);
  const panelKey = [step, params.city, params.eventType, params.attendeeCount, params.budgetRange].filter(Boolean).join(":");

  return <AdvisorPanel key={panelKey} state={state} />;
}
