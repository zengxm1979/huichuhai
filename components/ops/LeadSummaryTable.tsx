import type { InternalAdvisorState } from "@/lib/advisor/types";

export function LeadSummaryTable({ lead }: { lead: InternalAdvisorState }) {
  const rows = [
    ["客户/公司", lead.inquiry.company ?? "未填写"],
    ["活动类型", lead.inquiry.eventType ?? "未填写"],
    ["城市", lead.inquiry.city ?? "未填写"],
    ["人数", lead.inquiry.attendeeCount ? `${lead.inquiry.attendeeCount} 人` : "未填写"],
    ["推荐方案包", lead.inquiry.selectedPackage ?? "未选择"],
    ["预算范围", lead.inquiry.budgetRange ?? "未填写"],
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
      <section className="rounded-ui border border-line bg-white">
        <div className="border-b border-line p-5">
          <p className="text-sm font-semibold text-gold">线索详情 [MOCK]</p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">{lead.inquiry.company}</h2>
        </div>
        <div className="grid gap-0 md:grid-cols-2">
          {rows.map(([label, value]) => (
            <div className="border-b border-line p-4" key={label}>
              <p className="text-xs text-ocean/55">{label}</p>
              <p className="mt-1 font-semibold text-ink">{value}</p>
            </div>
          ))}
        </div>
        <div className="p-5">
          <h3 className="font-semibold text-ink">已选服务项（标准型）</h3>
          <div className="mt-4 grid gap-2 text-sm">
            {lead.serviceSelections.slice(0, 7).map((service) => (
              <div className="flex justify-between rounded-ui bg-cloud px-3 py-2" key={service.id}>
                <span className="font-semibold text-ink">{service.category}</span>
                <span className="text-ocean/70">{service.itemName}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <aside className="space-y-4">
        <section className="rounded-ui border border-line bg-white p-5">
          <h3 className="font-semibold text-ink">AI 判断（内部）</h3>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <InternalMetric label="真实性" value={`${lead.internal.authenticityScore} / 5`} />
            <InternalMetric label="意向" value={`${lead.internal.intentScore} / 5`} />
            <InternalMetric label="优先级" value={priorityLabel[lead.internal.leadPriority]} />
            <InternalMetric label="预算风险" value={lead.internal.budgetRisks.length ? "需确认" : "暂无"} />
          </div>
        </section>

        <section className="rounded-ui border border-line bg-white p-5">
          <h3 className="font-semibold text-ink">预算风险与风险标记</h3>
          <ul className="mt-3 space-y-2 text-sm text-ocean/75">
            {[...lead.internal.budgetRisks, ...lead.internal.riskFlags].map((item) => (
              <li className="rounded-ui bg-coral/10 px-3 py-2 text-coral" key={item}>
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-ui border border-line bg-white p-5">
          <h3 className="font-semibold text-ink">推荐下一步</h3>
          <p className="mt-3 text-sm leading-7 text-ocean/75">{lead.internal.recommendedNextAction}</p>
          <p className="mt-4 text-xs font-semibold text-gold">推荐开场白（内部可复制）</p>
          <p className="mt-2 rounded-ui bg-cloud p-3 text-sm leading-7 text-ink">{lead.internal.recommendedReply}</p>
        </section>
      </aside>
    </div>
  );
}

const priorityLabel: Record<InternalAdvisorState["internal"]["leadPriority"], string> = {
  urgent: "高优先级 · 紧急",
  high: "高优先级",
  medium: "中优先级",
  low: "低优先级",
};

function InternalMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-ui border border-line p-3">
      <p className="text-xs text-ocean/55">{label}</p>
      <p className="mt-1 font-semibold text-ink">{value}</p>
    </div>
  );
}
