"use client";

import { useState } from "react";
import { ResourceTable } from "@/components/ops/ResourceTable";
import type { ResourceMaster, ResourceType } from "@/lib/resources/types";

const resourceTypes: Array<{ value: ResourceType; label: string }> = [
  { value: "venue", label: "场地" },
  { value: "banquet", label: "晚宴" },
  { value: "materials", label: "会议物料" },
  { value: "av", label: "AV/舞台" },
  { value: "transfer", label: "接送机" },
  { value: "accommodation", label: "住宿" },
  { value: "interpretation", label: "同传" },
  { value: "photo_video", label: "摄影摄像" },
];

type PanelMode = "new" | "edit" | "quote" | null;

export function ResourceOpsWorkspace({ initialResources }: { initialResources: ResourceMaster[] }) {
  const [resources, setResources] = useState(initialResources);
  const [mode, setMode] = useState<PanelMode>(null);
  const [selected, setSelected] = useState<ResourceMaster | null>(null);
  const [activity, setActivity] = useState<string[]>([]);

  function openNew() {
    setSelected(null);
    setMode("new");
  }

  function openEdit(resource: ResourceMaster) {
    setSelected(resource);
    setMode("edit");
  }

  function openQuote(resource: ResourceMaster) {
    setSelected(resource);
    setMode("quote");
  }

  function saveResource(formData: FormData) {
    const now = new Date().toISOString().slice(0, 10);
    const resourceName = String(formData.get("resourceName") || "新增资源").trim();
    const supplierName = String(formData.get("supplierName") || "供应商待确认").trim();
    const priceScopeNote = String(formData.get("priceScopeNote") || "参考范围需按本次活动询价确认").trim();

    const next: ResourceMaster = {
      ...(selected ?? resources[0]),
      id: selected?.id ?? `res_mock_${Date.now()}`,
      resourceType: String(formData.get("resourceType")) as ResourceType,
      resourceName: withMockLabel(resourceName),
      supplierName: withMockLabel(supplierName),
      city: String(formData.get("city") || "吉隆坡"),
      district: String(formData.get("district") || "待确认"),
      referencePriceMin: Number(formData.get("referencePriceMin") || 0),
      referencePriceMax: Number(formData.get("referencePriceMax") || 0),
      pricingUnit: String(formData.get("pricingUnit") || "项目"),
      priceScopeNote: withMockLabel(priceScopeNote),
      requiresQuoteConfirmation: formData.get("requiresQuoteConfirmation") === "on",
      agreementStatus: String(formData.get("agreementStatus") || "mock") as ResourceMaster["agreementStatus"],
      lastVerifiedAt: now,
      contentStatus: "mock",
      serviceScope: selected?.serviceScope ?? ["服务范围待补充 [MOCK]"],
      suitableScenarios: selected?.suitableScenarios ?? ["企业会议 [MOCK]"],
      capacityOrSpec: selected?.capacityOrSpec ?? "规格待二次确认 [MOCK]",
      currency: selected?.currency ?? "MYR",
      seasonalityRule: selected?.seasonalityRule ?? "淡旺季、档期和提前期会影响价格 [MOCK]",
      dateConflictSensitivity: selected?.dateConflictSensitivity ?? "medium",
      minimumOrderRequirement: selected?.minimumOrderRequirement ?? "最低消费或起订条件待确认 [MOCK]",
      leadTimeRequirement: selected?.leadTimeRequirement ?? "建议提前 30-90 天确认 [MOCK]",
      strategicCooperationLevel: selected?.strategicCooperationLevel ?? "candidate",
      customerVisibleSummary:
        selected?.customerVisibleSummary ?? "客户侧仅展示参考范围，正式价格需本次询价确认 [MOCK]",
      internalNegotiationNote: selected?.internalNegotiationNote ?? "内部谈判备注待补充 [MOCK]",
      internalRiskNote: selected?.internalRiskNote ?? "内部风险备注待补充 [MOCK]",
    };

    setResources((current) => (selected ? current.map((item) => (item.id === selected.id ? next : item)) : [next, ...current]));
    setActivity((items) => [`${selected ? "更新" : "新建"}资源：${next.resourceName}`, ...items].slice(0, 5));
    setMode(null);
    setSelected(null);
  }

  function createQuoteRequest(formData: FormData) {
    if (!selected) return;
    const customerName = String(formData.get("customerName") || "客户待确认 [MOCK]");
    const eventType = String(formData.get("eventType") || "商务会议 [MOCK]");
    const eventDate = String(formData.get("eventDate") || "日期待确认");
    setActivity((items) =>
      [`已从资源 ${selected.resourceName} 发起当次询价：${customerName} / ${eventType} / ${eventDate} [MOCK]`, ...items].slice(0, 5),
    );
    setMode(null);
  }

  return (
    <div className="space-y-5">
      <section className="flex flex-wrap items-center justify-between gap-3 rounded-ui border border-line bg-white p-5">
        <div>
          <p className="text-sm font-semibold tracking-[0.18em] text-gold">RESOURCE OPS</p>
          <h2 className="mt-1 text-xl font-semibold text-ink">会务资源录入与主档维护</h2>
          <p className="mt-2 text-sm text-ocean/70">
            审核预览 / MOCK。这里用于 Chris / 运营审核资源主档结构与录入流程，不代表真实资源库已落库。
          </p>
        </div>
        <button className="rounded-ui bg-gold px-4 py-3 text-sm font-semibold text-ink" onClick={openNew} type="button">
          新建资源
        </button>
      </section>

      {mode === "new" || mode === "edit" ? (
        <ResourceForm key={selected?.id ?? "new"} mode={mode} resource={selected} onCancel={() => setMode(null)} onSave={saveResource} />
      ) : null}

      {mode === "quote" && selected ? (
        <QuoteFromResourceForm resource={selected} onCancel={() => setMode(null)} onSubmit={createQuoteRequest} />
      ) : null}

      {activity.length ? (
        <section className="rounded-ui border border-line bg-white p-5">
          <h3 className="font-semibold text-ink">本页 mock 操作记录</h3>
          <div className="mt-3 grid gap-2 text-sm text-ocean/75">
            {activity.map((item) => (
              <p className="rounded-ui bg-cloud px-3 py-2" key={item}>
                {item}
              </p>
            ))}
          </div>
        </section>
      ) : null}

      <ResourceTable onEdit={openEdit} onStartQuote={openQuote} resources={resources} />
    </div>
  );
}

