"use client";

import { useMemo, useState } from "react";
import { QuoteRequestTable } from "@/components/ops/QuoteRequestTable";
import type { InquiryQuoteRequest, QuoteRequestType, ResourceMaster } from "@/lib/resources/types";

const quoteRequestTypes: Array<{ value: QuoteRequestType; label: string }> = [
  { value: "venue_availability", label: "场地档期" },
  { value: "banquet_menu", label: "晚宴菜单" },
  { value: "materials_production", label: "物料制作" },
  { value: "av_stage", label: "AV/舞台" },
  { value: "transport_schedule", label: "接送安排" },
  { value: "room_block", label: "住宿房量" },
];

export function QuoteRequestOpsWorkspace({
  initialQuoteRequests,
  resources,
}: {
  initialQuoteRequests: InquiryQuoteRequest[];
  resources: ResourceMaster[];
}) {
  const [quoteRequests, setQuoteRequests] = useState(initialQuoteRequests);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<InquiryQuoteRequest | null>(null);
  const [notice, setNotice] = useState("");
  const resourceById = useMemo(() => new Map(resources.map((resource) => [resource.id, resource])), [resources]);

  function createQuoteRequest(formData: FormData) {
    const resourceMasterId = String(formData.get("resourceMasterId") || resources[0]?.id);
    const resource = resourceById.get(resourceMasterId);
    const next: InquiryQuoteRequest = {
      id: `qr_ops_${Date.now()}_mock`,
      inquiryId: `inq_ops_${Date.now()}_mock`,
      customerName: `${String(formData.get("customerName") || "客户待确认")} [MOCK]`,
      companyName: `${String(formData.get("companyName") || "公司待确认")} [MOCK]`,
      resourceMasterId,
      quoteRequestType: String(formData.get("quoteRequestType") || "venue_availability") as QuoteRequestType,
      eventType: `${String(formData.get("eventType") || "商务会议")} [MOCK]`,
      eventDateStart: String(formData.get("eventDateStart") || "2026-09-18"),
      eventDateEnd: String(formData.get("eventDateEnd") || "2026-09-18"),
      attendeeCount: Number(formData.get("attendeeCount") || 100),
      customerBudgetRange: `${String(formData.get("customerBudgetRange") || "80-100万")} [MOCK]`,
      requestedServices: [resource?.resourceName ?? "资源待确认 [MOCK]"],
      availabilityStatus: "waiting_supplier",
      currency: resource?.currency ?? "MYR",
      seasonalityNote: "待供应商确认淡旺季和档期影响 [MOCK]",
      conflictNote: "内部冲突风险待确认 [MOCK]",
      supplierResponseSummary: "已创建询价单，等待供应商回复 [MOCK]",
      paymentTermSummary: "待供应商确认 [MOCK]",
      cancellationTermSummary: "待供应商确认 [MOCK]",
      customerVisibleQuoteSummary: "已发起当次询价，正式价格和档期待确认 [MOCK]",
      operatorFollowupNote: "24 小时未回复则人工跟进 [MOCK]",
      quoteStatus: "waiting_supplier",
    };

    setQuoteRequests((current) => [next, ...current]);
    setNotice(`已从线索创建当次询价单：${next.companyName} / ${resource?.resourceName ?? resourceMasterId}`);
    setCreating(false);
  }

  function updateQuoteRequest(formData: FormData) {
    if (!editing) return;
    const quotedPriceMin = Number(formData.get("quotedPriceMin") || 0);
    const quotedPriceMax = Number(formData.get("quotedPriceMax") || 0);
    const next: InquiryQuoteRequest = {
      ...editing,
      availabilityStatus: String(formData.get("availabilityStatus")) as InquiryQuoteRequest["availabilityStatus"],
      quoteStatus: String(formData.get("quoteStatus")) as InquiryQuoteRequest["quoteStatus"],
      quotedPriceMin: quotedPriceMin || undefined,
      quotedPriceMax: quotedPriceMax || undefined,
      supplierResponseSummary: `${String(formData.get("supplierResponseSummary") || editing.supplierResponseSummary)} [MOCK]`,
      operatorFollowupNote: `${String(formData.get("operatorFollowupNote") || editing.operatorFollowupNote)} [MOCK]`,
      seasonalityNote: `${String(formData.get("seasonalityNote") || editing.seasonalityNote)} [MOCK]`,
      quotedBy: "Ops mock user [MOCK]",
      quotedAt: new Date().toISOString(),
      expiresAt: String(formData.get("expiresAt") || editing.expiresAt || ""),
    };

    setQuoteRequests((current) => current.map((request) => (request.id === editing.id ? next : request)));
    setNotice(`已更新询价单：${editing.id} [MOCK]`);
    setEditing(null);
  }

  return (
    <div className="space-y-5">
      <section className="flex flex-wrap items-center justify-between gap-3 rounded-ui border border-line bg-white p-5">
        <div>
          <p className="text-sm font-semibold tracking-[0.18em] text-gold">QUOTE OPS</p>
          <h2 className="mt-1 text-xl font-semibold text-ink">当次询价单流转</h2>
          <p className="mt-2 text-sm text-ocean/70">当次价格、档期、付款和取消条款只保存在客户活动的询价单中。</p>
        </div>
        <button className="rounded-ui bg-gold px-4 py-3 text-sm font-semibold text-ink" onClick={() => setCreating(true)} type="button">
          从线索发起当次询价
        </button>
      </section>

      {notice ? <p className="rounded-ui border border-teal/20 bg-teal/10 px-4 py-3 text-sm font-semibold text-teal">{notice}</p> : null}

      {creating ? <CreateQuoteRequestForm onCancel={() => setCreating(false)} onCreate={createQuoteRequest} resources={resources} /> : null}
      <QuoteRequestTable
        expandedRequestId={editing?.id}
        onUpdate={setEditing}
        quoteRequests={quoteRequests}
        renderExpandedRow={(request) => (
          <UpdateQuoteRequestForm onCancel={() => setEditing(null)} onUpdate={updateQuoteRequest} request={request} />
        )}
        resources={resources}
      />
    </div>
  );
}

