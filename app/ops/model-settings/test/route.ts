import { NextRequest, NextResponse } from "next/server";
import { testAdvisorModelConnection } from "@/lib/agent/modelConnectionTest";
import { hasOpsAccess, OPS_REVIEW_SESSION_COOKIE } from "@/lib/deployment/reviewAccess";

export async function POST(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") ?? undefined;
  const sessionCookie = request.cookies.get(OPS_REVIEW_SESSION_COOKIE)?.value;

  if (!hasOpsAccess({ token, sessionCookie })) {
    return NextResponse.json({ ok: false, errorMessage: "未授权访问内部模型测试接口。" }, { status: 401 });
  }

  const result = await testAdvisorModelConnection(await request.json());

  return NextResponse.json(result);
}
