import { notFound } from "next/navigation";
import { LeadSummaryTable } from "@/components/ops/LeadSummaryTable";
import { OpsShell } from "@/components/ops/OpsShell";
import { internalLeadState } from "@/lib/advisor/mockAdvisorFlow";
import { getOpsPreviewToken } from "@/lib/deployment/reviewAccess";

export const dynamic = "force-dynamic";

const previewToken = getOpsPreviewToken();

export default async function OpsLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;

  if (params.token !== previewToken) {
    notFound();
  }

  return (
    <OpsShell title="AI 线索摘要">
      <div className="mb-5 grid gap-3 rounded-ui border border-line bg-white p-4 md:grid-cols-5">
        {["优先级：全部", "来源：AI 办会顾问", "状态：待联系", "日期：近 30 天", "搜索：公司/联系人"].map((item) => (
          <div className="rounded-ui border border-line px-3 py-2 text-sm text-ocean" key={item}>
            {item}
          </div>
        ))}
      </div>
      <LeadSummaryTable lead={internalLeadState} />
    </OpsShell>
  );
}
