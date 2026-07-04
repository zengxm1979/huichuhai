import { BrandLogo } from "@/components/brand/BrandLogo";
import { getOpsLoginTarget } from "@/lib/deployment/opsServerAccess";

export const dynamic = "force-dynamic";

export default async function OpsLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; loggedOut?: string; next?: string }>;
}) {
  const params = await searchParams;
  const next = getOpsLoginTarget(params.next);

  return (
    <main className="min-h-screen bg-cloud px-5 py-10">
      <section className="mx-auto grid max-w-5xl overflow-hidden rounded-ui border border-line bg-white shadow-soft lg:grid-cols-[1fr_420px]">
        <div className="p-8 md:p-10">
          <BrandLogo className="h-auto w-36" priority />
          <p className="mt-8 text-sm font-semibold uppercase tracking-[0.2em] text-gold">Internal Ops</p>
          <h1 className="mt-3 text-3xl font-semibold text-ink">内部运营入口</h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-ocean/75">
            这里用于 Chris / 运营人员审核会务资源录入、当次询价和 AI 线索摘要。当前为 Phase 1 审核预览门禁，不是正式账号体系。
          </p>

          <form action="/ops/login/session" className="mt-8 grid max-w-md gap-4" method="post">
            <input name="next" type="hidden" value={next} />
            <label className="grid gap-2 text-sm font-semibold text-ink">
              审核访问密码
              <input
                autoComplete="current-password"
                className="rounded-ui border border-line px-4 py-3 font-normal"
                name="password"
                placeholder="请输入运营方提供的密码"
                type="password"
              />
            </label>
            {params.error ? (
              <p className="rounded-ui border border-coral/30 bg-coral/10 px-3 py-2 text-sm font-semibold text-coral">
                密码不正确，请向运营负责人确认后重试。
              </p>
            ) : null}
            {params.loggedOut ? (
              <p className="rounded-ui border border-teal/30 bg-teal/10 px-3 py-2 text-sm font-semibold text-teal">
                已退出内部运营预览。
              </p>
            ) : null}
            <button className="rounded-ui bg-gold px-5 py-3 text-sm font-semibold text-ink" type="submit">
              进入资源录入
            </button>
          </form>
        </div>
        <aside className="bg-ink p-8 text-white md:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">Review Preview</p>
          <h2 className="mt-4 text-2xl font-semibold">审核预览 / MOCK</h2>
          <div className="mt-6 space-y-4 text-sm leading-7 text-white/75">
            <p>资源主档、询价单和线索摘要仍为审核预览，不代表真实资源库已落库。</p>
            <p>客户侧不会出现内部运营入口，也不会展示真实性、意向、优先级、风险或供应商内部谈判备注。</p>
            <p>正式上线前仍需要接入登录权限、真实数据库、通知机制和真实资源资料。</p>
          </div>
        </aside>
      </section>
    </main>
  );
}
