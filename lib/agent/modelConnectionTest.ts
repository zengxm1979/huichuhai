import { z, ZodError } from "zod";
import {
  createMiniMaxAdvisorProvider,
  createOpenAIAdvisorProvider,
  ModelProviderHttpError,
  ModelProviderJsonParseError,
  ModelProviderSchemaValidationError,
} from "@/lib/agent/providers/openaiProvider";
import {
  DEFAULT_MINIMAX_CHAT_COMPLETIONS_URL,
  DEFAULT_MODEL_TEST_MESSAGE,
  DEFAULT_OPENAI_CHAT_COMPLETIONS_URL,
} from "@/lib/agent/modelConnectionConstants";
import { getVercelAutomationStatus } from "@/lib/deployment/vercelEnv";

const modelConnectionTestInputSchema = z.object({
  provider: z.enum(["openai", "minimax"]),
  baseUrl: z.string().trim().optional(),
  model: z.string().trim().min(1),
  apiKey: z.string().trim().min(1),
  testMessage: z.string().trim().optional(),
});

export type ModelConnectionDiagnosticStage = "http" | "json_parse" | "schema_validation" | "passed";

export type ModelConnectionTestResult = {
  ok: boolean;
  provider: "openai" | "minimax";
  model: string;
  stage?: string;
  replyPreview?: string;
  fallbackUsed: boolean;
  diagnosticStage?: ModelConnectionDiagnosticStage;
  responsePreview?: string;
  validationIssues?: string[];
  errorMessage?: string;
};

export function getModelSettingsEnvStatus(env: NodeJS.ProcessEnv = process.env) {
  return {
    currentProvider: env.ADVISOR_AGENT_PROVIDER?.trim() || "mock",
    openaiKeyConfigured: Boolean(env.OPENAI_API_KEY?.trim()),
    openaiModelConfigured: Boolean(env.OPENAI_ADVISOR_MODEL?.trim()),
    minimaxKeyConfigured: Boolean(env.MINIMAX_API_KEY?.trim()),
    minimaxModelConfigured: Boolean(env.MINIMAX_ADVISOR_MODEL?.trim()),
    vercelAutomationConfigured: getVercelAutomationStatus(env).configured,
  };
}

export async function testAdvisorModelConnection(input: unknown): Promise<ModelConnectionTestResult> {
  const parseResult = modelConnectionTestInputSchema.safeParse(input);

  if (!parseResult.success) {
    const raw = typeof input === "object" && input ? (input as Record<string, unknown>) : {};
    return {
      ok: false,
      provider: raw.provider === "minimax" ? "minimax" : "openai",
      model: typeof raw.model === "string" ? raw.model : "",
      fallbackUsed: false,
      diagnosticStage: "schema_validation",
      errorMessage: "模型联通测试失败：请填写 Provider、Model 和 API Key。",
      validationIssues: summarizeZodIssues(parseResult.error),
    };
  }

  const parsed = parseResult.data;
  const provider =
    parsed.provider === "openai"
      ? createOpenAIAdvisorProvider({
          apiKey: parsed.apiKey,
          model: parsed.model,
          baseUrl: normalizeChatCompletionsUrl(parsed.baseUrl || DEFAULT_OPENAI_CHAT_COMPLETIONS_URL),
        })
      : createMiniMaxAdvisorProvider({
          apiKey: parsed.apiKey,
          model: parsed.model,
          baseUrl: normalizeChatCompletionsUrl(parsed.baseUrl || process.env.MINIMAX_BASE_URL || DEFAULT_MINIMAX_CHAT_COMPLETIONS_URL),
        });

  try {
    const turn = await provider.generateTurn({
      message: parsed.testMessage || DEFAULT_MODEL_TEST_MESSAGE,
      entryPage: "advisor",
    });

    return {
      ok: true,
      provider: parsed.provider,
      model: parsed.model,
      stage: turn.stage,
      replyPreview: truncate(turn.replyToCustomer, 200),
      fallbackUsed: false,
      diagnosticStage: "passed",
    };
  } catch (error) {
    return {
      ok: false,
      provider: parsed.provider,
      model: parsed.model,
      fallbackUsed: false,
      ...diagnoseModelTestError(error, parsed.provider, parsed.apiKey),
    };
  }
}

export function normalizeChatCompletionsUrl(value: string) {
  const trimmed = value.trim().replace(/\/+$/, "");

  if (trimmed.endsWith("/chat/completions")) {
    return trimmed;
  }

  return `${trimmed}/chat/completions`;
}

function diagnoseModelTestError(error: unknown, provider: "openai" | "minimax", apiKey: string) {
  if (error instanceof ModelProviderHttpError) {
    return {
      diagnosticStage: "http" as const,
      errorMessage:
        provider === "minimax"
          ? `模型接口返回 ${error.status}：请检查 MiniMax API Key、模型名或接口可达性。`
          : `模型接口返回 ${error.status}：可能不支持 json_schema structured output，或模型、接口地址配置不正确。`,
    };
  }

  if (error instanceof ModelProviderJsonParseError) {
    return {
      diagnosticStage: "json_parse" as const,
      errorMessage:
        provider === "minimax"
          ? "模型已返回，但不是可解析 JSON。请尝试更换模型或重新测试。"
          : "模型响应未通过结构化输出测试：该接口未通过 json_schema structured output 校验。",
      responsePreview: safeResponsePreview(error.content, apiKey),
    };
  }

  if (error instanceof ModelProviderSchemaValidationError) {
    return {
      diagnosticStage: "schema_validation" as const,
      errorMessage:
        provider === "minimax"
          ? "模型已返回 JSON，但结构不符合会出海顾问 Agent 输出要求。"
          : "模型响应未通过结构化输出测试：该接口未通过 json_schema structured output 校验。",
      responsePreview: safeResponsePreview(error.content, apiKey),
      validationIssues: summarizeIssues(error.issues),
    };
  }

  if (error instanceof ZodError) {
    return {
      diagnosticStage: "schema_validation" as const,
      errorMessage:
        provider === "minimax"
          ? "模型已返回 JSON，但结构不符合会出海顾问 Agent 输出要求。"
          : "模型响应未通过结构化输出测试：该接口未通过 json_schema structured output 校验。",
      validationIssues: summarizeZodIssues(error),
    };
  }

  if (error instanceof SyntaxError) {
    return {
      diagnosticStage: "json_parse" as const,
      errorMessage:
        provider === "minimax"
          ? "模型已返回，但不是可解析 JSON。请尝试更换模型或重新测试。"
          : "模型响应未通过结构化输出测试：该接口未通过 json_schema structured output 校验。",
    };
  }

  return {
    diagnosticStage: "http" as const,
    errorMessage: "模型联通测试失败：请检查 Provider、Model 和 API Key。",
  };
}

function safeResponsePreview(content: string, apiKey: string) {
  return truncate(
    content
      .replaceAll(apiKey, "[REDACTED]")
      .replace(/Bearer\s+[A-Za-z0-9._\-]+/gi, "Bearer [REDACTED]")
      .replace(/Authorization/gi, "[REDACTED_HEADER]"),
    300,
  );
}

function summarizeZodIssues(error: ZodError) {
  return summarizeIssues(error.issues);
}

function summarizeIssues(issues: ZodError["issues"]) {
  return issues.slice(0, 5).map((issue) => {
    const path = issue.path.length > 0 ? issue.path.join(".") : "(root)";
    return `${path}: ${issue.message}`;
  });
}

function truncate(value: string, maxLength: number) {
  return value.length > maxLength ? `${value.slice(0, maxLength - 3)}...` : value;
}
