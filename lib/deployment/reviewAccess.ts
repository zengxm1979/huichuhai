export const DEFAULT_OPS_REVIEW_TOKEN = "hch-review-202607";

export function getOpsPreviewToken(env: NodeJS.ProcessEnv = process.env) {
  const token = env.OPS_PREVIEW_TOKEN?.trim();
  return token || DEFAULT_OPS_REVIEW_TOKEN;
}
