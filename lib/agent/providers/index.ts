import { createMiniMaxAdvisorProvider, createOpenAIAdvisorProvider } from "@/lib/agent/providers/openaiProvider";
import { createRulesAdvisorProvider } from "@/lib/agent/providers/mockProvider";
import type { AdvisorAgentProvider } from "@/lib/agent/providers/types";

export function getAdvisorAgentProvider(): AdvisorAgentProvider {
  const requestedProvider = process.env.ADVISOR_AGENT_PROVIDER?.toLowerCase();

  if (
    requestedProvider === "openai" &&
    process.env.OPENAI_API_KEY &&
    process.env.OPENAI_ADVISOR_MODEL &&
    process.env.NODE_ENV !== "test"
  ) {
    return createOpenAIAdvisorProvider();
  }

  if (
    requestedProvider === "minimax" &&
    process.env.MINIMAX_API_KEY &&
    process.env.MINIMAX_ADVISOR_MODEL &&
    process.env.MINIMAX_BASE_URL &&
    process.env.NODE_ENV !== "test"
  ) {
    return createMiniMaxAdvisorProvider();
  }

  return createRulesAdvisorProvider();
}
