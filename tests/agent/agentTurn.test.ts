import { describe, expect, it } from "vitest";
import { runAdvisorTurn } from "@/lib/agent/response-planner";

describe("controlled advisor agent turn", () => {
  it("answers vague Johor Bahru investment summit consultation before collecting quote fields", () => {
    const result = runAdvisorTurn({
      message: "我想到新山举办投资大会，有什么建议的方案吗？",
    });

    expect(result.stage).toBe("exploring");
    expect(result.answerStrategy).toBe("compare_options");
    expect(result.extractedFacts.city).toBe("新山");
    expect(result.extractedFacts.eventType).toBe("投资大会");
    expect(result.canEnterConfigurator).toBe(false);
    expect(result.shouldNotifyOperator).toBe(false);
    expect(result.reply).toContain("新山");
    expect(result.reply).toContain("投资大会");
    expect(result.reply).toContain("跨境考察");
    expect(result.reply).not.toContain("地点在吉隆坡");
    expect(result.reply).not.toContain("经销商大会");
    expect(result.reply).not.toContain("还需要补充：预计人数、预算范围");
  });

  it("moves complete requirements into structuring and allows configurator entry", () => {
    const result = runAdvisorTurn({
      message: "地点在吉隆坡，120人，经销商大会，预算80-100万，需要物料和接送机",
    });

    expect(result.stage).toBe("structuring");
    expect(result.answerStrategy).toBe("enter_configurator");
    expect(result.canEnterConfigurator).toBe(true);
    expect(result.extractedFacts.city).toBe("吉隆坡");
    expect(result.extractedFacts.eventType).toBe("经销商大会");
    expect(result.extractedFacts.attendeeCount).toBe(120);
    expect(result.extractedFacts.budgetRange).toBe("80-100万");
    expect(result.extractedFacts.requestedServices).toEqual(expect.arrayContaining(["会议物料", "接送机"]));
  });

  it("marks explicit operator handoff as handoff_ready without exposing internal rationale", () => {
    const result = runAdvisorTurn({
      message: "新加坡，80人，投资大会，预算100万，希望尽快让顾问联系我确认正式报价",
    });

    expect(result.stage).toBe("handoff_ready");
    expect(result.answerStrategy).toBe("handoff_to_operator");
    expect(result.canEnterConfigurator).toBe(true);
    expect(result.shouldNotifyOperator).toBe(true);
    expect(result.reply).toContain("顾问");
    expect(result.reply).not.toContain("优先级");
    expect(result.reply).not.toContain("风险");
  });
});
