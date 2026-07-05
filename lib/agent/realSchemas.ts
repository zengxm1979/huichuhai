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

export const realAdvisorAgentTurnResultJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "stage",
    "replyToCustomer",
    "followupQuestion",
    "extractedFacts",
    "missingFacts",
    "budgetUnderstanding",
    "recommendedNextAction",
    "canEnterConfigurator",
    "shouldNotifyOperator",
    "opsOnlySummary",
    "leadSignals",
    "safetyFlags",
  ],
  properties: {
    stage: {
      type: "string",
      enum: ["orientation", "exploring", "structuring", "configuration_ready", "handoff_ready"],
    },
    replyToCustomer: { type: "string" },
    followupQuestion: { type: ["string", "null"] },
    extractedFacts: {
      type: "object",
      additionalProperties: false,
      required: [
        "city",
        "region",
        "eventType",
        "eventIntent",
        "attendeeCount",
        "scaleBand",
        "budgetRange",
        "eventDateRange",
        "requestedServices",
        "contactProvided",
      ],
      properties: {
        city: { type: ["string", "null"] },
        region: { type: ["string", "null"] },
        eventType: { type: ["string", "null"] },
        eventIntent: { type: ["string", "null"] },
        attendeeCount: { type: ["number", "null"] },
        scaleBand: { type: ["string", "null"], enum: ["small", "medium", "large", "undetermined", null] },
        budgetRange: { type: ["string", "null"] },
        eventDateRange: { type: ["string", "null"] },
        requestedServices: {
          type: "array",
          items: { type: "string" },
        },
        contactProvided: { type: ["boolean", "null"] },
      },
    },
    missingFacts: {
      type: "array",
      items: { type: "string" },
    },
    budgetUnderstanding: {
      anyOf: [
        {
          type: "object",
          additionalProperties: false,
          required: ["level", "customerVisibleSummary", "assumptions", "exclusions"],
          properties: {
            level: {
              type: "string",
              enum: ["unknown", "rough_range", "service_tradeoff", "ready_for_estimate"],
            },
            customerVisibleSummary: { type: "string" },
            assumptions: {
              type: "array",
              items: { type: "string" },
            },
            exclusions: {
              type: "array",
              items: { type: "string" },
            },
          },
        },
        { type: "null" },
      ],
    },
    recommendedNextAction: {
      type: "string",
      enum: [
        "continue_orientation",
        "compare_options",
        "ask_one_question",
        "enter_configurator",
        "submit_inquiry",
        "handoff_to_operator",
      ],
    },
    canEnterConfigurator: { type: "boolean" },
    shouldNotifyOperator: { type: "boolean" },
    opsOnlySummary: {
      anyOf: [
        {
          type: "object",
          additionalProperties: false,
          required: ["leadSummary", "suggestedFollowup", "missingInformation", "recommendedOpening"],
          properties: {
            leadSummary: { type: "string" },
            suggestedFollowup: { type: "string" },
            missingInformation: {
              type: "array",
              items: { type: "string" },
            },
            recommendedOpening: { type: ["string", "null"] },
          },
        },
        { type: "null" },
      ],
    },
    leadSignals: {
      anyOf: [
        {
          type: "object",
          additionalProperties: false,
          required: ["authenticityLevel", "intentLevel", "urgencyLevel", "reasons"],
          properties: {
            authenticityLevel: { type: "string", enum: ["unknown", "low", "medium", "high"] },
            intentLevel: { type: "string", enum: ["low", "medium", "high"] },
            urgencyLevel: { type: "string", enum: ["low", "medium", "high"] },
            reasons: {
              type: "array",
              items: { type: "string" },
            },
          },
        },
        { type: "null" },
      ],
    },
    safetyFlags: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["code", "customerSafeHandling"],
        properties: {
          code: {
            type: "string",
            enum: [
              "quote_requested",
              "availability_requested",
              "supplier_internal_requested",
              "mock_content_risk",
              "private_data_risk",
            ],
          },
          customerSafeHandling: { type: "string" },
        },
      },
    },
  },
} as const;

export function parseRealAdvisorAgentTurnResult(value: unknown): RealAdvisorAgentTurnResult {
  return realAdvisorAgentTurnResultSchema.parse(stripNullObjectFields(value));
}

function stripNullObjectFields(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(stripNullObjectFields);
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value)
      .filter(([, child]) => child !== null)
      .map(([key, child]) => [key, stripNullObjectFields(child)]),
  );
}
