import { describe, expect, it } from "vitest";
import { runRealAdvisorTurn } from "@/lib/agent/realAdvisorOrchestrator";
import type { AdvisorAgentProvider } from "@/lib/agent/providers/types";

describe("real advisor provider fallback", () => {
  it("uses the rules fallback when the selected provider fails", async () => {
    const failingProvider: AdvisorAgentProvider = {
      name: "openai",
      async generateTurn() {
        throw new Error("provider unavailable");
      },
    };

    const result = await runRealAdvisorTurn(
      { message: "你直接给我报价吧，KLCC 多少钱？", entryPage: "advisor" },
      { provider: failingProvider },
    );

    expect(result.providerName).toBe("rules");
    expect(result.fallbackUsed).toBe(true);
    expect(result.turn.replyToCustomer).toContain("正式价格");
    expect(result.turn.replyToCustomer).toContain("本次询价确认");
    expect(result.turn.safetyFlags.map((flag) => flag.code)).toContain("quote_requested");
  });
});
