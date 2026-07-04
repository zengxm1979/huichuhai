import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getOpsAccessState, OPS_REVIEW_SESSION_COOKIE, sanitizeOpsNextPath } from "@/lib/deployment/reviewAccess";

export async function requireOpsAccess(pathname: string, token?: string) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(OPS_REVIEW_SESSION_COOKIE)?.value;
  const accessState = getOpsAccessState({ token, sessionCookie });

  if (accessState === "denied") {
    redirect(`/ops/login?next=${encodeURIComponent(pathname)}`);
  }

  return accessState;
}

export function getOpsLoginTarget(rawNext?: string | null) {
  return sanitizeOpsNextPath(rawNext);
}
