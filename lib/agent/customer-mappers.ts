import type { AgentTurnResult, CustomerAgentTurnPayload } from "@/lib/agent/schemas";

export function mapAgentTurnToCustomerPayload(result: AgentTurnResult): CustomerAgentTurnPayload {
  return {
    stage: result.stage,
    understoodIntent: result.understoodIntent,
    extractedFacts: result.extractedFacts,
    customerGoalSummary: result.customerGoalSummary,
    customerPriorityFocus: result.customerPriorityFocus,
    regionPreferenceSummary: result.regionPreferenceSummary,
    answerStrategy: result.answerStrategy,
    reply: result.reply,
    followupQuestion: result.followupQuestion,
    canEnterConfigurator: result.canEnterConfigurator,
    progressLabel: progressLabelForStage(result.stage),
    summaryRows: [
      { label: "咨询进度", value: progressLabelForStage(result.stage) },
      { label: "活动意图", value: result.extractedFacts.eventType ?? "待确认" },
      { label: "倾向地点", value: result.extractedFacts.city ?? "待确认" },
      { label: "关注重点", value: result.customerPriorityFocus?.length ? result.customerPriorityFocus.join("、") : "待确认" },
      {
        label: "大致规模",
        value: result.extractedFacts.attendeeCount ? `${result.extractedFacts.attendeeCount} 人` : "待确认",
      },
    ],
  };
}

export function progressLabelForStage(stage: AgentTurnResult["stage"]) {
  if (stage === "handoff_ready") return "顾问接手准备中";
  if (stage === "structuring") return "可整理配置";
  if (stage === "exploring") return "方向比较中";
  return "初步咨询中";
}
