import { NextResponse, type NextRequest } from "next/server";
import {
  createOpsSessionValue,
  isOpsReviewPassword,
  OPS_REVIEW_SESSION_COOKIE,
  OPS_REVIEW_SESSION_MAX_AGE_SECONDS,
  sanitizeOpsNextPath,
} from "@/lib/deployment/reviewAccess";

export async function POST(request: NextRequest | Request) {
  const formData = await request.formData();
  const password = String(formData.get("password") ?? "");
  const next = sanitizeOpsNextPath(String(formData.get("next") ?? ""));
  const origin = getRequestOrigin(request);

  if (!isOpsReviewPassword(password)) {
    return NextResponse.redirect(new URL(`/ops/login?error=1&next=${encodeURIComponent(next)}`, origin), 303);
  }

  const response = NextResponse.redirect(new URL(next, origin), 303);
  response.cookies.set(OPS_REVIEW_SESSION_COOKIE, createOpsSessionValue(), {
    httpOnly: true,
    maxAge: OPS_REVIEW_SESSION_MAX_AGE_SECONDS,
    path: "/ops",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}

function getRequestOrigin(request: NextRequest | Request) {
  const requestUrl = new URL(request.url);
  const forwardedHost = firstForwardedValue(request.headers.get("x-forwarded-host"));
  const forwardedProto = firstForwardedValue(request.headers.get("x-forwarded-proto"));
  const host = forwardedHost || request.headers.get("host") || requestUrl.host;
  const protocol = forwardedProto || requestUrl.protocol.replace(":", "");

  return `${protocol}://${host}`;
}

function firstForwardedValue(value: string | null) {
  return value?.split(",")[0]?.trim() || "";
}
