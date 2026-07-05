import { afterEach, describe, expect, it, vi } from "vitest";
import { createOpenAIAdvisorProvider } from "@/lib/agent/providers/openaiProvider";
import { runRealAdvisorTurn } from "@/lib/agent/realAdvisorOrchestrator";

const originalEnv = { ...process.env };

function mockChatCompletion(content: unknown) {
  return {
    ok: true,
    status: 200,
    async json() {
      return {
        choices: [
          {
            message: {
              content: typeof content === "string" ? content : JSON.stringify(content),
            },
          },
        ],
      };
    },
  } as Response;
}

function validStructuredTurn() {
  return {
    stage: "exploring",
    replyToCustomer: "新山适合做偏跨境商务和投资交流的活动。",
    followupQuestion: "你更偏投资交流、项目路演，还是客户接待？",
    extractedFacts: {
      city: "新山",
      region: "马来西亚",
      eventType: "投资大会",
      eventIntent: "投资大会",
      attendeeCount: 80,
      scaleBand: "undetermined",
      budgetRange: "待确认",
      eventDateRange: "待确认",
      requestedServices: [],
      contactProvided: false,
    },
    missingFacts: ["大致人数", "预算意识"],
    budgetUnderstanding: {
      level: "unknown",
      customerVisibleSummary: "当前只能作为预算结构参考，不是正式报价。",
      assumptions: [],
      exclusions: ["正式报价", "实时档期"],
    },
    recommendedNextAction: "compare_options",
    canEnterConfigurator: false,
    shouldNotifyOperator: false,
    opsOnlySummary: {
      leadSummary: "内部摘要",
      suggestedFollowup: "继续追问活动目的。",
      missingInformation: ["预算意识"],
    },
    leadSignals: {
      authenticityLevel: "unknown",
      intentLevel: "medium",
      urgencyLevel: "low",
      reasons: ["客户在探索方向"],
    },
    safetyFlags: [],
  };
}

describe("OpenAI advisor provider structured outputs", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    process.env = { ...originalEnv };
  });

  it("uses strict json_schema structured output instead of json_object mode", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    process.env.OPENAI_ADVISOR_MODEL = "test-model";
    const fetchMock = vi.fn(async () => mockChatCompletion(validStructuredTurn()));
    vi.stubGlobal("fetch", fetchMock);

    await createOpenAIAdvisorProvider().generateTurn({
      message: "我想到新山举办投资大会，有什么建议的方案吗？",
      entryPage: "advisor",
    });

    const body = JSON.parse(String(fetchMock.mock.calls[0][1]?.body));

    expect(body.response_format?.type).toBe("json_schema");
    expect(body.response_format?.type).not.toBe("json_object");
    expect(body.response_format?.json_schema?.strict).toBe(true);
    expect(body.response_format?.json_schema?.schema?.properties).toHaveProperty("stage");
    expect(body.response_format?.json_schema?.schema?.properties).toHaveProperty("replyToCustomer");
    expect(body.response_format?.json_schema?.schema?.properties).toHaveProperty("extractedFacts");
    expect(body.response_format?.json_schema?.schema?.properties).toHaveProperty("opsOnlySummary");
    expect(body.response_format?.json_schema?.schema?.properties).toHaveProperty("leadSignals");
  });

  it("parses a schema-conformant OpenAI response into RealAdvisorAgentTurnResult", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    process.env.OPENAI_ADVISOR_MODEL = "test-model";
    vi.stubGlobal("fetch", vi.fn(async () => mockChatCompletion(validStructuredTurn())));

    const turn = await createOpenAIAdvisorProvider().generateTurn({
      message: "我想到新山举办投资大会，有什么建议的方案吗？",
      entryPage: "advisor",
    });

    expect(turn.stage).toBe("exploring");
    expect(turn.extractedFacts.city).toBe("新山");
    expect(turn.extractedFacts.eventType).toBe("投资大会");
    expect(turn.canEnterConfigurator).toBe(false);
  });

  it("falls back to rules provider when OpenAI response violates the structured schema", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    process.env.OPENAI_ADVISOR_MODEL = "test-model";
    const provider = createOpenAIAdvisorProvider();
    vi.stubGlobal("fetch", vi.fn(async () => mockChatCompletion({ stage: "not_a_stage" })));

    const result = await runRealAdvisorTurn(
      {
        message: "我想到新山举办投资大会，有什么建议的方案吗？",
        entryPage: "advisor",
      },
      { provider },
    );

    expect(result.fallbackUsed).toBe(true);
    expect(result.providerName).toBe("rules");
    expect(result.turn.stage).toBe("exploring");
    expect(result.turn.replyToCustomer).toContain("新山");
    expect(result.turn.replyToCustomer).toContain("投资大会");
  });
});
