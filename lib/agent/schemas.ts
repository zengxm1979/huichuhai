export type AdvisorStage = "orientation" | "exploring" | "structuring" | "handoff_ready";

export type AdvisorAnswerStrategy =
  | "explain_first"
  | "compare_options"
  | "ask_one_question"
  | "enter_configurator"
  | "handoff_to_operator";

export type ScaleBand = "small" | "medium" | "large";

export type AgentExtractedFacts = {
  city?: string;
  eventType?: string;
  attendeeCount?: number;
  budgetRange?: string;
  scaleBand?: ScaleBand;
  requestedServices?: string[];
  customerPriorityFocus?: string[];
};

export type AgentTurnResult = {
  stage: AdvisorStage;
  understoodIntent: string;
  extractedFacts: AgentExtractedFacts;
  customerGoalSummary?: string;
  customerPriorityFocus?: string[];
  regionPreferenceSummary?: string;
  answerStrategy: AdvisorAnswerStrategy;
  reply: string;
  followupQuestion?: string;
  canEnterConfigurator: boolean;
  shouldNotifyOperator: boolean;
};

export type AgentTurnRequest = {
  message: string;
  currentFacts?: AgentExtractedFacts;
  entryPage?: "home" | "inquiry" | "advisor";
};

export type CustomerAgentTurnPayload = Omit<AgentTurnResult, "shouldNotifyOperator"> & {
  progressLabel: string;
  summaryRows: Array<{ label: string; value: string }>;
};
