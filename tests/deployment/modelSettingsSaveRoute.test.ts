import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { createOpsSessionValue, OPS_REVIEW_SESSION_COOKIE } from "@/lib/deployment/reviewAccess";

const originalEnv = { ...process.env };

function createSaveRequest(body: Record<string, unknown>, authenticated = true) {
  const headers = new Headers({ "Content-Type": "application/json" });

  if (authenticated) {
    headers.set("Cookie", `${OPS_REVIEW_SESSION_COOKIE}=${createOpsSessionValue()}`);
  }

  return new NextRequest("https://hch.ideaegg.com.cn/ops/model-settings/save", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}

function okResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    async text() {
      return JSON.stringify(body);
    },
    async json() {
      return body;
    },
  } as Response;
}

function successfulTestResult() {
  return {
    ok: true,
    provider: "minimax" as const,
    model: "MiniMax-M3",
    stage: "exploring",
    replyPreview: "新山适合投资大会，可以先比较商务接待和跨境考察联动。",
    fallbackUsed: false,
    diagnosticStage: "passed" as const,
  };
}

describe("Vercel model env automation", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  it("reports automation availability without exposing management credentials", async () => {
    const { getVercelAutomationStatus } = await import("@/lib/deployment/vercelEnv");

    expect(getVercelAutomationStatus({}).configured).toBe(false);
    expect(
      getVercelAutomationStatus({
        VERCEL_API_TOKEN: "vercel-token-secret",
        VERCEL_PROJECT_ID: "prj_123",
      }).configured,
    ).toBe(true);
    expect(JSON.stringify(getVercelAutomationStatus({ VERCEL_API_TOKEN: "vercel-token-secret", VERCEL_PROJECT_ID: "prj_123" }))).not.toContain(
      "vercel-token-secret",
    );
  });

  it("upserts MiniMax env vars and redeploys the latest production deployment", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(okResponse({ created: { key: "ADVISOR_AGENT_PROVIDER" }, failed: [] }, 201))
      .mockResolvedValueOnce(okResponse({ created: { key: "MINIMAX_ADVISOR_MODEL" }, failed: [] }, 201))
      .mockResolvedValueOnce(okResponse({ created: { key: "MINIMAX_API_KEY" }, failed: [] }, 201))
      .mockResolvedValueOnce(okResponse({ deployments: [{ uid: "dpl_previous", url: "huichuhai-old.vercel.app" }] }))
      .mockResolvedValueOnce(okResponse({ id: "dpl_new", url: "huichuhai-new.vercel.app" }, 201));

    const { saveAdvisorModelEnvAndRedeploy } = await import("@/lib/deployment/vercelEnv");
    const result = await saveAdvisorModelEnvAndRedeploy(
      {
        provider: "minimax",
        model: "MiniMax-M3",
        apiKey: "minimax-secret-key",
      },
      {
        env: {
          VERCEL_API_TOKEN: "vercel-token-secret",
          VERCEL_PROJECT_ID: "prj_123",
          VERCEL_TEAM_ID: "team_123",
          VERCEL_TARGET: "production",
        },
        fetchImpl: fetchMock,
      },
    );

    expect(result.envUpdated).toEqual(["ADVISOR_AGENT_PROVIDER", "MINIMAX_ADVISOR_MODEL", "MINIMAX_API_KEY"]);
    expect(result.deploymentId).toBe("dpl_new");
    expect(result.deploymentUrl).toBe("https://huichuhai-new.vercel.app");
    expect(fetchMock).toHaveBeenCalledTimes(5);
    expect(String(fetchMock.mock.calls[0][0])).toContain("/v10/projects/prj_123/env?upsert=true&teamId=team_123");
    expect(String(fetchMock.mock.calls[3][0])).toContain("/v7/deployments?");
    expect(String(fetchMock.mock.calls[3][0])).toContain("projectId=prj_123");
    expect(String(fetchMock.mock.calls[3][0])).toContain("target=production");
    expect(String(fetchMock.mock.calls[4][0])).toBe("https://api.vercel.com/v13/deployments?teamId=team_123");
    expect(JSON.parse(String(fetchMock.mock.calls[4][1]?.body))).toEqual({
      deploymentId: "dpl_previous",
      target: "production",
      withLatestCommit: true,
    });
    expect(JSON.stringify(result)).not.toContain("minimax-secret-key");
    expect(JSON.stringify(result)).not.toContain("vercel-token-secret");
  });

  it("throws redacted errors when Vercel rejects an env update", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(okResponse({ error: { message: "bad token vercel-token-secret minimax-secret-key" } }, 401));
    const { saveAdvisorModelEnvAndRedeploy } = await import("@/lib/deployment/vercelEnv");

    await expect(
      saveAdvisorModelEnvAndRedeploy(
        {
          provider: "minimax",
          model: "MiniMax-M3",
          apiKey: "minimax-secret-key",
        },
        {
          env: {
            VERCEL_API_TOKEN: "vercel-token-secret",
            VERCEL_PROJECT_ID: "prj_123",
          },
          fetchImpl: fetchMock,
        },
      ),
    ).rejects.toThrow(/Vercel API 返回 401/);

    await expect(
      saveAdvisorModelEnvAndRedeploy(
        {
          provider: "minimax",
          model: "MiniMax-M3",
          apiKey: "minimax-secret-key",
        },
        {
          env: {
            VERCEL_API_TOKEN: "vercel-token-secret",
            VERCEL_PROJECT_ID: "prj_123",
          },
          fetchImpl: fetchMock,
        },
      ),
    ).rejects.not.toThrow(/vercel-token-secret|minimax-secret-key/);
  });
});

