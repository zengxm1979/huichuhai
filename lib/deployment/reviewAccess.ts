export const DEFAULT_OPS_REVIEW_TOKEN = "hch-review-202607";
export const DEFAULT_OPS_REVIEW_PASSWORD = "hch-ops-202607";
export const OPS_REVIEW_SESSION_COOKIE = "hch_ops_review_session";
export const OPS_REVIEW_SESSION_MAX_AGE_SECONDS = 60 * 60 * 12;

export function getOpsPreviewToken(env: NodeJS.ProcessEnv = process.env) {
  const token = env.OPS_PREVIEW_TOKEN?.trim();
  return token || DEFAULT_OPS_REVIEW_TOKEN;
}

export function getOpsReviewPassword(env: NodeJS.ProcessEnv = process.env) {
  const password = env.OPS_REVIEW_PASSWORD?.trim();
  return password || DEFAULT_OPS_REVIEW_PASSWORD;
}

export function isOpsReviewPassword(input: string, env: NodeJS.ProcessEnv = process.env) {
  return input.trim() === getOpsReviewPassword(env);
}

export function createOpsSessionValue(env: NodeJS.ProcessEnv = process.env) {
  return `ops-review-${hashString(getOpsReviewPassword(env))}`;
}

export function getOpsAccessState(
  access: {
    token?: string;
    sessionCookie?: string;
  },
  env: NodeJS.ProcessEnv = process.env,
) {
  if (access.sessionCookie && access.sessionCookie === createOpsSessionValue(env)) {
    return "authenticated" as const;
  }

  if (access.token && access.token === getOpsPreviewToken(env)) {
    return "token" as const;
  }

  return "denied" as const;
}

export function hasOpsAccess(access: { token?: string; sessionCookie?: string }, env: NodeJS.ProcessEnv = process.env) {
  return getOpsAccessState(access, env) !== "denied";
}

export function sanitizeOpsNextPath(raw?: string | null) {
  if (!raw) return "/ops/resources";

  if (!raw.startsWith("/ops/")) return "/ops/resources";
  if (raw.startsWith("/ops/login") || raw.startsWith("/ops/logout")) return "/ops/resources";
  if (raw.includes("://") || raw.startsWith("//")) return "/ops/resources";

  return raw;
}

function hashString(input: string) {
  let hash = 5381;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 33) ^ input.charCodeAt(index);
  }
  return (hash >>> 0).toString(36);
}
