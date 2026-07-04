"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { Bot, CheckCircle2, MessageCircle, Send, X } from "lucide-react";
import { ADVISOR_OPEN_EVENT } from "@/components/advisor/OpenAdvisorButton";
import { buildAdvisorConfigurationHref } from "@/lib/advisor/advisorUrlState";
import { mergeAgentPayloadIntoSummary, requestAdvisorAgentTurn } from "@/lib/agent/client";
import type { CustomerAgentTurnPayload } from "@/lib/agent/schemas";
import {
  advisorCityOptions,
  buildAdvisorReply,
  consultationProgress,
  createInitialRequirementSummary,
  extractRequirementsFromText,
  isRequirementReady,
  mergeRequirements,
  summaryToDisplayRows,
  type AdvisorRequirementSummary,
  type LightChatMessage,
} from "@/lib/advisor/lightConversation";

const initialMessage: LightChatMessage = {
  role: "advisor",
  text: "您好，我是会出海 AI 办会顾问。你可以先问城市适不适合、活动方向怎么做，或告诉我一个初步想法；我会先给建议，再一起收窄到可执行方案。[MOCK]",
};

export function AdvisorLightChat() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [summary, setSummary] = useState<AdvisorRequirementSummary>(() => createInitialRequirementSummary());
  const [messages, setMessages] = useState<LightChatMessage[]>([initialMessage]);
  const [agentPayload, setAgentPayload] = useState<CustomerAgentTurnPayload | null>(null);
  const [isSending, setIsSending] = useState(false);
  const hiddenOnOps = pathname?.startsWith("/ops");

  const ready = useMemo(() => agentPayload?.canEnterConfigurator ?? isRequirementReady(summary), [agentPayload, summary]);
  const configurationHref = useMemo(() => buildAdvisorConfigurationHref(summary), [summary]);
  const displayRows = useMemo(() => agentPayload?.summaryRows ?? summaryToDisplayRows(summary), [agentPayload, summary]);
  const progressLabel = agentPayload?.progressLabel ?? consultationProgress(summary);

  useEffect(() => {
    function handleOpen() {
      setOpen(true);
    }

    window.addEventListener(ADVISOR_OPEN_EVENT, handleOpen);
    return () => window.removeEventListener(ADVISOR_OPEN_EVENT, handleOpen);
  }, []);

  if (hiddenOnOps) return null;

  async function applyCustomerText(text: string) {
    const clean = text.trim();
    if (!clean) return;

    setInput("");
    setIsSending(true);
    setMessages((items) => [...items, { role: "customer", text: clean }]);

    try {
      const payload = await requestAdvisorAgentTurn({
        message: clean,
        summary,
        entryPage: pathname === "/inquiry" ? "inquiry" : pathname === "/advisor" ? "advisor" : "home",
      });
      const next = mergeAgentPayloadIntoSummary(summary, payload);
      setAgentPayload(payload);
      setSummary(next);
      setMessages((items) => [...items, { role: "advisor", text: payload.reply }]);
    } catch {
      const next = mergeRequirements(summary, extractRequirementsFromText(clean));
      setAgentPayload(null);
      setSummary(next);
      setMessages((items) => [...items, { role: "advisor", text: buildAdvisorReply(next, clean) }]);
    } finally {
      setIsSending(false);
    }
  }

  async function selectCity(city: string) {
    const next = mergeRequirements(summary, {
      eventCity: city,
      locationFlexibility: city === "暂未确定" ? "undecided" : "locked",
    });
    setSummary(next);
    setOpen(true);
    await applyCustomerText(`会务地点：${city}`);
  }

  return (
    <>
      <button
        aria-label="打开 AI 办会顾问"
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-ui bg-gold px-4 py-3 text-sm font-semibold text-ink shadow-soft"
        onClick={() => setOpen(true)}
        type="button"
      >
        <MessageCircle size={18} />
        AI 顾问
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 bg-ink/45">
          <aside className="ml-auto flex h-full w-full max-w-[430px] flex-col bg-white shadow-soft">
            <header className="flex items-center justify-between border-b border-line bg-ink px-5 py-4 text-white">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-[radial-gradient(circle_at_35%_30%,#f3c679,#1aa6a6_45%,#061d32_72%)]">
                  <Bot size={20} />
                </span>
                <div>
                  <p className="font-semibold">AI 办会顾问</p>
                  <p className="text-xs text-white/60">先回答方向，再收窄配置 [MOCK]</p>
                </div>
              </div>
              <button className="rounded-ui p-2 text-white/70 hover:bg-white/10" onClick={() => setOpen(false)} type="button">
                <X size={18} />
              </button>
            </header>

            <div className="border-b border-line bg-cloud px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">Target city</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {advisorCityOptions.map((city) => (
                  <button
                    className={`rounded-ui border px-3 py-2 text-xs font-semibold ${
                      summary.eventCity === city ? "border-teal bg-teal/10 text-teal" : "border-line bg-white text-ocean"
                    }`}
                    key={city}
                    onClick={() => selectCity(city)}
                    type="button"
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 overflow-y-auto px-5 py-4">
              <section className="rounded-ui border border-line bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-semibold text-ink">咨询进度 / 轻摘要</h2>
                  <span className="rounded-ui bg-gold/15 px-2 py-1 text-xs font-semibold text-ocean">
                    {progressLabel}
                  </span>
                </div>
                <div className="mt-3 grid gap-2 text-sm">
                  {displayRows.map((row) => (
                    <div className="flex justify-between gap-4 border-b border-line/70 pb-2 last:border-0 last:pb-0" key={row.label}>
                      <span className="text-ocean/60">{row.label}</span>
                      <span className="text-right font-semibold text-ink">{row.value}</span>
                    </div>
                  ))}
                </div>
                {ready ? (
                  <Link
                    className="mt-4 flex items-center justify-center gap-2 rounded-ui bg-gold px-4 py-3 text-sm font-semibold text-ink"
                    href={configurationHref}
                    onClick={() => setOpen(false)}
                  >
                    <CheckCircle2 size={16} />
                    进入方案配置
                  </Link>
                ) : null}
              </section>

              <section className="grid max-h-[360px] gap-3 overflow-y-auto rounded-ui bg-cloud p-4">
                {messages.map((message, index) => (
                  <div
                    className={`max-w-[88%] rounded-ui px-4 py-3 text-sm leading-6 ${
                      message.role === "advisor" ? "bg-white text-ink" : "ml-auto bg-teal text-white"
                    }`}
                    key={`${message.role}-${index}`}
                  >
                    {message.text}
                  </div>
                ))}
              </section>
            </div>

            <footer className="mt-auto border-t border-line bg-white p-4">
              <div className="flex gap-2">
                <input
                  className="min-w-0 flex-1 rounded-ui border border-line px-3 py-3 text-sm outline-none focus:border-teal"
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") applyCustomerText(input);
                  }}
                  placeholder="例如：我想到新山举办投资大会，有什么建议的方案吗？"
                  value={input}
                />
                <button
                  className="rounded-ui bg-ink px-4 py-3 text-white disabled:opacity-55"
                  disabled={isSending}
                  onClick={() => applyCustomerText(input)}
                  type="button"
                >
                  <Send size={16} />
                </button>
              </div>
              <p className="mt-2 text-xs leading-5 text-ocean/60">
                预算为结构估算或参考范围，不是正式报价。正式价格、档期、付款和取消条款需顾问基于本次询价确认。
              </p>
            </footer>
          </aside>
        </div>
      ) : null}
    </>
  );
}
