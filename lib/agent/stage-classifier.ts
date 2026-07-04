import type { AdvisorStage, AgentExtractedFacts } from "@/lib/agent/schemas";

export function classifyAdvisorStage(facts: AgentExtractedFacts, message: string): AdvisorStage {
  if (isExplicitHandoffRequest(message) && hasStructuringFacts(facts)) return "handoff_ready";
  if (hasStructuringFacts(facts)) return "structuring";
  if (facts.city || facts.eventType || facts.customerPriorityFocus?.length || isConsultativeQuestion(message)) return "exploring";
  return "orientation";
}

export function hasStructuringFacts(facts: AgentExtractedFacts) {
  return Boolean(facts.city && facts.city !== "暂未确定" && facts.eventType && facts.attendeeCount && facts.budgetRange);
}

export function isExplicitHandoffRequest(message: string) {
  return /顾问|人工|联系|确认正式报价|提交|合同|付款|档期|尽快/.test(message);
}

function isConsultativeQuestion(message: string) {
  return /建议|方案|怎么|如何|适合|比较|可以|推荐/.test(message);
}
