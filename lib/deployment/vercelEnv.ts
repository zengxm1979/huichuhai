type FetchLike = typeof fetch;

export type AdvisorModelEnvInput = {
  provider: "minimax";
  model: string;
  apiKey: string;
};

export type VercelAutomationStatus = {
  configured: boolean;
  missing: string[];
  target: string;
};

export type VercelSaveResult = {
  envUpdated: string[];
  deploymentId?: string;
  deploymentUrl?: string;
};

type VercelOptions = {
  env?: NodeJS.ProcessEnv;
  fetchImpl?: FetchLike;
};

const VERCEL_API_BASE = "https://api.vercel.com";
const ADVISOR_ENV_KEYS = ["ADVISOR_AGENT_PROVIDER", "MINIMAX_ADVISOR_MODEL", "MINIMAX_API_KEY"] as const;

export class VercelAutomationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "VercelAutomationError";
  }
}

export function getVercelAutomationStatus(env: NodeJS.ProcessEnv = process.env): VercelAutomationStatus {
  const missing = [];

  if (!env.VERCEL_API_TOKEN?.trim()) missing.push("VERCEL_API_TOKEN");
  if (!env.VERCEL_PROJECT_ID?.trim()) missing.push("VERCEL_PROJECT_ID");

  return {
    configured: missing.length === 0,
    missing,
    target: env.VERCEL_TARGET?.trim() || "production",
  };
}

export async function saveAdvisorModelEnvAndRedeploy(input: AdvisorModelEnvInput, options: VercelOptions = {}): Promise<VercelSaveResult> {
  const env = options.env ?? process.env;
  const fetchImpl = options.fetchImpl ?? fetch;
  const config = readVercelConfig(env);

  const variables = [
    { key: "ADVISOR_AGENT_PROVIDER", value: input.provider, type: "plain" },
    { key: "MINIMAX_ADVISOR_MODEL", value: input.model, type: "plain" },
    { key: "MINIMAX_API_KEY", value: input.apiKey, type: "encrypted" },
  ] satisfies Array<{ key: (typeof ADVISOR_ENV_KEYS)[number]; value: string; type: "plain" | "encrypted" }>;

  const updated: string[] = [];

  for (const variable of variables) {
    await vercelFetch(
      fetchImpl,
      buildProjectEnvUrl(config.projectId, config.teamId),
      {
        method: "POST",
        headers: vercelHeaders(config.apiToken),
        body: JSON.stringify({
          key: variable.key,
          value: variable.value,
          type: variable.type,
          target: [config.target],
        }),
      },
      [config.apiToken, input.apiKey],
    );
    updated.push(variable.key);
  }

  const latestDeploymentId = await fetchLatestProductionDeploymentId(fetchImpl, config, input.apiKey);
  const redeploy = (await vercelFetch(
    fetchImpl,
    buildUrl("/v13/deployments", config.teamId),
    {
      method: "POST",
      headers: vercelHeaders(config.apiToken),
      body: JSON.stringify({
        deploymentId: latestDeploymentId,
        target: config.target,
        withLatestCommit: true,
      }),
    },
    [config.apiToken, input.apiKey],
  )) as Record<string, unknown>;

  const deploymentId = typeof redeploy.id === "string" ? redeploy.id : typeof redeploy.uid === "string" ? redeploy.uid : undefined;
  const rawUrl = typeof redeploy.url === "string" ? redeploy.url : undefined;

  return {
    envUpdated: updated,
    deploymentId,
    deploymentUrl: rawUrl ? normalizeDeploymentUrl(rawUrl) : undefined,
  };
}

function readVercelConfig(env: NodeJS.ProcessEnv) {
  const status = getVercelAutomationStatus(env);

  if (!status.configured) {
    throw new VercelAutomationError(`当前环境未配置自动保存能力，请联系技术人员配置 ${status.missing.join(" / ")}。`);
  }

  return {
    apiToken: env.VERCEL_API_TOKEN!.trim(),
    projectId: env.VERCEL_PROJECT_ID!.trim(),
    teamId: env.VERCEL_TEAM_ID?.trim() || undefined,
    target: env.VERCEL_TARGET?.trim() || "production",
  };
}

async function fetchLatestProductionDeploymentId(fetchImpl: FetchLike, config: ReturnType<typeof readVercelConfig>, apiKey: string) {
  const url = buildUrl("/v7/deployments", config.teamId, {
    projectId: config.projectId,
    target: config.target,
    limit: "1",
  });
  const payload = (await vercelFetch(
    fetchImpl,
    url,
    {
      method: "GET",
      headers: vercelHeaders(config.apiToken),
    },
    [config.apiToken, apiKey],
  )) as { deployments?: Array<{ uid?: string; id?: string }> };
  const deployment = payload.deployments?.[0];
  const deploymentId = deployment?.uid || deployment?.id;

  if (!deploymentId) {
    throw new VercelAutomationError("未找到可用于重新部署的 production deployment。");
  }

  return deploymentId;
}

async function vercelFetch(fetchImpl: FetchLike, url: string, init: RequestInit, secrets: string[]) {
  const response = await fetchImpl(url, init);
  const text = await response.text();

  if (!response.ok) {
    throw new VercelAutomationError(`Vercel API 返回 ${response.status}：${redact(text, secrets)}`);
  }

  if (!text) return {};

  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new VercelAutomationError(`Vercel API 返回了不可解析响应：${redact(text, secrets)}`);
  }
}

function vercelHeaders(apiToken: string) {
  return {
    Authorization: `Bearer ${apiToken}`,
    "Content-Type": "application/json",
  };
}

function buildProjectEnvUrl(projectId: string, teamId?: string) {
  return buildUrl(`/v10/projects/${encodeURIComponent(projectId)}/env`, teamId, { upsert: "true" });
}

function buildUrl(pathname: string, teamId?: string, params: Record<string, string> = {}) {
  const url = new URL(pathname, VERCEL_API_BASE);

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  if (teamId) {
    url.searchParams.set("teamId", teamId);
  }

  return url.toString();
}

function normalizeDeploymentUrl(url: string) {
  return url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;
}

function redact(value: string, secrets: string[]) {
  return secrets.reduce((current, secret) => {
    if (!secret) return current;
    return current.replaceAll(secret, "[REDACTED]");
  }, value.replace(/Bearer\s+[A-Za-z0-9._\-]+/gi, "Bearer [REDACTED]").replace(/Authorization/gi, "[REDACTED_HEADER]"));
}
