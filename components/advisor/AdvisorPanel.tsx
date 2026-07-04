import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Circle,
  Minus,
  Plus,
  Send,
  Sparkles,
} from "lucide-react";
import { getPackageTiers } from "@/lib/advisor/mockAdvisorFlow";
import type { AdvisorStep, CustomerAdvisorState, ServiceSelectionStatus } from "@/lib/advisor/types";

const tabs: Array<{ key: AdvisorStep; label: string }> = [
  { key: "initial", label: "初始咨询" },
  { key: "configuration", label: "方案配置" },
  { key: "budgetMismatch", label: "预算不匹配" },
  { key: "submit", label: "提交顾问确认" },
];

export function AdvisorPanel({ state }: { state: CustomerAdvisorState }) {
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
              <div className="h-10 w-10 rounded-full bg-[radial-gradient(circle_at_35%_30%,#f3c679,#1aa6a6_45%,#061d32_72%)]" />
              <div>
                <p className="font-semibold text-teal">AI 办会顾问</p>
                <p className="text-xs text-white/65">抽象数字顾问形象</p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-3 rounded-ui bg-white/8 p-4 text-sm md:grid-cols-5">
            <HeaderMetric label="当前询盘" value={state.inquiry.eventType ?? "待补充"} />
            <HeaderMetric label="预计人数" value={state.inquiry.attendeeCount ? `${state.inquiry.attendeeCount} 人` : "待确认"} />
            <HeaderMetric label="举办时间" value={state.inquiry.eventStartDate ?? "2026年9月 [MOCK]"} />
            <HeaderMetric label="地点" value={state.inquiry.city ?? "待确认"} />
            <HeaderMetric label="预算范围" value={state.inquiry.budgetRange ?? "待确认"} />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <HeroState state={state} />
          <PackageSelector selected={state.inquiry.selectedPackage ?? "标准型"} />
          {state.step === "initial" ? <InitialConsultation /> : <ServiceSelectionTable state={state} />}
        </div>
        <BudgetSidePanel state={state} />
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
    initial: "先告诉我们您要办什么会",
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
        <p className="text-sm text-gold">方案内容均为示例 [MOCK]，正式报价需顾问确认</p>
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

function PackageSelector({ selected }: { selected: string }) {
  return (
    <section className="rounded-ui border border-line bg-white p-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-ink">选择方案包</h2>
          <p className="mt-1 text-sm text-ocean/70">对比不同方案的服务配置与预算范围</p>
        </div>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {getPackageTiers().map((tier) => (
          <div
            className={`rounded-ui border p-4 ${
              selected === tier.label ? "border-teal bg-teal/10" : "border-line bg-white"
            }`}
            key={tier.id}
          >
            <div className="flex items-center gap-3">
              {selected === tier.label ? <CheckCircle2 className="text-teal" size={20} /> : <Circle className="text-ocean/35" size={20} />}
              <p className="font-semibold text-ink">{tier.label}</p>
            </div>
            <p className="mt-2 text-sm leading-6 text-ocean/70">{tier.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function InitialConsultation() {
  return (
    <section className="grid gap-4 rounded-ui border border-line bg-white p-5 md:grid-cols-[1fr_260px]">
      <div>
        <h2 className="text-xl font-semibold text-ink">快速咨询</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-ocean/75">
          可以先从活动类型、人数、城市、预算范围开始。AI 会生成一个可调整的服务项清单，再交由顾问确认档期和正式报价。
        </p>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {["我想办经销商大会", "我想找 200 人场地", "我想问档期和报价", "我想了解付款和合同"].map((item) => (
            <Link className="rounded-ui border border-line px-4 py-3 text-sm font-semibold text-ink" href="/advisor?state=configuration" key={item}>
              {item}
            </Link>
          ))}
        </div>
      </div>
      <div className="rounded-ui bg-ink p-5 text-white">
        <Sparkles className="text-gold" />
        <p className="mt-3 font-semibold">建议先补充</p>
        <ul className="mt-3 space-y-2 text-sm text-white/70">
          <li>活动类型</li>
          <li>预计人数</li>
          <li>城市和时间</li>
          <li>预算范围</li>
        </ul>
      </div>
    </section>
  );
}

function ServiceSelectionTable({ state }: { state: CustomerAdvisorState }) {
  return (
    <section className="rounded-ui border border-line bg-white p-5">
      <h2 className="text-xl font-semibold text-ink">服务项取舍</h2>
      <p className="mt-1 text-sm text-ocean/70">可按需开启或调整服务内容，金额为预算结构估算，不是正式报价。</p>
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
            {state.serviceSelections.map((service) => (
              <tr className="border-b border-line last:border-0" key={service.id}>
                <td className="py-3 font-semibold text-ink">{service.category}</td>
                <td>
                  <StatusBadge status={service.selectionStatus} />
                </td>
                <td>
                  {service.quantity} {service.unit}
                </td>
                <td>{formatRange(service.subtotalMin, service.subtotalMax)}</td>
                <td className="max-w-[260px] text-ocean/70">{service.tradeoffNote}</td>
                <td>
                  <div className="flex w-fit items-center rounded-ui border border-line">
                    <button className="px-2 py-1" type="button">
                      <Minus size={14} />
                    </button>
                    <button className="border-l border-line px-2 py-1" type="button">
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

function BudgetSidePanel({ state }: { state: CustomerAdvisorState }) {
  const estimate = state.budgetEstimate;

  return (
    <aside className="space-y-4">
      <section className="rounded-ui bg-ink p-5 text-white">
        <p className="border-l-4 border-gold pl-3 text-lg font-semibold">{estimate?.title ?? "预算结构待生成"}</p>
        {estimate ? (
          <>
            <p className="mt-6 text-sm text-white/65">总预算估算（含税）</p>
            <p className="mt-2 text-4xl font-semibold text-gold">
              ¥ {Math.round(estimate.totalMin / 10000)} - {Math.round(estimate.totalMax / 10000)} 万
            </p>
            <p className="mt-4 text-sm leading-7 text-white/75">{estimate.customerMatchSummary}</p>
            <div className="mt-5 h-2 rounded-full bg-white/15">
              <div className="h-2 rounded-full bg-teal" style={{ width: state.step === "budgetMismatch" ? "68%" : "90%" }} />
            </div>
          </>
        ) : (
          <p className="mt-4 text-sm leading-7 text-white/70">补充活动信息后生成预算结构。</p>
        )}
      </section>

      {estimate ? (
        <section className="rounded-ui border border-line bg-white p-5">
          <h3 className="font-semibold text-ink">需要顾问确认</h3>
          <ul className="mt-3 space-y-2 text-sm text-ocean/75">
            {estimate.requiresHumanConfirmation.map((item) => (
              <li className="flex items-center gap-2" key={item}>
                <AlertTriangle className="text-gold" size={16} />
                {item}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

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
        <p className="mt-4 text-xs leading-5 text-ocean/60">预算结构仅用于方案沟通，正式报价、档期和合同条款以顾问确认为准。</p>
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

function formatRange(min?: number, max?: number) {
  if (!min || !max) return "待确认";
  return `¥${min.toLocaleString("zh-CN")} - ${max.toLocaleString("zh-CN")}`;
}
