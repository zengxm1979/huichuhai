"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  createOpsSessionValue,
  isOpsReviewPassword,
  OPS_REVIEW_SESSION_COOKIE,
  OPS_REVIEW_SESSION_MAX_AGE_SECONDS,
  sanitizeOpsNextPath,
} from "@/lib/deployment/reviewAccess";

export async function loginOps(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const next = sanitizeOpsNextPath(String(formData.get("next") ?? ""));

  if (!isOpsReviewPassword(password)) {
    redirect(`/ops/login?error=1&next=${encodeURIComponent(next)}`);
  }

  const cookieStore = await cookies();
  cookieStore.set(OPS_REVIEW_SESSION_COOKIE, createOpsSessionValue(), {
    httpOnly: true,
    maxAge: OPS_REVIEW_SESSION_MAX_AGE_SECONDS,
    path: "/ops",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  redirect(next);
}
