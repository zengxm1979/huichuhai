"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  CheckCircle2,
  Circle,
  Minus,
  Plus,
  Send,
  Sparkles,
} from "lucide-react";
import {
  advisorCityOptions,
  buildAdvisorReply,
  consultationProgress,
  createInitialRequirementSummary,
  extractRequirementsFromText,
  getMissingFields,
  isRequirementReady,
  mergeRequirements,
  shouldAutoSubmitDraft,
  summaryToDisplayRows,
  type AdvisorRequirementSummary,
  type LightChatMessage,
} from "@/lib/advisor/lightConversation";
import { buildAdvisorConfigurationHref } from "@/lib/advisor/advisorUrlState";
import { mergeAgentPayloadIntoSummary, requestAdvisorAgentTurn } from "@/lib/agent/client";
import type { CustomerAgentTurnPayload } from "@/lib/agent/schemas";
import { PACKAGE_TIERS, type PackageTierId, type PackageTierLabel } from "@/lib/constants/packageTiers";
import type { AdvisorStep, CustomerAdvisorState, ServiceSelection, ServiceSelectionStatus } from "@/lib/advisor/types";

const tabs: Array<{ key: AdvisorStep; label: string }> = [
  { key: "initial", label: "初始咨询" },
  { key: "configuration", label: "方案配置" },
  { key: "budgetMismatch", label: "预算不匹配" },
  { key: "submit", label: "提交顾问确认" },
];

const tierConfig: Record<PackageTierId, { label: PackageTierLabel; multiplier: number; summary: string; confirmations: string[] }> = {
  economy: {
    label: "经济型",
    multiplier: 0.78,
    summary: "经济型会保留场地、基础茶歇、必要 AV 和核心物料，优先压缩晚宴、住宿和影像配置。",
    confirmations: ["基础 AV 是否够用", "会议物料范围", "是否保留晚宴"],
  },
  standard: {
    label: "标准型",
    multiplier: 1,
    summary: "标准型覆盖会议、晚宴、住宿、交通和物料，适合大多数经销商大会和企业活动。",
    confirmations: ["酒店档期", "晚宴菜单", "付款、取消与合同条款"],
  },
  premium: {
    label: "高配型",
    multiplier: 1.28,
    summary: "高配型会强化品牌呈现、现场体验和接待配置，适合发布会、重要客户活动和高规格会议。",
    confirmations: ["品牌视觉规格", "贵宾接待动线", "高配 AV 与舞台方案"],
  },
};

