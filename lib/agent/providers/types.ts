import type { RealAdvisorAgentTurnRequest, RealAdvisorAgentTurnResult } from "@/lib/agent/realSchemas";

export type AdvisorAgentProviderName = "openai" | "rules";

export type AdvisorAgentProvider = {
  name: AdvisorAgentProviderName;
  generateTurn(request: RealAdvisorAgentTurnRequest): Promise<RealAdvisorAgentTurnResult>;
};
