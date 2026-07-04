"use client";

import type { InquiryQuoteRequest, ResourceMaster } from "@/lib/resources/types";

const availabilityLabel: Record<InquiryQuoteRequest["availabilityStatus"], string> = {
  waiting_supplier: "等供应商",
  available: "可用",
  limited: "受限",
  unavailable: "不可用",
};

const quoteStatusLabel: Record<InquiryQuoteRequest["quoteStatus"], string> = {
  waiting_supplier: "等待报价",
  quoted: "已报价",
  limited: "受限报价",
  unavailable: "不可用",
  expired: "已过期",
  confirmed: "已确认",
};

export function QuoteRequestTable({
  onUpdate,
  quoteRequests,
  resources,
}: {
  onUpdate?: (request: InquiryQuoteRequest) => void;
  quoteRequests: InquiryQuoteRequest[];
  resources: ResourceMaster[];
}) {
  const resourceById = new Map(resources.map((resource) => [resource.id, resource]));

  return (
    <section className="overflow-hidden rounded-ui border border-line bg-white">
      <div className="border-b border-line p-5">
        <h2 className="text-xl font-semibold text-ink">当次询价单 inquiry_quote_requests [MOCK]</h2>
        <p className="mt-2 text-sm text-ocean/70">某个客户、某个活动日期、某次资源询价下的实时档期和本次价格确认。</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1260px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-line bg-cloud text-left text-ocean/70">
              <th className="px-4 py-3">客户</th>
              <th className="px-4 py-3">活动</th>
              <th className="px-4 py-3">资源</th>
              <th className="px-4 py-3">档期状态</th>
              <th className="px-4 py-3">询价状态</th>
              <th className="px-4 py-3">本次报价范围</th>
              <th className="px-4 py-3">供应商摘要</th>
              <th className="px-4 py-3">跟进</th>
              {onUpdate ? <th className="px-4 py-3">动作</th> : null}
            </tr>
          </thead>
          <tbody>
            {quoteRequests.map((request) => {
              const resource = resourceById.get(request.resourceMasterId);

              return (
                <tr className="border-b border-line last:border-0" key={request.id}>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-ink">{request.companyName}</p>
                    <p className="mt-1 text-xs text-ocean/55">{request.customerName}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-ink">{request.eventType}</p>
                    <p className="mt-1 text-xs text-ocean/55">
                      {request.eventDateStart} - {request.eventDateEnd} · {request.attendeeCount} 人
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-ink">{resource?.resourceName ?? request.resourceMasterId}</p>
                    <p className="mt-1 text-xs text-ocean/55">{request.quoteRequestType}</p>
                  </td>
                  <td className="px-4 py-4">
                    <span className="rounded-ui bg-teal/10 px-2 py-1 text-xs font-semibold text-teal">
                      {availabilityLabel[request.availabilityStatus]}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="rounded-ui bg-gold/15 px-2 py-1 text-xs font-semibold text-ink">
                      {quoteStatusLabel[request.quoteStatus]}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    {request.quotedPriceMin && request.quotedPriceMax ? (
                      <p className="font-semibold text-ink">
                        {request.currency} {request.quotedPriceMin.toLocaleString("zh-CN")} -{" "}
                        {request.quotedPriceMax.toLocaleString("zh-CN")}
                      </p>
                    ) : (
                      <p className="font-semibold text-ocean/60">等待供应商确认</p>
                    )}
                    <p className="mt-1 text-xs text-ocean/55">{request.expiresAt ? `有效至 ${request.expiresAt}` : "未出有效期"}</p>
                  </td>
                  <td className="max-w-[260px] px-4 py-4 text-ocean/70">{request.supplierResponseSummary}</td>
                  <td className="max-w-[260px] px-4 py-4 text-ocean/70">{request.operatorFollowupNote}</td>
                  {onUpdate ? (
                    <td className="px-4 py-4">
                      <button className="rounded-ui bg-gold px-3 py-2 text-xs font-semibold text-ink" onClick={() => onUpdate(request)} type="button">
                        更新询价
                      </button>
                    </td>
                  ) : null}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
