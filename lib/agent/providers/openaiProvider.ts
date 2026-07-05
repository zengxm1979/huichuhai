import { parseRealAdvisorAgentTurnResult, realAdvisorAgentTurnResultJsonSchema } from "@/lib/agent/realSchemas";
import type { RealAdvisorAgentTurnRequest, RealAdvisorAgentTurnResult } from "@/lib/agent/realSchemas";
import type { AdvisorAgentProvider } from "@/lib/agent/providers/types";

const OPENAI_CHAT_COMPLETIONS_URL = "https://api.openai.com/v1/chat/completions";

export function createOpenAIAdvisorProvider(): AdvisorAgentProvider {
  return {
    name: "openai",
    async generateTurn(request) {
      return generateOpenAITurn(request);
    },
  };
}

async function generateOpenAITurn(request: RealAdvisorAgentTurnRequest): Promise<RealAdvisorAgentTurnResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_ADVISOR_MODEL;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  if (!model) {
    throw new Error("OPENAI_ADVISOR_MODEL is not configured");
  }

  const response = await fetch(OPENAI_CHAT_COMPLETIONS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
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
    throw new Error(`OpenAI advisor provider failed: ${response.status}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("OpenAI advisor provider returned empty content");
  }

  return parseRealAdvisorAgentTurnResult(JSON.parse(content));
}
