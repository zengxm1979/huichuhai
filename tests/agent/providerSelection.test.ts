import { afterEach, describe, expect, it } from "vitest";
import { getAdvisorAgentProvider } from "@/lib/agent/providers";

const originalEnv = { ...process.env };

describe("advisor provider selection", () => {
  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("enables MiniMax provider without requiring MINIMAX_BASE_URL", () => {
    process.env.NODE_ENV = "production";
    process.env.ADVISOR_AGENT_PROVIDER = "minimax";
    process.env.MINIMAX_API_KEY = "minimax-test-secret";
    process.env.MINIMAX_ADVISOR_MODEL = "MiniMax-M3";
    delete process.env.MINIMAX_BASE_URL;

    expect(getAdvisorAgentProvider().name).toBe("minimax");
  });
});
