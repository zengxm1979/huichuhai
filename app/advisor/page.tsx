import { AdvisorPanel } from "@/components/advisor/AdvisorPanel";
import { getCustomerAdvisorState } from "@/lib/advisor/mockAdvisorFlow";
import type { AdvisorStep } from "@/lib/advisor/types";

const allowedStates: AdvisorStep[] = ["initial", "configuration", "budgetMismatch", "submit"];

export default async function AdvisorPage({
  searchParams,
}: {
  searchParams: Promise<{ state?: string }>;
}) {
  const params = await searchParams;
  const step = allowedStates.includes(params.state as AdvisorStep) ? (params.state as AdvisorStep) : "initial";
  const state = getCustomerAdvisorState(step);

  return <AdvisorPanel state={state} />;
}