function CreateQuoteRequestForm({
  onCancel,
  onCreate,
  resources,
}: {
  onCancel: () => void;
  onCreate: (formData: FormData) => void;
  resources: ResourceMaster[];
}) {
  return (
    <form action={onCreate} className="rounded-ui border border-line bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-ink">新建当次询价单 [MOCK]</h3>
        <button className="text-sm font-semibold text-ocean/60" onClick={onCancel} type="button">
          取消
        </button>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-4">
        <Field label="公司" name="companyName" defaultValue="示例科技有限公司" />
        <Field label="联系人" name="customerName" defaultValue="李女士" />
        <Field label="活动类型" name="eventType" defaultValue="经销商大会" />
        <Field label="人数" name="attendeeCount" type="number" defaultValue="120" />
        <Field label="开始日期" name="eventDateStart" type="date" defaultValue="2026-09-18" />
        <Field label="结束日期" name="eventDateEnd" type="date" defaultValue="2026-09-19" />
        <Field label="客户预算" name="customerBudgetRange" defaultValue="80-100万" />
        <label className="grid gap-2 text-sm font-semibold text-ink">
          资源
          <select className="rounded-ui border border-line px-3 py-2 font-normal" name="resourceMasterId">
            {resources.map((resource) => (
              <option key={resource.id} value={resource.id}>
                {resource.resourceName}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-semibold text-ink">
          询价类型
          <select className="rounded-ui border border-line px-3 py-2 font-normal" name="quoteRequestType">
            {quoteRequestTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <button className="mt-5 rounded-ui bg-gold px-4 py-3 text-sm font-semibold text-ink" type="submit">
        创建询价单
      </button>
    </form>
  );
}

function UpdateQuoteRequestForm({
  onCancel,
  onUpdate,
  request,
}: {
  onCancel: () => void;
  onUpdate: (formData: FormData) => void;
  request: InquiryQuoteRequest;
}) {
  return (
    <form action={onUpdate} className="rounded-ui border border-line bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-ink">更新询价状态 / 档期 / 报价 [MOCK]</h3>
          <p className="mt-1 text-sm text-ocean/70">{request.companyName}</p>
        </div>
        <button className="text-sm font-semibold text-ocean/60" onClick={onCancel} type="button">
          取消
        </button>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <label className="grid gap-2 text-sm font-semibold text-ink">
          档期状态
          <select className="rounded-ui border border-line px-3 py-2 font-normal" defaultValue={request.availabilityStatus} name="availabilityStatus">
            <option value="waiting_supplier">等供应商</option>
            <option value="available">可用</option>
            <option value="limited">受限</option>
            <option value="unavailable">不可用</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-semibold text-ink">
          询价状态
          <select className="rounded-ui border border-line px-3 py-2 font-normal" defaultValue={request.quoteStatus} name="quoteStatus">
            <option value="waiting_supplier">等待报价</option>
            <option value="quoted">已报价</option>
            <option value="limited">受限报价</option>
            <option value="unavailable">不可用</option>
            <option value="expired">已过期</option>
            <option value="confirmed">已确认</option>
          </select>
        </label>
        <Field label="有效期" name="expiresAt" type="datetime-local" />
        <Field label="报价下限" name="quotedPriceMin" type="number" defaultValue={String(request.quotedPriceMin ?? "")} />
        <Field label="报价上限" name="quotedPriceMax" type="number" defaultValue={String(request.quotedPriceMax ?? "")} />
        <Field label="淡旺季说明" name="seasonalityNote" defaultValue={request.seasonalityNote.replace(" [MOCK]", "")} />
        <label className="md:col-span-3 grid gap-2 text-sm font-semibold text-ink">
          供应商摘要
          <textarea className="min-h-20 rounded-ui border border-line px-3 py-2 font-normal" defaultValue={request.supplierResponseSummary.replace(" [MOCK]", "")} name="supplierResponseSummary" />
        </label>
        <label className="md:col-span-3 grid gap-2 text-sm font-semibold text-ink">
          运营跟进
          <textarea className="min-h-20 rounded-ui border border-line px-3 py-2 font-normal" defaultValue={request.operatorFollowupNote.replace(" [MOCK]", "")} name="operatorFollowupNote" />
        </label>
      </div>
      <button className="mt-5 rounded-ui bg-gold px-4 py-3 text-sm font-semibold text-ink" type="submit">
        保存询价更新
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
