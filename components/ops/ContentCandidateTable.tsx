import type { ContentCandidateGap, ContentCandidateSummary } from "@/lib/resources/contentCandidates";

const gapLabel: Record<ContentCandidateGap, string> = {
  missing_city_tags: "缺城市标签",
  missing_use_cases: "缺场景",
  missing_faq_seeds: "缺 FAQ",
  missing_public_summary: "缺公开摘要",
  missing_public_notes: "缺内容备注",
  missing_image_authorization: "缺图片授权",
  needs_chris_review: "待 Chris 审核",
  missing_reference_price: "缺参考价范围",
};

const imageAuthLabel: Record<ContentCandidateSummary["imageAuthorizationStatus"], string> = {
  unknown: "未知",
  internal_only: "仅内部使用",
  public_approved: "已确认可公开",
  needs_replacement: "需替换图片",
};

const casePotentialLabel: Record<ContentCandidateSummary["casePotential"], string> = {
  none: "暂无",
  anonymous_candidate: "匿名案例候选",
  named_candidate: "实名案例候选",
  approved: "已确认授权",
};

export function ContentCandidateTable({
  candidates,
  onStatusChange,
}: {
  candidates: ContentCandidateSummary[];
  onStatusChange: (id: string, status: ContentCandidateSummary["contentStatus"]) => void;
}) {
  return (
    <div className="overflow-hidden rounded-ui border border-line bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] border-collapse text-left">
          <thead className="bg-cloud text-xs uppercase tracking-[0.16em] text-ocean/60">
            <tr>
              <th className="px-4 py-3">资源</th>
              <th className="px-4 py-3">城市 / 场景</th>
              <th className="px-4 py-3">FAQ 素材</th>
              <th className="px-4 py-3">授权 / 案例</th>
              <th className="px-4 py-3">缺口</th>
              <th className="px-4 py-3">状态</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {candidates.map((candidate) => (
              <tr key={candidate.id}>
                <td className="px-4 py-4 align-top">
                  <p className="font-semibold text-ink">{candidate.resourceName}</p>
                  <p className="mt-1 max-w-[280px] text-sm text-ocean/70">
                    {candidate.publicSummaryDraft || "缺公开摘要草稿"}
                  </p>
                </td>
                <td className="px-4 py-4 align-top text-sm text-ocean">
                  <p>{candidate.cityContentTags.join(" / ") || "缺城市标签"}</p>
                  <p className="mt-1">{candidate.commonUseCases.join(" / ") || "缺适用场景"}</p>
                </td>
                <td className="max-w-[240px] px-4 py-4 align-top text-sm text-ocean">
                  {candidate.faqSeeds.length > 0 ? candidate.faqSeeds.slice(0, 2).join("；") : "缺 FAQ 素材"}
                </td>
                <td className="px-4 py-4 align-top text-sm text-ocean">
                  <p>图片：{imageAuthLabel[candidate.imageAuthorizationStatus]}</p>
                  <p className="mt-1">案例：{casePotentialLabel[candidate.casePotential]}</p>
                </td>
                <td className="px-4 py-4 align-top">
                  <div className="flex max-w-[280px] flex-wrap gap-2">
                    {candidate.gaps.length === 0 ? (
                      <span className="rounded-ui bg-teal/10 px-2 py-1 text-xs font-semibold text-teal">素材完整</span>
                    ) : (
                      candidate.gaps.map((gap) => (
                        <span className="rounded-ui bg-gold/10 px-2 py-1 text-xs font-semibold text-ocean" key={gap}>
                          {gapLabel[gap]}
                        </span>
                      ))
                    )}
                  </div>
                </td>
                <td className="px-4 py-4 align-top">
                  <select
                    className="rounded-ui border border-line px-3 py-2 text-sm"
                    onChange={(event) =>
                      onStatusChange(candidate.id, event.target.value as ContentCandidateSummary["contentStatus"])
                    }
                    value={candidate.contentStatus}
                  >
                    <option value="draft">草稿</option>
                    <option value="needs_review">待审核</option>
                    <option value="verified">已核对</option>
                    <option value="public_ready">可进入内容生产</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
