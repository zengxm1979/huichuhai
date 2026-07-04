export const advisorAgentPolicies = {
  maxFollowupQuestionsPerTurn: 1,
  forbiddenCustomerPhrases: ["地点在吉隆坡，120人，经销商大会", "还需要补充：预计人数、预算范围"],
  customerSafeQuoteNotice: "预算仅为结构估算或参考范围，不是正式报价；正式价格、档期、付款和取消条款需基于本次询价确认。",
} as const;

export function scrubForbiddenCustomerPhrases(reply: string) {
  return advisorAgentPolicies.forbiddenCustomerPhrases.reduce((current, phrase) => current.replaceAll(phrase, ""), reply);
}
