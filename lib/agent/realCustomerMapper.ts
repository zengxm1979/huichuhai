import type { AgentExtractedFacts, AdvisorAnswerStrategy, CustomerAgentTurnPayload } from "@/lib/agent/schemas";
import type { RealAdvisorAgentTurnResult, RealAdvisorStage } from "@/lib/agent/realSchemas";

export function mapRealAgentTurnToCustomerPayload(result: RealAdvisorAgentTurnResult): CustomerAgentTurnPayload {
  const reply = [result.replyToCustomer, result.followupQuestion].filter(Boolean).join("\n\n");
  const extractedFacts = mapExtractedFacts(result);

  return {
    stage: result.stage,
    understoodIntent: result.extractedFacts.eventIntent ?? result.extractedFacts.eventType ?? "轻咨询",
    extractedFacts,
    customerGoalSummary: buildCustomerGoalSummary(result),
    customerPriorityFocus: result.extractedFacts.eventIntent ? [result.extractedFacts.eventIntent] : undefined,
    regionPreferenceSummary: result.extractedFacts.city
      ? `${result.extractedFacts.city}${result.extractedFacts.region ? ` / ${result.extractedFacts.region}` : ""}`
      : undefined,
    answerStrategy: answerStrategyFor(result),
    reply,
    followupQuestion: result.followupQuestion,
    canEnterConfigurator: result.canEnterConfigurator,
    progressLabel: progressLabelForRealStage(result.stage),
    summaryRows: [
      { label: "咨询进度", value: progressLabelForRealStage(result.stage) },
      { label: "活动意图", value: result.extractedFacts.eventType ?? "待确认" },
      { label: "倾向地点", value: result.extractedFacts.city ?? "待确认" },
      {
        label: "关注重点",
        value: result.extractedFacts.requestedServices?.length
          ? result.extractedFacts.requestedServices.join("、")
          : result.extractedFacts.eventIntent ?? "待确认",
      },
      {
        label: "大致规模",
        value: result.extractedFacts.attendeeCount ? `${result.extractedFacts.attendeeCount} 人` : "待确认",
      },
      {
        label: "预算理解",
        value: result.extractedFacts.budgetRange ?? result.budgetUnderstanding?.customerVisibleSummary ?? "待确认",
      },
    ],
  };
}

function mapExtractedFacts(result: RealAdvisorAgentTurnResult): AgentExtractedFacts {
  return {
    city: result.extractedFacts.city,
    eventType: result.extractedFacts.eventType,
    attendeeCount: result.extractedFacts.attendeeCount,
    budgetRange: result.extractedFacts.budgetRange,
    scaleBand: result.extractedFacts.scaleBand === "undetermined" ? undefined : result.extractedFacts.scaleBand,
    requestedServices: result.extractedFacts.requestedServices,
    customerPriorityFocus: result.extractedFacts.eventIntent ? [result.extractedFacts.eventIntent] : undefined,
  };
}

function buildCustomerGoalSummary(result: RealAdvisorAgentTurnResult) {
  const parts = [
    result.extractedFacts.city,
    result.extractedFacts.eventType,
    result.extractedFacts.attendeeCount ? `${result.extractedFacts.attendeeCount} 人` : undefined,
    result.extractedFacts.budgetRange,
  ].filter(Boolean);

  return parts.length ? parts.join(" / ") : "轻咨询阶段，先判断方向。";
}

function answerStrategyFor(result: RealAdvisorAgentTurnResult): AdvisorAnswerStrategy {
  if (result.recommendedNextAction === "handoff_to_operator") return "handoff_to_operator";
  if (result.recommendedNextAction === "enter_configurator") return "enter_configurator";
  if (result.recommendedNextAction === "compare_options") return "compare_options";
  if (result.recommendedNextAction === "ask_one_question") return "ask_one_question";
  return "explain_first";
}

function progressLabelForRealStage(stage: RealAdvisorStage) {
  if (stage === "handoff_ready") return "顾问接手准备中";
  if (stage === "configuration_ready") return "可进入配置";
  if (stage === "structuring") return "方案整理中";
  if (stage === "exploring") return "方向比较中";
  return "初步咨询中";
}
