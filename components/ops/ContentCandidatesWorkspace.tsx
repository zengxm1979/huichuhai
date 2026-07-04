"use client";

import { useMemo, useState } from "react";
import { ContentCandidateTable } from "@/components/ops/ContentCandidateTable";
import {
  buildContentCandidateSummary,
  nextContentStatus,
} from "@/lib/resources/contentCandidates";
import type { ResourceContentStatus, ResourceMaster } from "@/lib/resources/types";

export function ContentCandidatesWorkspace({ initialResources }: { initialResources: ResourceMaster[] }) {
  const [resources, setResources] = useState(initialResources);
  const [message, setMessage] = useState("内容素材候选池为审核预览 / MOCK，不代表已公开发布。");

  const candidates = useMemo(() => resources.map(buildContentCandidateSummary), [resources]);

  function updateStatus(id: string, requestedStatus: ResourceContentStatus) {
    const resource = resources.find((item) => item.id === id);
    if (!resource) return;

    const contentStatus = nextContentStatus(resource, requestedStatus);
    setResources((current) => current.map((item) => (item.id === id ? { ...item, contentStatus } : item)));
    setMessage(
      contentStatus === requestedStatus
        ? `已将 ${resource.resourceName} 标记为 ${statusLabel[requestedStatus]}。`
        : `${resource.resourceName} 缺少公开授权或审核信息，暂不能标记为 public_ready。`,
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-ui border border-line bg-white p-5">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gold">Content Candidates</p>
        <h2 className="mt-2 text-2xl font-semibold text-ink">GEO 内容素材池</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-ocean/70">
          这里汇总资源主档中的 public-safe 候选素材，用于后续 FAQ、城市页、场景页、案例和 GEO 内容矩阵。
          当前不提供一键发布，不改 sitemap，不开启收录。
        </p>
        <p className="mt-3 rounded-ui bg-cloud px-3 py-2 text-sm font-semibold text-ocean">{message}</p>
      </div>
      <ContentCandidateTable candidates={candidates} onStatusChange={updateStatus} />
    </div>
  );
}

const statusLabel: Record<ResourceContentStatus, string> = {
  draft: "草稿",
  needs_review: "待审核",
  verified: "已核对",
  public_ready: "可进入内容生产",
};
