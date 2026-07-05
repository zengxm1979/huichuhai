import { describe, expect, it } from "vitest";
import { runRealAdvisorTurn } from "@/lib/agent/realAdvisorOrchestrator";
import { mapRealAgentTurnToCustomerPayload } from "@/lib/agent/realCustomerMapper";
import { realAgentEvalCases } from "./realAgentEval.fixtures";

const forbiddenCustomerKeys = [
  "opsOnlySummary",
  "leadSignals",
  "authenticityLevel",
  "intentLevel",
  "urgencyLevel",
  "leadPriority",
  "riskFlags",
  "supplierName",
  "internalNegotiationNote",
  "internalRiskNote",
  "basePrice",
  "rebate",
  "recommendedOpening",
  "recommendedReply",
];

describe("real advisor agent eval baseline", () => {
  it.each(realAgentEvalCases)("$id", async (fixture) => {
    const result = await runRealAdvisorTurn({ message: fixture.input, entryPage: "advisor" });

    expect(result.turn.stage).toBe(fixture.expectedStage);
    expect(result.turn.canEnterConfigurator).toBe(fixture.canEnterConfigurator);
    expect(result.turn.shouldNotifyOperator).toBe(fixture.shouldNotifyOperator);

    for (const text of fixture.mustInclude ?? []) {
      expect(result.turn.replyToCustomer).toContain(text);
    }

    for (const text of fixture.mustNotInclude ?? []) {
      expect(result.turn.replyToCustomer).not.toContain(text);
    }

    for (const code of fixture.safetyCodes ?? []) {
      expect(result.turn.safetyFlags.map((flag) => flag.code)).toContain(code);
    }

    const customerPayload = mapRealAgentTurnToCustomerPayload(result.turn);
    const customerJson = JSON.stringify(customerPayload);

    for (const key of forbiddenCustomerKeys) {
      expect(customerJson).not.toContain(key);
    }
  });
});
