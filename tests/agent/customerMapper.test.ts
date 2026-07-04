import { describe, expect, it } from "vitest";
import { assertCustomerSafePayload } from "@/components/advisor/customerVisibility";
import { mapAgentTurnToCustomerPayload } from "@/lib/agent/customer-mappers";
import type { AgentTurnResult } from "@/lib/agent/schemas";

describe("agent customer mapper", () => {
  it("returns customer-safe consultation progress and light summary", () => {
    const result: AgentTurnResult = {
      stage: "exploring",
      understoodIntent: "咨询新山投资大会方向",
      extractedFacts: {
        city: "新山",
        eventType: "投资大会",
        customerPriorityFocus: ["投资交流 / 项目路演"],
      },
      customerGoalSummary: "在新山办投资大会",
      customerPriorityFocus: ["投资交流 / 项目路演"],
      regionPreferenceSummary: "倾向新山",
      answerStrategy: "compare_options",
      reply: "新山适合投资交流和跨境考察联动。",
      followupQuestion: "你更偏投资交流、项目路演，还是客户接待？",
      canEnterConfigurator: false,
      shouldNotifyOperator: false,
    };

    const payload = mapAgentTurnToCustomerPayload(result);

    expect(payload.progressLabel).toBe("方向比较中");
    expect(payload.summaryRows).toEqual(
      expect.arrayContaining([
        { label: "活动意图", value: "投资大会" },
        { label: "倾向地点", value: "新山" },
      ]),
    );
    expect(payload.shouldNotifyOperator).toBeUndefined();
    expect(() => assertCustomerSafePayload(payload)).not.toThrow();
  });
});
