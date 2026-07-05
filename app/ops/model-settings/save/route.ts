import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { testAdvisorModelConnection } from "@/lib/agent/modelConnectionTest";
import { hasOpsAccess, OPS_REVIEW_SESSION_COOKIE } from "@/lib/deployment/reviewAccess";
import { saveAdvisorModelEnvAndRedeploy } from "@/lib/deployment/vercelEnv";

const saveRequestSchema = z.object({
  provider: z.literal("minimax"),
  model: z.string().trim().min(1),
  apiKey: z.string().trim().min(1),
  testMessage: z.string().trim().optional(),
});

export async function POST(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") ?? undefined;
  const sessionCookie = request.cookies.get(OPS_REVIEW_SESSION_COOKIE)?.value;

  if (!hasOpsAccess({ token, sessionCookie })) {
    return NextResponse.json({ ok: false, errorMessage: "未授权访问内部模型保存接口。" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = saveRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        errorMessage: "保存失败：当前仅支持 MiniMax，并且必须填写 Model 与 API Key。",
      },
      { status: 400 },
    );
  }

  const input = parsed.data;
  const testResult = await testAdvisorModelConnection({
    provider: input.provider,
    model: input.model,
    apiKey: input.apiKey,
    testMessage: input.testMessage,
  });

  if (!testResult.ok) {
    return NextResponse.json({
      ok: false,
      testResult,
      message: "联通测试未通过，未写入 Vercel 环境变量。",
    });
  }

  try {
    const saveResult = await saveAdvisorModelEnvAndRedeploy({
      provider: input.provider,
      model: input.model,
      apiKey: input.apiKey,
    });

    return NextResponse.json({
      ok: true,
      testResult,
      envUpdated: saveResult.envUpdated,
      deploymentId: saveResult.deploymentId,
      deploymentUrl: saveResult.deploymentUrl,
      message: "MiniMax 配置已写入 Vercel 环境变量，并已提交部署。",
    });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      testResult,
      envUpdated: [],
      errorMessage: error instanceof Error ? error.message : "保存失败：Vercel 自动保存或部署请求异常。",
    });
  }
}
