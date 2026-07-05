import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/ops/model-settings/test/route";
import { createOpsSessionValue, OPS_REVIEW_SESSION_COOKIE } from "@/lib/deployment/reviewAccess";

const originalEnv = { ...process.env };

function createRequest(body: Record<string, unknown>, authenticated = true) {
  const headers = new Headers({ "Content-Type": "application/json" });

  if (authenticated) {
    headers.set("Cookie", `${OPS_REVIEW_SESSION_COOKIE}=${createOpsSessionValue()}`);
  }

  return new NextRequest("https://hch.ideaegg.com.cn/ops/model-settings/test", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}

function mockChatCompletion(content: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
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

function validTurn() {
  return {
    stage: "exploring",
    replyToCustomer: "新山适合做投资交流、跨境商务和产业考察联动。",
    followupQuestion: "这次更偏投资交流、项目路演，还是客户接待？",
    extractedFacts: {
      city: "新山",
      region: "马来西亚",
      eventType: "投资大会",
      eventIntent: "投资大会",
      attendeeCount: null,
      scaleBand: "undetermined",
      budgetRange: null,
      eventDateRange: null,
      requestedServices: [],
      contactProvided: false,
    },
    missingFacts: ["大致人数", "预算意识"],
    budgetUnderstanding: null,
    recommendedNextAction: "compare_options",
    canEnterConfigurator: false,
    shouldNotifyOperator: false,
    opsOnlySummary: null,
    leadSignals: null,
    safetyFlags: [],
  };
}

describe("ops model settings test route", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    process.env = { ...originalEnv };
  });

  it("rejects unauthenticated test requests", async () => {
    const response = await POST(
      createRequest(
        {
          provider: "openai",
          model: "test-model",
          apiKey: "sk-test-secret",
        },
        false,
      ),
    );

    expect(response.status).toBe(401);
    const payload = await response.json();
    expect(payload.ok).toBe(false);
  });

  it("returns customer-safe OpenAI success without echoing apiKey", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => mockChatCompletion(validTurn())));

    const response = await POST(
      createRequest({
        provider: "openai",
        model: "test-model",
        apiKey: "sk-test-secret",
        testMessage: "我想到新山举办投资大会，有什么建议的方案吗？",
      }),
    );

    const payload = await response.json();
    const json = JSON.stringify(payload);

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(payload.provider).toBe("openai");
    expect(payload.model).toBe("test-model");
    expect(payload.stage).toBe("exploring");
    expect(payload.diagnosticStage).toBe("passed");
    expect(payload.replyPreview).toContain("新山");
    expect(payload.replyPreview.length).toBeLessThanOrEqual(200);
    expect(json).not.toContain("sk-test-secret");
    expect(json).not.toContain("Authorization");
  });

  it("tests MiniMax without OpenAI json_schema response_format", async () => {
    const fetchMock = vi.fn(async () => mockChatCompletion(validTurn()));
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(
      createRequest({
        provider: "minimax",
        baseUrl: "https://api.minimax.example/v1/chat/completions",
        model: "minimax-test-model",
        apiKey: "minimax-test-secret",
      }),
    );

    const body = JSON.parse(String(fetchMock.mock.calls[0][1]?.body));
    const payload = await response.json();

    expect(payload.ok).toBe(true);
    expect(payload.provider).toBe("minimax");
    expect(payload.diagnosticStage).toBe("passed");
    expect(body.response_format).toBeUndefined();
    expect(JSON.stringify(body)).toContain("只输出 JSON");
    expect(JSON.stringify(payload)).not.toContain("minimax-test-secret");
  });

  it("uses the default MiniMax chat completions endpoint when baseUrl is omitted", async () => {
    const fetchMock = vi.fn(async () => mockChatCompletion(validTurn()));
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(
      createRequest({
        provider: "minimax",
        model: "MiniMax-M3",
        apiKey: "minimax-test-secret",
      }),
    );

    const payload = await response.json();

    expect(payload.ok).toBe(true);
    expect(fetchMock.mock.calls[0][0]).toBe("https://api.minimaxi.com/v1/chat/completions");
    expect(JSON.stringify(payload)).not.toContain("minimax-test-secret");
  });

  it("parses MiniMax content after removing think tags", async () => {
    const fetchMock = vi.fn(async () => mockChatCompletion(`<think>internal reasoning</think>\n${JSON.stringify(validTurn())}`));
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(
      createRequest({
        provider: "minimax",
        model: "MiniMax-M3",
        apiKey: "minimax-test-secret",
      }),
    );

    const payload = await response.json();

    expect(payload.ok).toBe(true);
    expect(payload.provider).toBe("minimax");
    expect(payload.stage).toBe("exploring");
    expect(payload.diagnosticStage).toBe("passed");
    expect(JSON.stringify(payload)).not.toContain("minimax-test-secret");
  });

  it("returns json_parse diagnostics when MiniMax returns natural language", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => mockChatCompletion("I can help plan a Johor Bahru investment conference.")));

    const response = await POST(
      createRequest({
        provider: "minimax",
        model: "MiniMax-M3",
        apiKey: "minimax-test-secret",
      }),
    );

    const payload = await response.json();
    const json = JSON.stringify(payload);

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(false);
    expect(payload.diagnosticStage).toBe("json_parse");
    expect(payload.errorMessage).toBe("模型已返回，但不是可解析 JSON。请尝试更换模型或重新测试。");
    expect(payload.errorMessage).not.toContain("json_schema");
    expect(payload.responsePreview).toContain("Johor Bahru investment conference");
    expect(payload.responsePreview.length).toBeLessThanOrEqual(300);
    expect(json).not.toContain("minimax-test-secret");
    expect(json).not.toContain("Authorization");
  });

  it("returns schema_validation diagnostics when MiniMax JSON misses required fields", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => mockChatCompletion({ stage: "exploring", replyToCustomer: "新山适合投资大会。" })));

    const response = await POST(
      createRequest({
        provider: "minimax",
        model: "MiniMax-M3",
        apiKey: "minimax-test-secret",
      }),
    );

    const payload = await response.json();
    const json = JSON.stringify(payload);

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(false);
    expect(payload.diagnosticStage).toBe("schema_validation");
    expect(payload.errorMessage).toBe("模型已返回 JSON，但结构不符合会出海顾问 Agent 输出要求。");
    expect(payload.errorMessage).not.toContain("json_schema");
    expect(payload.responsePreview).toContain("replyToCustomer");
    expect(payload.validationIssues.length).toBeGreaterThan(0);
    expect(payload.validationIssues.length).toBeLessThanOrEqual(5);
    expect(payload.validationIssues[0]).toMatch(/:/);
    expect(json).not.toContain("minimax-test-secret");
    expect(json).not.toContain("Authorization");
  });

  it("returns a MiniMax-specific redacted HTTP error when the API rejects the request", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => mockChatCompletion({ error: "bad key minimax-test-secret" }, 401)));

    const response = await POST(
      createRequest({
        provider: "minimax",
        model: "MiniMax-M3",
        apiKey: "minimax-test-secret",
      }),
    );

    const payload = await response.json();
    const json = JSON.stringify(payload);

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(false);
    expect(payload.diagnosticStage).toBe("http");
    expect(payload.errorMessage).toContain("模型接口返回 401");
    expect(payload.errorMessage).not.toContain("json_schema");
    expect(json).not.toContain("minimax-test-secret");
    expect(json).not.toContain("Authorization");
  });

  it("keeps OpenAI HTTP errors on the json_schema structured output path", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => mockChatCompletion({ error: "bad key sk-test-secret" }, 400)));

    const response = await POST(
      createRequest({
        provider: "openai",
        model: "test-model",
        apiKey: "sk-test-secret",
      }),
    );

    const payload = await response.json();
    const json = JSON.stringify(payload);

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(false);
    expect(payload.diagnosticStage).toBe("http");
    expect(payload.errorMessage).toContain("模型接口返回 400");
    expect(payload.errorMessage).toContain("json_schema structured output");
    expect(json).not.toContain("sk-test-secret");
    expect(json).not.toContain("Authorization");
  });
});
