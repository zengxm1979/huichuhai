import { z } from "zod";

export const realAdvisorStageSchema = z.enum([
  "orientation",
  "exploring",
  "structuring",
  "configuration_ready",
  "handoff_ready",
]);

export type RealAdvisorStage = z.infer<typeof realAdvisorStageSchema>;

export const realAdvisorRecommendedNextActionSchema = z.enum([
  "continue_orientation",
  "compare_options",
  "ask_one_question",
  "enter_configurator",
  "submit_inquiry",
  "handoff_to_operator",
]);

export type RealAdvisorRecommendedNextAction = z.infer<typeof realAdvisorRecommendedNextActionSchema>;

export const realAdvisorSafetyCodeSchema = z.enum([
  "quote_requested",
  "availability_requested",
  "supplier_internal_requested",
  "mock_content_risk",
  "private_data_risk",
]);

export type RealAdvisorSafetyCode = z.infer<typeof realAdvisorSafetyCodeSchema>;

export const realAdvisorExtractedFactsSchema = z.object({
  city: z.string().optional(),
  region: z.string().optional(),
  eventType: z.string().optional(),
  eventIntent: z.string().optional(),
  attendeeCount: z.number().int().positive().optional(),
  scaleBand: z.enum(["small", "medium", "large", "undetermined"]).optional(),
  budgetRange: z.string().optional(),
  eventDateRange: z.string().optional(),
  requestedServices: z.array(z.string()).optional(),
  contactProvided: z.boolean().optional(),
});

export type RealAdvisorExtractedFacts = z.infer<typeof realAdvisorExtractedFactsSchema>;

export const realAdvisorAgentTurnResultSchema = z.object({
  stage: realAdvisorStageSchema,
  replyToCustomer: z.string().min(1),
  followupQuestion: z.string().optional(),
  extractedFacts: realAdvisorExtractedFactsSchema.default({}),
  missingFacts: z.array(z.string()).default([]),
  budgetUnderstanding: z
    .object({
      level: z.enum(["unknown", "rough_range", "service_tradeoff", "ready_for_estimate"]),
      customerVisibleSummary: z.string(),
      assumptions: z.array(z.string()),
      exclusions: z.array(z.string()),
    })
    .optional(),
  recommendedNextAction: realAdvisorRecommendedNextActionSchema,
  canEnterConfigurator: z.boolean(),
  shouldNotifyOperator: z.boolean(),
  opsOnlySummary: z
    .object({
      leadSummary: z.string(),
      suggestedFollowup: z.string(),
      missingInformation: z.array(z.string()),
      recommendedOpening: z.string().optional(),
    })
    .optional(),
  leadSignals: z
    .object({
      authenticityLevel: z.enum(["unknown", "low", "medium", "high"]),
      intentLevel: z.enum(["low", "medium", "high"]),
      urgencyLevel: z.enum(["low", "medium", "high"]),
      reasons: z.array(z.string()),
    })
    .optional(),
  safetyFlags: z
    .array(
      z.object({
        code: realAdvisorSafetyCodeSchema,
        customerSafeHandling: z.string(),
      }),
    )
    .default([]),
});

export type RealAdvisorAgentTurnResult = z.infer<typeof realAdvisorAgentTurnResultSchema>;

export type RealAdvisorAgentTurnRequest = {
  message: string;
  currentFacts?: RealAdvisorExtractedFacts;
  entryPage?: "home" | "inquiry" | "advisor";
};

export function parseRealAdvisorAgentTurnResult(value: unknown): RealAdvisorAgentTurnResult {
  return realAdvisorAgentTurnResultSchema.parse(value);
}
