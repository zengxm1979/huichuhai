import { z, ZodError } from "zod";
import { createMiniMaxAdvisorProvider, createOpenAIAdvisorProvider, ModelProviderHttpError } from "@/lib/agent/providers/openaiProvider";
import {
  DEFAULT_MINIMAX_CHAT_COMPLETIONS_URL,
  DEFAULT_MODEL_TEST_MESSAGE,
  DEFAULT_OPENAI_CHAT_COMPLETIONS_URL,
} from "@/lib/agent/modelConnectionConstants";

const modelConnectionTestInputSchema = z.object({
  provider: z.enum(["openai", "minimax"]),
  baseUrl: z.string().trim().optional(),
  model: z.string().trim().min(1),
  apiKey: z.string().trim().min(1),
  testMessage: z.string().trim().optional(),
});

export type ModelConnectionTestResult = {
  ok: boolean;
  provider: "openai" | "minimax";
  model: string;
  stage?: string;
  replyPreview?: string;
  fallbackUsed: boolean;
  errorMessage?: string;
};

export function getModelSettingsEnvStatus(env: NodeJS.ProcessEnv = process.env) {
  return {
    currentProvider: env.ADVISOR_AGENT_PROVIDER?.trim() || "mock",
    openaiKeyConfigured: Boolean(env.OPENAI_API_KEY?.trim()),
    openaiModelConfigured: Boolean(env.OPENAI_ADVISOR_MODEL?.trim()),
    minimaxKeyConfigured: Boolean(env.MINIMAX_API_KEY?.trim()),
    minimaxModelConfigured: Boolean(env.MINIMAX_ADVISOR_MODEL?.trim()),
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
      errorMessage: "模型联通测试失败：请填写 Provider、Model 和 API Key。",
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
    };
  } catch (error) {
    return {
      ok: false,
      provider: parsed.provider,
      model: parsed.model,
      fallbackUsed: false,
      errorMessage: redactModelTestError(error),
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

function truncate(value: string, maxLength: number) {
  return value.length > maxLength ? `${value.slice(0, maxLength - 1)}...` : value;
}

function redactModelTestError(error: unknown) {
  if (error instanceof ModelProviderHttpError) {
    return `模型接口返回 ${error.status}：可能不支持 json_schema structured output，或模型、接口地址配置不正确。`;
  }

  if (error instanceof ZodError || error instanceof SyntaxError) {
    return "模型响应未通过结构化输出测试：该接口未通过 json_schema structured output 校验。";
  }

  return "模型联通测试失败：请检查 Provider、Model 和 API Key。";
}
