import { describe, expect, it } from "vitest";
import { assertCustomerSafePayload } from "@/components/advisor/customerVisibility";

describe("assertCustomerSafePayload", () => {
  it("allows customer-visible advisor data", () => {
    expect(() =>
      assertCustomerSafePayload({
        inquiry: {
          eventType: "经销商大会",
          selectedPackage: "标准型",
        },
        budgetEstimate: {
          customerMatchSummary: "当前方案基本覆盖预算范围，正式报价需顾问确认。",
        },
      }),
    ).not.toThrow();
  });

  it.each([
    "authenticityScore",
    "intentScore",
    "leadPriority",
    "riskFlags",
    "recommendedReply",
    "authenticity_score",
    "intent_score",
    "lead_priority",
    "risk_flags",
    "recommended_reply",
  ])("blocks internal field %s from customer payloads", (fieldName) => {
    expect(() =>
      assertCustomerSafePayload({
        inquiry: { selectedPackage: "标准型" },
        internal: {
          [fieldName]: fieldName === "riskFlags" || fieldName === "risk_flags" ? ["budget"] : "mock",
        },
      }),
    ).toThrow(`Forbidden customer field`);
  });
});
