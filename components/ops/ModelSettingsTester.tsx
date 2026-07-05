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

type EnvStatus = {
  currentProvider: string;
  openaiKeyConfigured: boolean;
  openaiModelConfigured: boolean;
  minimaxKeyConfigured: boolean;
  minimaxModelConfigured: boolean;
};

type TestResult = {
  ok: boolean;
  provider: Provider;
  model: string;
  stage?: string;
  replyPreview?: string;
  fallbackUsed?: boolean;
  errorMessage?: string;
};

export function ModelSettingsTester({ envStatus }: { envStatus: EnvStatus }) {
  const [provider, setProvider] = useState<Provider>("minimax");
  const [model, setModel] = useState(DEFAULT_MINIMAX_MODEL);
  const [apiKey, setApiKey] = useState("");
  const [testMessage, setTestMessage] = useState(DEFAULT_MODEL_TEST_MESSAGE);
  const [result, setResult] = useState<TestResult | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const modelOptions = provider === "minimax" ? MINIMAX_MODEL_OPTIONS : OPENAI_MODEL_OPTIONS;
  const canSubmit = useMemo(() => model.trim().length > 0 && apiKey.trim().length > 0 && !isTesting, [apiKey, isTesting, model]);

  function updateProvider(nextProvider: Provider) {
    setProvider(nextProvider);
    setModel(nextProvider === "minimax" ? DEFAULT_MINIMAX_MODEL : DEFAULT_OPENAI_MODEL);
    setResult(null);
  }

  async function submitTest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResult(null);
    setIsTesting(true);

    try {
      const response = await fetch("/ops/model-settings/test", {
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
        errorMessage: "联通测试请求失败，请检查网络或稍后重试。",
      });
    } finally {
      setIsTesting(false);
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
        </div>
      </section>

      <section className="rounded-ui border border-line bg-white p-5">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gold">Connection test</p>
        <h2 className="mt-2 text-xl font-semibold text-ink">临时输入配置并测试联通</h2>
        <p className="mt-2 text-sm leading-6 text-ocean/70">
          API Key 只用于本次服务端联通测试，不会保存；正式启用请配置部署环境变量。不要把 API Key 发给无关人员。
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
              onChange={(event) => setApiKey(event.target.value)}
              placeholder="仅用于本次测试，不会保存"
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
              {result.stage ? <StatusRow label="Stage" value={result.stage} /> : null}
              {result.replyPreview ? <StatusRow label="Reply Preview" value={result.replyPreview} /> : null}
              {result.errorMessage ? <StatusRow label="Error" value={result.errorMessage} /> : null}
            </div>
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