export function AdvisorPanel({ state }: { state: CustomerAdvisorState }) {
  const initialTier = getTierId(state.inquiry.selectedPackage);
  const [selectedTier, setSelectedTier] = useState<PackageTierId>(initialTier);
  const [services, setServices] = useState(() => normalizeServices(state.serviceSelections));
  const [input, setInput] = useState("");
  const [lastSubmittedText, setLastSubmittedText] = useState("");
  const [draftInquiry, setDraftInquiry] = useState(state.inquiry);
  const [requirementSummary, setRequirementSummary] = useState<AdvisorRequirementSummary>(() => summaryFromInquiry(state.inquiry));
  const [agentPayload, setAgentPayload] = useState<CustomerAgentTurnPayload | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<LightChatMessage[]>([
    {
      role: "advisor",
      text: "您好，我是会出海 AI 办会顾问。你可以先问城市适不适合、活动方向怎么做，或告诉我一个初步想法；我会先给建议，再一起收窄到可执行方案。[MOCK]",
    },
  ]);

  const budget = useMemo(() => calculateBudget(services, selectedTier), [services, selectedTier]);
  const selectedTierConfig = tierConfig[selectedTier];
  const readyForConfiguration = agentPayload?.canEnterConfigurator ?? isRequirementReady(requirementSummary);
  const configurationHref = useMemo(() => buildAdvisorConfigurationHref(requirementSummary), [requirementSummary]);
  const initialSummaryRows = agentPayload?.summaryRows ?? summaryToDisplayRows(requirementSummary);
  const currentSummary =
    state.step === "budgetMismatch"
      ? "当前预算和服务范围存在缺口，可以先调低部分服务项，或提交顾问基于本次询价确认资源价格和档期。"
      : selectedTierConfig.summary;

  function adjustService(id: string, direction: "up" | "down") {
    setServices((current) =>
      current.map((service) => {
        if (service.id !== id) return service;
        const nextQuantity =
          direction === "up" ? service.quantity + quantityStep(service) : Math.max(0, service.quantity - quantityStep(service));

        return {
          ...service,
          quantity: nextQuantity,
          selectionStatus: nextQuantity === 0 ? "removed" : nextQuantity < service.originalQuantity ? "optional" : "selected",
        };
      }),
    );
  }

  function applySummary(next: AdvisorRequirementSummary) {
    setRequirementSummary(next);
    setDraftInquiry((current) => ({
      ...current,
      city: next.eventCity ?? current.city,
      eventType: next.eventType ?? current.eventType,
      attendeeCount: next.attendeeCount ?? current.attendeeCount,
      budgetRange: next.budgetRange ?? current.budgetRange,
      eventStartDate: next.eventDate ?? current.eventStartDate,
    }));
  }

  async function sendMessage(text = input) {
    const clean = text.trim();
    if (!clean) return;
    setMessages((current) => [...current, { role: "customer", text: clean }]);
    setLastSubmittedText(clean);
    setInput("");
    setIsSending(true);

    try {
      const payload = await requestAdvisorAgentTurn({
        message: clean,
        summary: requirementSummary,
        entryPage: "advisor",
      });
      const next = mergeAgentPayloadIntoSummary(requirementSummary, payload);
      setAgentPayload(payload);
      applySummary(next);
      setMessages((current) => [...current, { role: "advisor", text: payload.reply }]);
    } catch {
      const next = mergeRequirements(requirementSummary, extractRequirementsFromText(clean));
      setAgentPayload(null);
      applySummary(next);
      setMessages((current) => [...current, { role: "advisor", text: buildAdvisorReply(next, clean) }]);
    } finally {
      setIsSending(false);
    }
  }

  function handleInputChange(value: string) {
    setInput(value);
    const patch = extractRequirementsFromText(value);
    const next = mergeRequirements(requirementSummary, patch);

    if (Object.keys(patch).length > 0) {
      applySummary(next);
    }

    if (shouldAutoSubmitDraft(value, lastSubmittedText)) {
      void sendMessage(value);
    }
  }

  async function selectCity(city: string) {
    const next = mergeRequirements(requirementSummary, {
      eventCity: city,
      locationFlexibility: city === "暂未确定" ? "undecided" : "locked",
    });
    applySummary(next);
    await sendMessage(`会务地点：${city}`);
  }

  return (
    <main className="min-h-screen bg-cloud">
      <section className="bg-ink text-white">
        <div className="mx-auto max-w-7xl px-5 py-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link className="flex items-center gap-3" href="/">
              <span className="grid h-10 w-10 place-items-center rounded-ui border border-gold/50 bg-gold/15 font-semibold text-gold">
                会
              </span>
              <span>
                <span className="block text-lg font-semibold">会出海</span>
                <span className="text-sm text-gold">AI 办会顾问</span>
              </span>
            </Link>
            <div className="flex flex-wrap gap-2 rounded-ui bg-white/8 p-1">
              {tabs.map((tab) => (
                <Link
                  className={`rounded-ui px-4 py-2 text-sm font-semibold ${
                    state.step === tab.key ? "bg-gold text-ink" : "text-white/75"
                  }`}
                  href={`/advisor?state=${tab.key}`}
                  key={tab.key}
                >
                  {tab.label}
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-3 rounded-ui border border-teal/50 px-4 py-2">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-[radial-gradient(circle_at_35%_30%,#f3c679,#1aa6a6_45%,#061d32_72%)]">
                <Bot size={20} />
              </div>
              <div>
                <p className="font-semibold text-teal">AI 办会顾问</p>
                <p className="text-xs text-white/65">抽象数字顾问形象</p>
              </div>
            </div>
          </div>

          {state.step === "initial" ? (
            <div className="mt-6 grid gap-3 rounded-ui bg-white/8 p-4 text-sm md:grid-cols-5">
              {initialSummaryRows.map((row) => (
                <HeaderMetric key={row.label} label={row.label} value={row.value} />
              ))}
            </div>
          ) : (
            <div className="mt-6 grid gap-3 rounded-ui bg-white/8 p-4 text-sm md:grid-cols-5">
              <HeaderMetric label="当前询盘" value={draftInquiry.eventType ?? "待补充"} />
              <HeaderMetric label="预计人数" value={draftInquiry.attendeeCount ? `${draftInquiry.attendeeCount} 人` : "待确认"} />
              <HeaderMetric label="举办时间" value={draftInquiry.eventStartDate ?? "待确认"} />
              <HeaderMetric label="地点" value={draftInquiry.city ?? "待确认"} />
              <HeaderMetric label="预算范围" value={draftInquiry.budgetRange ?? "待确认"} />
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <HeroState state={state} />
          {state.step === "initial" ? (
            <InitialConsultation
              input={input}
              configurationHref={configurationHref}
              messages={messages}
              onCitySelect={selectCity}
              onInput={handleInputChange}
              onSend={sendMessage}
              isSending={isSending}
              ready={readyForConfiguration}
              summary={requirementSummary}
            />
          ) : null}
          {state.step !== "initial" ? <PackageSelector onSelect={setSelectedTier} selected={selectedTier} /> : null}
          {state.step !== "initial" ? (
            <ServiceSelectionTable onAdjust={adjustService} services={services} tier={selectedTier} />
          ) : null}
        </div>
        {state.step === "initial" ? (
          <InitialSummaryPanel
            configurationHref={configurationHref}
            ready={readyForConfiguration}
            rows={initialSummaryRows}
            progressLabel={agentPayload?.progressLabel}
            summary={requirementSummary}
          />
        ) : (
          <BudgetSidePanel
            budget={budget}
            currentSummary={currentSummary}
            selectedTier={selectedTier}
            services={services}
            state={state}
          />
        )}
      </section>
    </main>
  );
}

function HeaderMetric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-white/45">{label}</p>
      <p className="mt-1 font-semibold text-white">{value}</p>
    </div>
  );
}

function HeroState({ state }: { state: CustomerAdvisorState }) {
  const titles: Record<AdvisorStep, string> = {
    initial: "先聊办会方向",
    configuration: "吉隆坡 · 商务会议方案配置",
    budgetMismatch: "预算范围需要进一步调整",
    submit: "提交顾问确认前，请核对方案摘要",
  };

  return (
    <section className="relative overflow-hidden rounded-ui bg-ink text-white">
      <img
        alt="商务会议厅示例图"
        className="h-64 w-full object-cover opacity-60"
        src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1800&q=85"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-transparent" />
      <div className="absolute inset-0 flex flex-col justify-end p-6">
        <p className="text-sm text-gold">方案内容均为示例 [MOCK]，预算为参考范围，不承诺实时档期和最终价格</p>
        <h1 className="mt-2 max-w-3xl text-3xl font-semibold md:text-4xl">{titles[state.step]}</h1>
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-white/78">
          <span>国际化场地资源</span>
          <span>华人服务团队</span>
          <span>落地执行保障</span>
        </div>
      </div>
    </section>
  );
}

function PackageSelector({ onSelect, selected }: { onSelect: (tier: PackageTierId) => void; selected: PackageTierId }) {
  return (
    <section className="rounded-ui border border-line bg-white p-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-ink">选择方案包</h2>
          <p className="mt-1 text-sm text-ocean/70">切换后会联动预算区间、服务建议和待确认事项。</p>
        </div>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {PACKAGE_TIERS.map((tier) => (
          <button
            className={`rounded-ui border p-4 text-left transition ${
              selected === tier.id ? "border-teal bg-teal/10" : "border-line bg-white hover:border-teal/50"
            }`}
            key={tier.id}
            onClick={() => onSelect(tier.id)}
            type="button"
          >
            <div className="flex items-center gap-3">
              {selected === tier.id ? <CheckCircle2 className="text-teal" size={20} /> : <Circle className="text-ocean/35" size={20} />}
              <p className="font-semibold text-ink">{tier.label}</p>
            </div>
            <p className="mt-2 text-sm leading-6 text-ocean/70">{tier.description}</p>
          </button>
        ))}
      </div>
    </section>
  );
}

function InitialConsultation({
  input,
  configurationHref,
  messages,
  onCitySelect,
  onInput,
  onSend,
  isSending,
  ready,
  summary,
}: {
  input: string;
  configurationHref: string;
  messages: LightChatMessage[];
  onCitySelect: (city: string) => void;
  onInput: (value: string) => void;
  onSend: (value?: string) => void;
  isSending: boolean;
  ready: boolean;
  summary: AdvisorRequirementSummary;
}) {
  return (
    <section className="grid gap-4 rounded-ui border border-line bg-white p-5 md:grid-cols-[1fr_280px]">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-ink">顾问对话</h2>
          {ready ? (
            <Link className="rounded-ui bg-gold px-4 py-2 text-sm font-semibold text-ink" href={configurationHref}>
              进入方案配置
            </Link>
          ) : null}
        </div>
        <div className="mt-4 grid max-h-[360px] gap-3 overflow-y-auto rounded-ui bg-cloud p-4">
          {messages.map((message, index) => (
            <div
              className={`max-w-[86%] rounded-ui px-4 py-3 text-sm leading-6 ${
                message.role === "advisor" ? "bg-white text-ink" : "ml-auto bg-teal text-white"
              }`}
              key={`${message.role}-${index}`}
            >
              {message.text}
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <input
            className="min-w-0 flex-1 rounded-ui border border-line px-3 py-3 text-sm outline-none focus:border-teal"
            onChange={(event) => onInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") onSend();
            }}
            placeholder="输入目标城市、活动意图，或想比较的问题"
            value={input}
          />
          <button
            className="rounded-ui bg-gold px-4 py-3 font-semibold text-ink disabled:opacity-55"
            disabled={isSending}
            onClick={() => onSend()}
            type="button"
          >
            发送
          </button>
        </div>
      </div>
      <div className="rounded-ui bg-ink p-5 text-white">
        <Sparkles className="text-gold" />
        <p className="mt-3 font-semibold">会务地点</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {advisorCityOptions.map((city) => (
            <button
              className={`rounded-ui border px-3 py-2 text-xs font-semibold ${
                summary.eventCity === city ? "border-teal bg-teal/20 text-teal" : "border-white/20 text-white/80"
              }`}
              key={city}
              onClick={() => onCitySelect(city)}
              type="button"
            >
              {city}
            </button>
          ))}
        </div>
        <p className="mt-5 font-semibold">可以这样问</p>
        <div className="mt-3 grid gap-2">
          {["我想先判断一个城市适不适合办会", "帮我比较商务交流和客户接待两种方向", "先帮我看一个偏投资交流的活动方向"].map((item) => (
            <button
              className="rounded-ui border border-white/20 px-3 py-2 text-left text-sm text-white/80"
              key={item}
              onClick={() => onSend(item)}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function ServiceSelectionTable({
  onAdjust,
  services,
  tier,
}: {
  onAdjust: (id: string, direction: "up" | "down") => void;
  services: InteractiveService[];
  tier: PackageTierId;
}) {
  return (
    <section className="rounded-ui border border-line bg-white p-5">
      <h2 className="text-xl font-semibold text-ink">服务项取舍</h2>
      <p className="mt-1 text-sm text-ocean/70">点击 + / - 会调整数量、状态和右侧预算摘要。金额为预算结构估算和参考范围，不是正式报价。</p>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[820px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-line text-left text-ocean/70">
              <th className="py-3">服务项</th>
              <th>状态</th>
              <th>数量 / 规格</th>
              <th>预算区间</th>
              <th>配置说明</th>
              <th>调整</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service) => (
              <tr className="border-b border-line last:border-0" key={service.id}>
                <td className="py-3 font-semibold text-ink">{service.category}</td>
                <td>
                  <StatusBadge status={service.selectionStatus} />
                </td>
                <td>
                  {service.quantity} {service.unit}
                </td>
                <td>{formatRange(service, tier)}</td>
                <td className="max-w-[260px] text-ocean/70">{service.tradeoffNote}</td>
                <td>
                  <div className="flex w-fit items-center rounded-ui border border-line">
                    <button
                      aria-label={`减少${service.category}`}
                      className="px-2 py-1"
                      onClick={() => onAdjust(service.id, "down")}
                      type="button"
                    >
                      <Minus size={14} />
                    </button>
                    <button
                      aria-label={`增加${service.category}`}
                      className="border-l border-line px-2 py-1"
                      onClick={() => onAdjust(service.id, "up")}
                      type="button"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function BudgetSidePanel({
  budget,
  currentSummary,
  selectedTier,
  services,
  state,
}: {
  budget: { min: number; max: number; coverage: number };
  currentSummary: string;
  selectedTier: PackageTierId;
  services: InteractiveService[];
  state: CustomerAdvisorState;
}) {
  const confirmations = Array.from(
    new Set([
      ...tierConfig[selectedTier].confirmations,
      ...services.filter((service) => service.requiresHumanConfirmation && service.quantity > 0).slice(0, 3).map((service) => service.category),
    ]),
  ).slice(0, 5);

  return (
    <aside className="space-y-4">
      <section className="rounded-ui bg-ink p-5 text-white">
        <p className="border-l-4 border-gold pl-3 text-lg font-semibold">预算结构估算（{tierConfig[selectedTier].label}）</p>
        <p className="mt-6 text-sm text-white/65">总预算估算（含税）</p>
        <p className="mt-2 text-4xl font-semibold text-gold">
          ¥ {Math.round(budget.min / 10000)} - {Math.round(budget.max / 10000)} 万
        </p>
        <p className="mt-4 text-sm leading-7 text-white/75">{currentSummary}</p>
        <div className="mt-5 h-2 rounded-full bg-white/15">
          <div className="h-2 rounded-full bg-teal transition-all" style={{ width: `${budget.coverage}%` }} />
        </div>
        <p className="mt-2 text-xs text-white/55">预算覆盖度 {budget.coverage}% · 正式价格和档期需基于本次询价确认</p>
      </section>

      <section className="rounded-ui border border-line bg-white p-5">
        <h3 className="font-semibold text-ink">需要顾问确认</h3>
        <ul className="mt-3 space-y-2 text-sm text-ocean/75">
          {confirmations.map((item) => (
            <li className="flex items-center gap-2" key={item}>
              <AlertTriangle className="text-gold" size={16} />
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-ui border border-line bg-white p-5">
        <h3 className="font-semibold text-ink">下一步</h3>
        <div className="mt-4 grid gap-3">
          {state.nextActions.map((action) => (
            <Link
              className={`flex items-center justify-between rounded-ui px-4 py-3 font-semibold ${
                action.action === "submit_to_advisor" ? "bg-gold text-ink" : "border border-line text-ink"
              }`}
              href={action.action === "submit_to_advisor" ? "/advisor?state=submit" : "/advisor?state=configuration"}
              key={action.label}
            >
              {action.label}
              {action.action === "submit_to_advisor" ? <Send size={16} /> : <ArrowRight size={16} />}
            </Link>
          ))}
        </div>
        <p className="mt-4 text-xs leading-5 text-ocean/60">
          预算结构仅用于方案沟通。正式价格、档期、付款和取消条款，必须基于本次资源询价确认。
        </p>
      </section>
    </aside>
  );
}

function InitialSummaryPanel({
  configurationHref,
  progressLabel,
  ready,
  rows,
  summary,
}: {
  configurationHref: string;
  progressLabel?: string;
  ready: boolean;
  rows: Array<{ label: string; value: string }>;
  summary: AdvisorRequirementSummary;
}) {
  const missing = getMissingFields(summary);

  return (
    <aside className="space-y-4">
      <section className="rounded-ui bg-ink p-5 text-white">
        <p className="border-l-4 border-gold pl-3 text-lg font-semibold">咨询进度 / 轻摘要</p>
        <div className="mt-5 grid gap-3 text-sm">
          {rows.map((row) => (
            <div className="flex justify-between gap-4 border-b border-white/10 pb-3 last:border-0" key={row.label}>
              <span className="text-white/55">{row.label}</span>
              <span className="text-right font-semibold">{row.value}</span>
            </div>
          ))}
        </div>
      </section>
      <section className="rounded-ui border border-line bg-white p-5">
        <h3 className="font-semibold text-ink">{ready ? "可以进入第二层配置" : progressLabel ?? consultationProgress(summary)}</h3>
        <p className="mt-3 text-sm leading-7 text-ocean/70">
          {ready
            ? "核心信息已收集，可以进入方案包、服务项与预算结构配置。预算仍是参考范围，不是正式报价。"
            : `当前先围绕活动意图、城市适配和关注重点做判断。${missing.length ? "等方向明确后，再整理人数、预算和资源配置。" : "可以继续补充你的偏好。"}`}
        </p>
        {ready ? (
          <Link className="mt-4 inline-flex rounded-ui bg-gold px-4 py-2.5 text-sm font-semibold text-ink" href={configurationHref}>
            进入方案配置
          </Link>
        ) : null}
      </section>
    </aside>
  );
}

function StatusBadge({ status }: { status: ServiceSelectionStatus }) {
  const label: Record<ServiceSelectionStatus, string> = {
    required: "必选",
    selected: "已选",
    optional: "可调整",
    removed: "已移除",
    pending_confirm: "待确认",
  };

  return <span className="rounded-ui bg-teal/10 px-2 py-1 text-xs font-semibold text-teal">{label[status]}</span>;
}

type InteractiveService = ServiceSelection & {
  originalQuantity: number;
  unitMin: number;
  unitMax: number;
};

function normalizeServices(services: ServiceSelection[]): InteractiveService[] {
  return services.map((service) => ({
    ...service,
    originalQuantity: service.quantity,
    unitMin: service.quantity > 0 ? (service.subtotalMin ?? 0) / service.quantity : 0,
    unitMax: service.quantity > 0 ? (service.subtotalMax ?? 0) / service.quantity : 0,
  }));
}

function calculateBudget(services: InteractiveService[], tier: PackageTierId) {
  const multiplier = tierConfig[tier].multiplier;
  const selected = services.filter((service) => service.quantity > 0);
  const min = selected.reduce((sum, service) => sum + service.unitMin * service.quantity * multiplier, 0);
  const max = selected.reduce((sum, service) => sum + service.unitMax * service.quantity * multiplier, 0);
  const coverageBase = tier === "economy" ? 78 : tier === "standard" ? 90 : 96;
  const removedPenalty = services.filter((service) => service.quantity === 0).length * 4;

  return {
    min: Math.round(min),
    max: Math.round(max),
    coverage: Math.max(35, Math.min(98, coverageBase - removedPenalty)),
  };
}

function formatRange(service: InteractiveService, tier: PackageTierId) {
  if (service.quantity === 0) return "已移除";
  const multiplier = tierConfig[tier].multiplier;
  const min = Math.round(service.unitMin * service.quantity * multiplier);
  const max = Math.round(service.unitMax * service.quantity * multiplier);
  return `¥${min.toLocaleString("zh-CN")} - ${max.toLocaleString("zh-CN")}`;
}

function quantityStep(service: InteractiveService) {
  if (service.unit === "人") return 10;
  if (service.unit === "间夜") return 10;
  return 1;
}

function getTierId(label?: CustomerAdvisorState["inquiry"]["selectedPackage"]): PackageTierId {
  const found = PACKAGE_TIERS.find((tier) => tier.label === label);
  return found?.id ?? "standard";
}

function summaryFromInquiry(inquiry: CustomerAdvisorState["inquiry"]): AdvisorRequirementSummary {
  const initial = createInitialRequirementSummary();
  return {
    ...initial,
    eventCity: inquiry.city,
    eventType: inquiry.eventType,
    attendeeCount: inquiry.attendeeCount,
    budgetRange: inquiry.budgetRange,
    eventDate: inquiry.eventStartDate,
  };
}
