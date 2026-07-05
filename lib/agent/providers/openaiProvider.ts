import { ZodError } from "zod";
import { parseRealAdvisorAgentTurnResult, realAdvisorAgentTurnResultJsonSchema } from "@/lib/agent/realSchemas";
import type { RealAdvisorAgentTurnRequest, RealAdvisorAgentTurnResult } from "@/lib/agent/realSchemas";
import type { AdvisorAgentProvider, AdvisorAgentProviderName } from "@/lib/agent/providers/types";

const OPENAI_CHAT_COMPLETIONS_URL = "https://api.openai.com/v1/chat/completions";
const MINIMAX_CHAT_COMPLETIONS_URL = "https://api.minimaxi.com/v1/chat/completions";

export type OpenAICompatibleAdvisorProviderConfig = {
  providerName?: Extract<AdvisorAgentProviderName, "openai" | "minimax">;
  apiKey?: string;
  model?: string;
  baseUrl?: string;
};

export class ModelProviderHttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly providerName: string,
  ) {
    super(`${providerName} provider returned ${status}`);
  }
}

export class ModelProviderJsonParseError extends Error {
  constructor(
    public readonly providerName: string,
    public readonly content: string,
    public readonly cause?: unknown,
  ) {
    super(`${providerName} provider returned non-JSON content`);
  }
}

export class ModelProviderSchemaValidationError extends Error {
  constructor(
    public readonly providerName: string,
    public readonly content: string,
    public readonly issues: ZodError["issues"],
  ) {
    super(`${providerName} provider returned schema-invalid JSON`);
  }
}

export function createOpenAIAdvisorProvider(config: OpenAICompatibleAdvisorProviderConfig = {}): AdvisorAgentProvider {
  return {
    name: config.providerName ?? "openai",
    async generateTurn(request) {
      return generateOpenAICompatibleTurn(request, {
        providerName: config.providerName ?? "openai",
        apiKey: config.apiKey ?? process.env.OPENAI_API_KEY,
        model: config.model ?? process.env.OPENAI_ADVISOR_MODEL,
        baseUrl: config.baseUrl ?? OPENAI_CHAT_COMPLETIONS_URL,
      });
    },
  };
}

export function createMiniMaxAdvisorProvider(config: OpenAICompatibleAdvisorProviderConfig = {}): AdvisorAgentProvider {
  return {
    name: "minimax",
    async generateTurn(request) {
      return generateMiniMaxCompatibleTurn(request, {
        providerName: "minimax",
        apiKey: config.apiKey ?? process.env.MINIMAX_API_KEY,
        model: config.model ?? process.env.MINIMAX_ADVISOR_MODEL,
        baseUrl: config.baseUrl ?? process.env.MINIMAX_BASE_URL ?? MINIMAX_CHAT_COMPLETIONS_URL,
      });
    },
  };
}