describe("ops model settings save route", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  it("rejects unauthenticated save requests", async () => {
    const { POST } = await import("@/app/ops/model-settings/save/route");

    const response = await POST(
      createSaveRequest(
        {
          provider: "minimax",
          model: "MiniMax-M3",
          apiKey: "minimax-secret-key",
        },
        false,
      ),
    );

    expect(response.status).toBe(401);
    const payload = await response.json();
    expect(payload.ok).toBe(false);
    expect(JSON.stringify(payload)).not.toContain("minimax-secret-key");
  });

  it("does not call Vercel when the connection test fails", async () => {
    const testAdvisorModelConnection = vi.fn(async () => ({
      ok: false,
      provider: "minimax",
      model: "MiniMax-M3",
      fallbackUsed: false,
      diagnosticStage: "schema_validation",
      errorMessage: "模型已返回 JSON，但结构不符合会出海顾问 Agent 输出要求。",
    }));
    const saveAdvisorModelEnvAndRedeploy = vi.fn();

    vi.doMock("@/lib/agent/modelConnectionTest", () => ({ testAdvisorModelConnection }));
    vi.doMock("@/lib/deployment/vercelEnv", () => ({ saveAdvisorModelEnvAndRedeploy }));

    const { POST } = await import("@/app/ops/model-settings/save/route");
    const response = await POST(
      createSaveRequest({
        provider: "minimax",
        model: "MiniMax-M3",
        apiKey: "minimax-secret-key",
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(false);
    expect(payload.testResult.ok).toBe(false);
    expect(saveAdvisorModelEnvAndRedeploy).not.toHaveBeenCalled();
    expect(JSON.stringify(payload)).not.toContain("minimax-secret-key");
  });

  it("saves MiniMax env vars after a passed connection test", async () => {
    const testAdvisorModelConnection = vi.fn(async () => successfulTestResult());
    const saveAdvisorModelEnvAndRedeploy = vi.fn(async () => ({
      envUpdated: ["ADVISOR_AGENT_PROVIDER", "MINIMAX_ADVISOR_MODEL", "MINIMAX_API_KEY"],
      deploymentId: "dpl_new",
      deploymentUrl: "https://huichuhai-new.vercel.app",
    }));

    vi.doMock("@/lib/agent/modelConnectionTest", () => ({ testAdvisorModelConnection }));
    vi.doMock("@/lib/deployment/vercelEnv", () => ({ saveAdvisorModelEnvAndRedeploy }));

    const { POST } = await import("@/app/ops/model-settings/save/route");
    const response = await POST(
      createSaveRequest({
        provider: "minimax",
        model: "MiniMax-M3",
        apiKey: "minimax-secret-key",
        testMessage: "我想到新山举办投资大会，有什么建议的方案吗？",
      }),
    );
    const payload = await response.json();
    const json = JSON.stringify(payload);

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(payload.envUpdated).toEqual(["ADVISOR_AGENT_PROVIDER", "MINIMAX_ADVISOR_MODEL", "MINIMAX_API_KEY"]);
    expect(payload.deploymentId).toBe("dpl_new");
    expect(payload.deploymentUrl).toBe("https://huichuhai-new.vercel.app");
    expect(payload.message).toContain("已提交部署");
    expect(testAdvisorModelConnection).toHaveBeenCalledWith({
      provider: "minimax",
      model: "MiniMax-M3",
      apiKey: "minimax-secret-key",
      testMessage: "我想到新山举办投资大会，有什么建议的方案吗？",
    });
    expect(saveAdvisorModelEnvAndRedeploy).toHaveBeenCalledWith({
      provider: "minimax",
      model: "MiniMax-M3",
      apiKey: "minimax-secret-key",
    });
    expect(json).not.toContain("minimax-secret-key");
    expect(json).not.toContain("Authorization");
  });
});
