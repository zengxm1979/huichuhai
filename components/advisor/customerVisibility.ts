const FORBIDDEN_CUSTOMER_KEYS = [
  "authenticity_score",
  "authenticityScore",
  "intent_score",
  "intentScore",
  "lead_priority",
  "leadPriority",
  "score_reasons",
  "scoreReasons",
  "risk_flags",
  "riskFlags",
  "attention_reason",
  "attentionReason",
  "budget_risks",
  "budgetRisks",
  "recommended_followup_focus",
  "recommendedFollowupFocus",
  "recommended_next_action",
  "recommendedNextAction",
  "recommended_reply",
  "recommendedReply",
  "operator_notes",
  "operatorNotes",
  "supplier_name",
  "supplierName",
  "internal_negotiation_note",
  "internalNegotiationNote",
  "internal_risk_note",
  "internalRiskNote",
  "conflict_note",
  "conflictNote",
  "supplier_response_summary",
  "supplierResponseSummary",
  "operator_followup_note",
  "operatorFollowupNote",
  "ops_only_summary",
  "opsOnlySummary",
  "lead_signals",
  "leadSignals",
  "authenticity_level",
  "authenticityLevel",
  "intent_level",
  "intentLevel",
  "urgency_level",
  "urgencyLevel",
  "base_price",
  "basePrice",
  "rebate",
  "recommended_opening",
  "recommendedOpening",
] as const;

export function assertCustomerSafePayload(payload: unknown): void {
  const seen = new Set<unknown>();

  function visit(value: unknown, path: string): void {
    if (!value || typeof value !== "object") return;
    if (seen.has(value)) return;
    seen.add(value);

    for (const [key, child] of Object.entries(value)) {
      if (FORBIDDEN_CUSTOMER_KEYS.includes(key as (typeof FORBIDDEN_CUSTOMER_KEYS)[number])) {
        throw new Error(`Forbidden customer field at ${path ? `${path}.` : ""}${key}`);
      }

      visit(child, path ? `${path}.${key}` : key);
    }
  }

  visit(payload, "");
}
