"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  DEFAULT_MINIMAX_MODEL,
  DEFAULT_MODEL_TEST_MESSAGE,
  DEFAULT_OPENAI_MODEL,
  MINIMAX_MODEL_OPTIONS,
  OPENAI_MODEL_OPTIONS,
} from "@/lib/agent/modelConnectionConstants";

type Provider = "openai" | "minimax";
type DiagnosticStage = "http" | "json_parse" | "schema_validation" | "passed";

type EnvStatus = {
  currentProvider: string;
  openaiKeyConfigured: boolean;
  openaiModelConfigured: boolean;
  minimaxKeyConfigured: boolean;
  minimaxModelConfigured: boolean;
  vercelAutomationConfigured: boolean;
};

type TestResult = {
  ok: boolean;
  provider: Provider;
  model: string;
  stage?: string;
  replyPreview?: string;
  fallbackUsed?: boolean;
  diagnosticStage?: DiagnosticStage;
  responsePreview?: string;
  validationIssues?: string[];
  errorMessage?: string;
};

type SaveResult = {
  ok: boolean;
  testResult?: TestResult;
  envUpdated?: string[];
  deploymentId?: string;
  deploymentUrl?: string;
  message?: string;
  errorMessage?: string;
};

export function ModelSettingsTester({ envStatus }: { envStatus: EnvStatus }) {
  const [provider, setProvider] = useState<Provider>("minimax");
  const [model, setModel] = useState(DEFAULT_MINIMAX_MODEL);
  const [apiKey, setApiKey] = useState("");
  const [testMessage, setTestMessage] = useState(DEFAULT_MODEL_TEST_MESSAGE);
  const [result, setResult] = useState<TestResult | null>(null);
  const [saveResult, setSaveResult] = useState<SaveResult | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const modelOptions = provider === "minimax" ? MINIMAX_MODEL_OPTIONS : OPENAI_MODEL_OPTIONS;
  const canSubmit = useMemo(() => model.trim().length > 0 && apiKey.trim().length > 0 && !isTesting && !isSaving, [apiKey, isSaving, isTesting, model]);
  const canSave = result?.ok && result.provider === "minimax" && provider === "minimax" && envStatus.vercelAutomationConfigured && !isSaving && !isTesting;

  function updateProvider(nextProvider: Provider) {
    setProvider(nextProvider);
    setModel(nextProvider === "minimax" ? DEFAULT_MINIMAX_MODEL : DEFAULT_OPENAI_MODEL);
    setResult(null);
    setSaveResult(null);
  }

  async function submitTest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResult(null);
    setSaveResult(null);
    setIsTesting(true);

    try {
      const response = await fetch(opsApiPath("/ops/model-settings/test"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          model,
          apiKey,
          testMessage,
        }),
      });
      const payload = (await response.json()) as TestResult;
      setResult(payload);
    } catch {
      setResult({
        ok: false,
        provider,
        model,
        fallbackUsed: false,
        diagnosticStage: "http",
        errorMessage: "联通测试请求失败，请检查网络或稍后重试。",
      });
    } finally {
      setIsTesting(false);
    }
  }

  async function saveAndEnable() {
    setSaveResult(null);
    setIsSaving(true);

    try {
      const response = await fetch(opsApiPath("/ops/model-settings/save"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          model,
          apiKey,
          testMessage,
        }),
      });
      const payload = (await response.json()) as SaveResult;
      setSaveResult(payload);
    } catch {
      setSaveResult({
        ok: false,
        errorMessage: "保存请求失败，请检查网络或联系技术人员。",
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="rounded-ui border border-line bg-white p-5">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gold">Runtime status</p>
        <h2 className="mt-2 text-xl font-semibold text-ink">服务端环境变量状态</h2>
        <p className="mt-2 text-sm leading-6 text-ocean/70">这里只显示是否已配置，不显示具体 key、model 值或密钥内容。</p>
        <div className="mt-5 grid gap-3 text-sm">
          <StatusRow label="当前运行 Provider" value={envStatus.currentProvider} />
          <StatusRow label="OpenAI API Key" value={envStatus.openaiKeyConfigured ? "已配置" : "未配置"} />
          <StatusRow label="OpenAI Model" value={envStatus.openaiModelConfigured ? "已配置" : "未配置"} />
          <StatusRow label="MiniMax API Key" value={envStatus.minimaxKeyConfigured ? "已配置" : "未配置"} />
          <StatusRow label="MiniMax Model" value={envStatus.minimaxModelConfigured ? "已配置" : "未配置"} />
          <StatusRow label="自动保存能力" value={envStatus.vercelAutomationConfigured ? "已配置" : "未配置"} />
        </div>
        {!envStatus.vercelAutomationConfigured ? (
          <p className="mt-4 rounded-ui bg-gold/10 p-3 text-sm leading-6 text-ocean/75">
            当前环境未配置自动保存能力，请联系技术人员配置 Vercel 管理变量；联通测试仍可正常使用。
          </p>
        ) : null}
      </section>

      <section className="rounded-ui border border-line bg-white p-5">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gold">Connection test</p>
        <h2 className="mt-2 text-xl font-semibold text-ink">临时输入配置并测试联通</h2>
        <p className="mt-2 text-sm leading-6 text-ocean/70">
          API Key 只用于本次服务端联通测试；点击保存并启用后，服务端会写入部署环境变量，不会存到浏览器。不要把 API Key 发给无关人员。
        </p>
        <p className="mt-2 text-sm leading-6 text-ocean/70">默认使用 MiniMax 官方 OpenAI 兼容接口，运营人员无需填写接口地址。</p>

        <form className="mt-5 grid gap-4" onSubmit={submitTest}>
          <label className="grid gap-2 text-sm font-semibold text-ink">
            Provider
            <select
              className="rounded-ui border border-line px-3 py-3 text-sm"
              onChange={(event) => updateProvider(event.target.value as Provider)}
              value={provider}
            >
              <option value="minimax">MiniMax</option>
              <option value="openai">OpenAI</option>
            </select>
          </label>

          <label className="grid gap-2 text-sm font-semibold text-ink">
            Model
            <select className="rounded-ui border border-line px-3 py-3 text-sm" onChange={(event) => setModel(event.target.value)} required value={model}>
              {modelOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-semibold text-ink">
            API Key
            <input
              autoComplete="off"
              className="rounded-ui border border-line px-3 py-3 text-sm"
              onChange={(event) => {
                setApiKey(event.target.value);
                setSaveResult(null);
              }}
              placeholder="仅用于本次服务端测试与保存，不会写入浏览器"
              required
              type="password"
              value={apiKey}
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-ink">
            Test message
            <textarea className="min-h-24 rounded-ui border border-line px-3 py-3 text-sm" onChange={(event) => setTestMessage(event.target.value)} value={testMessage} />
          </label>

          <button className="rounded-ui bg-ink px-4 py-3 text-sm font-semibold text-white disabled:opacity-50" disabled={!canSubmit} type="submit">
            {isTesting ? "测试中..." : "测试联通"}
          </button>
        </form>

        {result ? (
          <div className={`mt-5 rounded-ui border p-4 text-sm ${result.ok ? "border-teal bg-teal/10" : "border-red-200 bg-red-50"}`}>
            <p className="font-semibold text-ink">{result.ok ? "联通测试通过" : "联通测试失败"}</p>
            <div className="mt-3 grid gap-2 text-ocean/75">
              <StatusRow label="Provider" value={result.provider} />
              <StatusRow label="Model" value={result.model} />
              <StatusRow label="Fallback" value={result.fallbackUsed ? "已使用" : "未使用"} />
              {result.diagnosticStage ? <StatusRow label="Diagnostic" value={diagnosticLabel(result.diagnosticStage)} /> : null}
              {result.stage ? <StatusRow label="Stage" value={result.stage} /> : null}
              {result.replyPreview ? <StatusRow label="Reply Preview" value={result.replyPreview} /> : null}
              {result.errorMessage ? <StatusRow label="Error" value={result.errorMessage} /> : null}
              {result.diagnosticStage === "schema_validation" ? <StatusRow label="Issues Count" value={String(result.validationIssues?.length ?? 0)} /> : null}
            </div>

            {result.diagnosticStage === "schema_validation" ? (
              <div className="mt-4 rounded-ui border border-line bg-white/70 p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ocean/50">Validation Issues</p>
                {result.validationIssues?.length ? (
                  <ul className="mt-2 grid gap-1 text-xs leading-5 text-ocean/75">
                    {result.validationIssues.map((issue) => (
                      <li key={issue}>{issue}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-xs leading-5 text-ocean/75">结构校验失败，但没有返回具体字段路径；请查看 Response Preview。</p>
                )}
              </div>
            ) : null}

            {result.responsePreview ? (
              <div className="mt-4 rounded-ui border border-line bg-white/70 p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ocean/50">Response Preview</p>
                <pre className="mt-2 whitespace-pre-wrap break-words text-xs leading-5 text-ocean/75">{result.responsePreview}</pre>
              </div>
            ) : null}

            {result.ok && provider === "minimax" ? (
              <div className="mt-4 rounded-ui border border-line bg-white/75 p-4">
                <p className="text-sm font-semibold text-ink">MiniMax 联通已通过</p>
                <p className="mt-1 text-sm leading-6 text-ocean/70">
                  保存并启用会写入 ADVISOR_AGENT_PROVIDER、MINIMAX_ADVISOR_MODEL、MINIMAX_API_KEY，并触发重新部署。
                </p>
                <button
                  className="mt-3 rounded-ui bg-teal px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
                  disabled={!canSave}
                  onClick={saveAndEnable}
                  type="button"
                >
                  {isSaving ? "保存中 / 部署中..." : "保存并启用 MiniMax"}
                </button>
                {!envStatus.vercelAutomationConfigured ? (
                  <p className="mt-2 text-xs leading-5 text-ocean/60">当前环境未配置自动保存能力，请联系技术人员配置 VERCEL_API_TOKEN/PROJECT_ID。</p>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}

        {saveResult ? (
          <div className={`mt-5 rounded-ui border p-4 text-sm ${saveResult.ok ? "border-teal bg-teal/10" : "border-red-200 bg-red-50"}`}>
            <p className="font-semibold text-ink">{saveResult.ok ? "已提交部署" : "保存或部署失败"}</p>
            <div className="mt-3 grid gap-2 text-ocean/75">
              {saveResult.message ? <StatusRow label="Message" value={saveResult.message} /> : null}
              {saveResult.errorMessage ? <StatusRow label="Error" value={saveResult.errorMessage} /> : null}
              {saveResult.envUpdated?.length ? <StatusRow label="已更新" value={saveResult.envUpdated.join(" / ")} /> : null}
              {saveResult.deploymentId ? <StatusRow label="Deployment ID" value={saveResult.deploymentId} /> : null}
              {saveResult.deploymentUrl ? <StatusRow label="Deployment URL" value={saveResult.deploymentUrl} /> : null}
            </div>
            {saveResult.ok ? <p className="mt-3 text-sm leading-6 text-ocean/70">部署完成后，AI 顾问将使用 MiniMax。页面不会显示完整 API Key。</p> : null}
          </div>
        ) : null}
      </section>
    </div>
  );
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-line/70 pb-2 last:border-0 last:pb-0">
      <span className="text-ocean/60">{label}</span>
      <span className="text-right font-semibold text-ink">{value}</span>
    </div>
  );
}

function diagnosticLabel(stage: DiagnosticStage) {
  const labels: Record<DiagnosticStage, string> = {
    http: "HTTP/API 联通",
    json_parse: "JSON 解析",
    schema_validation: "结构校验",
    passed: "结构校验通过",
  };

  return labels[stage];
}

function opsApiPath(path: string) {
  if (typeof window === "undefined") return path;

  const token = new URLSearchParams(window.location.search).get("token");

  if (!token) return path;

  const params = new URLSearchParams({ token });
  return `${path}?${params.toString()}`;
}
