import { isExplicitHandoffRequest } from "@/lib/agent/stage-classifier";
import type { AgentExtractedFacts, AdvisorStage } from "@/lib/agent/schemas";

export function shouldNotifyOperator(stage: AdvisorStage, facts: AgentExtractedFacts, message: string) {
  return stage === "handoff_ready" || (isExplicitHandoffRequest(message) && Boolean(facts.city && facts.eventType));
}
