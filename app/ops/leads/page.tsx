import { notFound } from "next/navigation";
import { LeadSummaryTable } from "@/components/ops/LeadSummaryTable";
import { internalLeadState } from "@/lib/advisor/mockAdvisorFlow";

export const dynamic = "force-dynamic";

const previewToken = process.env.OPS_PREVIEW_TOKEN ?? "huichuhai-ops-preview";

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
    <main className="min-h-screen bg-cloud">
      <header className="bg-ink text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-5">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-ui bg-gold text-lg font-semibold text-ink">
              Ops
            </span>
            <div>
              <p className="text-lg font-semibold">会出海 Ops</p>
              <p className="text-sm text-white/60">内部运营视图 · 不向客户展示</p>
            </div>
          </div>
          <span className="rounded-ui bg-gold px-4 py-2 text-sm font-semibold text-ink">
            内部页面，请勿转发给客户
          </span>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-6">
        <div className="mb-5 grid gap-3 rounded-ui border border-line bg-white p-4 md:grid-cols-5">
          {["优先级：全部", "来源：AI 办会顾问", "状态：待联系", "日期：近 30 天", "搜索：公司/联系人"].map(
            (item) => (
              <div className="rounded-ui border border-line px-3 py-2 text-sm text-ocean" key={item}>
                {item}
              </div>
            ),
          )}
        </div>
        <LeadSummaryTable lead={internalLeadState} />
      </section>
    </main>
  );
}
