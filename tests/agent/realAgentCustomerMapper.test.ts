import { describe, expect, it } from "vitest";
import { mapRealAgentTurnToCustomerPayload } from "@/lib/agent/realCustomerMapper";
import type { RealAdvisorAgentTurnResult } from "@/lib/agent/realSchemas";

describe("real advisor customer mapper", () => {
  it("strips ops-only signals and internal supplier fields from customer payload", () => {
    const turn: RealAdvisorAgentTurnResult = {
      stage: "handoff_ready",
      replyToCustomer: "我会把需求整理给顾问确认正式价格、档期和条款。",
      followupQuestion: "你方便留下联系方式吗？",
      extractedFacts: {
        city: "吉隆坡",
        eventType: "投资大会",
        attendeeCount: 300,
        budgetRange: "80-100万",
        requestedServices: ["会议物料", "接送机"],
      },
      missingFacts: ["联系方式"],
      budgetUnderstanding: {
        level: "ready_for_estimate",
        customerVisibleSummary: "这是预算结构估算，不是正式报价。",
        assumptions: ["以标准型服务组合估算"],
        exclusions: ["实时档期", "供应商底价"],
      },
      recommendedNextAction: "handoff_to_operator",
      canEnterConfigurator: true,
      shouldNotifyOperator: true,
      opsOnlySummary: {
        leadSummary: "高意向客户，需要优先跟进。",
        suggestedFollowup: "今天联系客户。",
        missingInformation: ["联系方式"],
        recommendedOpening: "Chris 内部开场白",
      },
      leadSignals: {
        authenticityLevel: "high",
        intentLevel: "high",
        urgencyLevel: "high",
        reasons: ["有明确时间和预算"],
      },
      safetyFlags: [
        {
          code: "quote_requested",
          customerSafeHandling: "只说明正式价格需本次询价确认。",
        },
      ],
    };

    const payload = mapRealAgentTurnToCustomerPayload(turn);
    const json = JSON.stringify(payload);

    expect(payload.reply).toContain("顾问确认");
    expect(json).not.toContain("opsOnlySummary");
    expect(json).not.toContain("leadSignals");
    expect(json).not.toContain("authenticityLevel");
    expect(json).not.toContain("intentLevel");
    expect(json).not.toContain("urgencyLevel");
    expect(json).not.toContain("Chris 内部开场白");
    expect(json).not.toContain("供应商底价");
  });
});
