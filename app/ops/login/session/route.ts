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

  const response = new NextResponse(createLoginCompletionHtml(next), {
    headers: {
      "cache-control": "no-store",
      "content-type": "text/html; charset=utf-8",
    },
    status: 200,
  });
  response.cookies.set(OPS_REVIEW_SESSION_COOKIE, createOpsSessionValue(), {
    httpOnly: true,
    maxAge: OPS_REVIEW_SESSION_MAX_AGE_SECONDS,
    path: "/ops",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}

function createLoginCompletionHtml(next: string) {
  const nextJson = JSON.stringify(next);
  const escapedNext = escapeHtmlAttribute(next);

  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="robots" content="noindex,nofollow" />
    <meta http-equiv="refresh" content="0;url=${escapedNext}" />
    <title>会出海内部运营入口</title>
  </head>
  <body>
    <p>正在进入内部运营预览...</p>
    <script>window.location.replace(${nextJson});</script>
  </body>
</html>`;
}

function escapeHtmlAttribute(value: string) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
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