async function generateOpenAICompatibleTurn(
  request: RealAdvisorAgentTurnRequest,
  config: Required<Pick<OpenAICompatibleAdvisorProviderConfig, "providerName">> &
    Pick<OpenAICompatibleAdvisorProviderConfig, "apiKey" | "model" | "baseUrl">,
): Promise<RealAdvisorAgentTurnResult> {
  const apiKey = config.apiKey?.trim();
  const model = config.model?.trim();
  const baseUrl = config.baseUrl?.trim();
  const required = requireProviderConfig(config.providerName, apiKey, model, baseUrl);

  const response = await fetch(required.baseUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${required.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: required.model,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "real_advisor_agent_turn_result",
          strict: true,
          schema: realAdvisorAgentTurnResultJsonSchema,
        },
      },
      messages: [
        {
          role: "system",
          content:
            "你是会出海的出海会务顾问 Agent。必须先回答客户问题，再自然追问；不能承诺正式报价、实时档期、付款、取消或合同条款；不能泄露供应商内部信息、底价、返点、内部风险、真实性和意向判断。只返回符合 RealAdvisorAgentTurnResult 的 JSON。",
        },
        {
          role: "user",
          content: JSON.stringify({
            message: request.message,
            currentFacts: request.currentFacts ?? {},
            entryPage: request.entryPage ?? "advisor",
          }),
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new ModelProviderHttpError(response.status, config.providerName);
  }

  const content = await readChatCompletionContent(response, config.providerName);
  return parseRealAdvisorAgentTurnResult(JSON.parse(content));
}

async function generateMiniMaxCompatibleTurn(
  request: RealAdvisorAgentTurnRequest,
  config: Required<Pick<OpenAICompatibleAdvisorProviderConfig, "providerName">> &
    Pick<OpenAICompatibleAdvisorProviderConfig, "apiKey" | "model" | "baseUrl">,
): Promise<RealAdvisorAgentTurnResult> {
  const apiKey = config.apiKey?.trim();
  const model = config.model?.trim();
  const baseUrl = config.baseUrl?.trim();
  const required = requireProviderConfig(config.providerName, apiKey, model, baseUrl);

  const response = await fetch(required.baseUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${required.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: required.model,
      messages: [
        {
          role: "system",
          content: buildMiniMaxJsonInstruction(),
        },
        {
          role: "user",
          content: JSON.stringify({
            message: request.message,
            currentFacts: request.currentFacts ?? {},
            entryPage: request.entryPage ?? "advisor",
          }),
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new ModelProviderHttpError(response.status, config.providerName);
  }

  const content = await readChatCompletionContent(response, config.providerName);
  let parsedJson: unknown;

  try {
    parsedJson = parseJsonObjectFromModelContent(content);
  } catch (error) {
    throw new ModelProviderJsonParseError(config.providerName, content, error);
  }

  try {
    return parseRealAdvisorAgentTurnResult(parsedJson);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ModelProviderSchemaValidationError(config.providerName, content, error.issues);
    }

    throw error;
  }
}

function requireProviderConfig(providerName: string, apiKey: string | undefined, model: string | undefined, baseUrl: string | undefined) {
  if (!apiKey) {
    throw new Error(`${providerName} API key is not configured`);
  }

  if (!model) {
    throw new Error(`${providerName} model is not configured`);
  }

  if (!baseUrl) {
    throw new Error(`${providerName} base URL is not configured`);
  }

  return { apiKey, model, baseUrl };
}

async function readChatCompletionContent(response: Response, providerName: string) {
  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error(`${providerName} provider returned empty content`);
  }

  return content;
}

function buildMiniMaxJsonInstruction() {
  const skeleton = {
    stage: "exploring",
    replyToCustomer: "客户可见回复，先回答问题，再自然追问。",
    followupQuestion: "最多一个追问；没有则用 null。",
    extractedFacts: {
      city: null,
      region: null,
      eventType: null,
      eventIntent: null,
      attendeeCount: null,
      scaleBand: "undetermined",
      budgetRange: null,
      eventDateRange: null,
      requestedServices: [],
      contactProvided: false,
    },
    missingFacts: [],
    budgetUnderstanding: null,
    recommendedNextAction: "compare_options",
    canEnterConfigurator: false,
    shouldNotifyOperator: false,
    opsOnlySummary: null,
    leadSignals: null,
    safetyFlags: [],
  };

  return [
    "你是会出海的出海会务顾问 Agent。",
    "只输出 JSON。必须返回单个 JSON object；不要 <think>，不要 Markdown，禁止解释 JSON 之外的文字。",
    "top-level required keys: stage, replyToCustomer, followupQuestion, extractedFacts, missingFacts, budgetUnderstanding, recommendedNextAction, canEnterConfigurator, shouldNotifyOperator, opsOnlySummary, leadSignals, safetyFlags.",
    "没有值的 optional 字段用 null；列表用 []；不要省略 top-level required keys。",
    "客户侧禁止承诺正式报价、实时档期、付款、取消或合同条款。",
    "禁止向客户泄露供应商内部信息、底价、返点、内部风险、真实性判断、意向强度、优先级或推荐跟进话术。",
    `最小 JSON skeleton 示例：${JSON.stringify(skeleton)}`,
  ].join("\n");
}

function parseJsonObjectFromModelContent(content: string): unknown {
  const withoutThink = content.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
  const withoutFence = stripJsonFence(withoutThink);
  const jsonText = extractFirstJsonObject(withoutFence);

  if (!jsonText) {
    throw new SyntaxError("model response did not contain a JSON object");
  }

  return JSON.parse(jsonText);
}

function stripJsonFence(value: string) {
  const fenceMatch = value.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenceMatch ? fenceMatch[1].trim() : value;
}

function extractFirstJsonObject(value: string) {
  let start = -1;
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];

    if (start === -1) {
      if (char === "{") {
        start = index;
        depth = 1;
      }
      continue;
    }

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === "\\") {
      escaped = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (inString) {
      continue;
    }

    if (char === "{") {
      depth += 1;
    } else if (char === "}") {
      depth -= 1;

      if (depth === 0) {
        return value.slice(start, index + 1);
      }
    }
  }

  return null;
}
