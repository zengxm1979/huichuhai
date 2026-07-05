import { assertCustomerSafePayload } from "@/components/advisor/customerVisibility";
import { createRulesAdvisorProvider } from "@/lib/agent/providers/mockProvider";
import { getAdvisorAgentProvider } from "@/lib/agent/providers";
import type { AdvisorAgentProvider } from "@/lib/agent/providers/types";
import { mapRealAgentTurnToCustomerPayload } from "@/lib/agent/realCustomerMapper";
import { parseRealAdvisorAgentTurnResult } from "@/lib/agent/realSchemas";
import type { RealAdvisorAgentTurnRequest, RealAdvisorAgentTurnResult } from "@/lib/agent/realSchemas";

export type RealAdvisorTurnRunResult = {
  turn: RealAdvisorAgentTurnResult;
  providerName: AdvisorAgentProvider["name"];
  fallbackUsed: boolean;
};

export async function runRealAdvisorTurn(
  request: RealAdvisorAgentTurnRequest,
  options: { provider?: AdvisorAgentProvider } = {},
): Promise<RealAdvisorTurnRunResult> {
  const provider = options.provider ?? getAdvisorAgentProvider();

  try {
    const turn = parseRealAdvisorAgentTurnResult(await provider.generateTurn(request));
    assertCustomerSafePayload(mapRealAgentTurnToCustomerPayload(turn));
    return {
      turn,
      providerName: provider.name,
      fallbackUsed: false,
    };
  } catch (error) {
    if (provider.name === "rules") {
      throw error;
    }

    const fallbackProvider = createRulesAdvisorProvider();
    const turn = parseRealAdvisorAgentTurnResult(await fallbackProvider.generateTurn(request));
    assertCustomerSafePayload(mapRealAgentTurnToCustomerPayload(turn));

    return {
      turn,
      providerName: fallbackProvider.name,
      fallbackUsed: true,
    };
  }
}
