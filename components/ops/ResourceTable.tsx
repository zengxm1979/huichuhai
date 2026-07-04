"use client";

import type { ResourceMaster } from "@/lib/resources/types";

const resourceTypeLabel: Record<ResourceMaster["resourceType"], string> = {
  venue: "场地",
  banquet: "晚宴",
  materials: "物料",
  av: "AV/舞台",
  transfer: "接送",
  accommodation: "住宿",
  interpretation: "同传",
  photo_video: "摄影摄像",
};

const cooperationLabel: Record<ResourceMaster["strategicCooperationLevel"], string> = {
  strategic: "战略合作",
  preferred: "优先合作",
  candidate: "候选资源",
};

export function ResourceTable({
  onEdit,
  onStartQuote,
  resources,
}: {
  onEdit?: (resource: ResourceMaster) => void;
  onStartQuote?: (resource: ResourceMaster) => void;
  resources: ResourceMaster[];
}) {
  return (
    <section className="overflow-hidden rounded-ui border border-line bg-white">
      <div className="border-b border-line p-5">
        <h2 className="text-xl font-semibold text-ink">资源主档 resource_master [MOCK]</h2>
        <p className="mt-2 text-sm text-ocean/70">长期合作资源、参考报价区间、适用条件和内部合作备注。</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1180px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-line bg-cloud text-left text-ocean/70">
              <th className="px-4 py-3">资源</th>
              <th className="px-4 py-3">类型</th>
              <th className="px-4 py-3">城市</th>
              <th className="px-4 py-3">参考价范围</th>
              <th className="px-4 py-3">必须询价</th>
              <th className="px-4 py-3">合作状态</th>
              <th className="px-4 py-3">适用条件</th>
              <th className="px-4 py-3">最近确认</th>
              {onEdit || onStartQuote ? <th className="px-4 py-3">动作</th> : null}
            </tr>
          </thead>
          <tbody>
            {resources.map((resource) => (
              <tr className="border-b border-line last:border-0" key={resource.id}>
                <td className="px-4 py-4">
                  <p className="font-semibold text-ink">{resource.resourceName}</p>
                  <p className="mt-1 text-xs text-ocean/55">{resource.supplierName}</p>
                </td>
                <td className="px-4 py-4">{resourceTypeLabel[resource.resourceType]}</td>
                <td className="px-4 py-4">
                  <p className="font-semibold text-ink">{resource.city}</p>
                  <p className="mt-1 text-xs text-ocean/55">{resource.district}</p>
                </td>
                <td className="px-4 py-4">
                  <p className="font-semibold text-ink">
                    {resource.currency} {resource.referencePriceMin.toLocaleString("zh-CN")} -{" "}
                    {resource.referencePriceMax.toLocaleString("zh-CN")}
                  </p>
                  <p className="mt-1 text-xs text-ocean/55">/{resource.pricingUnit}</p>
                </td>
                <td className="px-4 py-4">
                  <span className="rounded-ui bg-gold/15 px-2 py-1 text-xs font-semibold text-ink">
                    {resource.requiresQuoteConfirmation ? "必须二次询价" : "可参考估算"}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <p className="font-semibold text-ink">{cooperationLabel[resource.strategicCooperationLevel]}</p>
                  <p className="mt-1 text-xs text-ocean/55">{resource.agreementStatus}</p>
                </td>
                <td className="max-w-[280px] px-4 py-4 text-ocean/70">{resource.priceScopeNote}</td>
                <td className="px-4 py-4">{resource.lastVerifiedAt}</td>
                {onEdit || onStartQuote ? (
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      {onEdit ? (
                        <button className="rounded-ui border border-line px-3 py-2 text-xs font-semibold text-ink" onClick={() => onEdit(resource)} type="button">
                          编辑资源
                        </button>
                      ) : null}
                      {onStartQuote ? (
                        <button className="rounded-ui bg-gold px-3 py-2 text-xs font-semibold text-ink" onClick={() => onStartQuote(resource)} type="button">
                          发起询价
                        </button>
                      ) : null}
                    </div>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