function ResourceForm({
  mode,
  onCancel,
  onSave,
  resource,
}: {
  mode: "new" | "edit";
  onCancel: () => void;
  onSave: (formData: FormData) => void;
  resource: ResourceMaster | null;
}) {
  return (
    <form action={onSave} className="rounded-ui border border-line bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-ink">{mode === "new" ? "新建资源 [MOCK]" : "编辑资源 [MOCK]"}</h3>
        <button className="text-sm font-semibold text-ocean/60" onClick={onCancel} type="button">
          取消
        </button>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <Field label="资源名称" name="resourceName" defaultValue={stripMockLabel(resource?.resourceName)} />
        <Field label="供应商名称" name="supplierName" defaultValue={stripMockLabel(resource?.supplierName)} />
        <label className="grid gap-2 text-sm font-semibold text-ink">
          资源类型
          <select className="rounded-ui border border-line px-3 py-2 font-normal" defaultValue={resource?.resourceType ?? "venue"} name="resourceType">
            {resourceTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </label>
        <Field label="城市" name="city" defaultValue={resource?.city ?? "吉隆坡"} />
        <Field label="区域" name="district" defaultValue={resource?.district} />
        <Field label="计价单位" name="pricingUnit" defaultValue={resource?.pricingUnit ?? "项目"} />
        <Field label="参考价下限" name="referencePriceMin" type="number" defaultValue={String(resource?.referencePriceMin ?? 0)} />
        <Field label="参考价上限" name="referencePriceMax" type="number" defaultValue={String(resource?.referencePriceMax ?? 0)} />
        <label className="grid gap-2 text-sm font-semibold text-ink">
          合作状态
          <select className="rounded-ui border border-line px-3 py-2 font-normal" defaultValue={resource?.agreementStatus ?? "mock"} name="agreementStatus">
            <option value="active">active</option>
            <option value="pending">pending</option>
            <option value="expired">expired</option>
            <option value="mock">mock</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-semibold text-ink md:col-span-3">
          适用条件 / 参考价说明
          <textarea className="min-h-20 rounded-ui border border-line px-3 py-2 font-normal" defaultValue={stripMockLabel(resource?.priceScopeNote)} name="priceScopeNote" />
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold text-ink">
          <input defaultChecked={resource?.requiresQuoteConfirmation ?? true} name="requiresQuoteConfirmation" type="checkbox" />
          必须二次询价
        </label>
      </div>
      <button className="mt-5 rounded-ui bg-gold px-4 py-3 text-sm font-semibold text-ink" type="submit">
        保存资源
      </button>
    </form>
  );
}

function QuoteFromResourceForm({
  onCancel,
  onSubmit,
  resource,
}: {
  onCancel: () => void;
  onSubmit: (formData: FormData) => void;
  resource: ResourceMaster;
}) {
  return (
    <form action={onSubmit} className="rounded-ui border border-line bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-ink">从资源发起当次询价 [MOCK]</h3>
          <p className="mt-1 text-sm text-ocean/70">{resource.resourceName}</p>
        </div>
        <button className="text-sm font-semibold text-ocean/60" onClick={onCancel} type="button">
          取消
        </button>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-4">
        <Field label="客户 / 线索" name="customerName" defaultValue="示例客户 [MOCK]" />
        <Field label="活动类型" name="eventType" defaultValue="经销商大会 [MOCK]" />
        <Field label="活动日期" name="eventDate" type="date" defaultValue="2026-09-18" />
        <Field label="人数" name="attendeeCount" type="number" defaultValue="120" />
      </div>
      <button className="mt-5 rounded-ui bg-gold px-4 py-3 text-sm font-semibold text-ink" type="submit">
        创建当次询价单
      </button>
    </form>
  );
}

function Field({
  defaultValue,
  label,
  name,
  type = "text",
}: {
  defaultValue?: string;
  label: string;
  name: string;
  type?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-ink">
      {label}
      <input className="rounded-ui border border-line px-3 py-2 font-normal" defaultValue={defaultValue} name={name} type={type} />
    </label>
  );
}

function withMockLabel(value: string) {
  return value.includes("[MOCK]") ? value : `${value} [MOCK]`;
}

function stripMockLabel(value?: string) {
  return value?.replace(" [MOCK]", "");
}
