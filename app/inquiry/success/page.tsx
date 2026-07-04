import Link from "next/link";
import type { ReactNode } from "react";
import { CalendarClock, CheckCircle2, ClipboardList, FileCheck2 } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export default function InquirySuccessPage() {
  return (
    <>
      <SiteHeader />
      <main className="bg-cloud px-5 py-12">
        <section className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1fr_360px]">
          <div className="rounded-ui border border-line bg-white p-8 shadow-sm">
            <CheckCircle2 className="text-teal" size={48} />
            <h1 className="mt-5 text-3xl font-semibold text-ink">需求已收到</h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-ocean/75">
              顾问会进一步基于本次询价确认正式价格、场地档期、付款和取消条款。当前为第一阶段演示流程，未接入真实数据库或通知服务。
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <NextStep icon={<ClipboardList size={22} />} title="核对需求" body="确认公司、联系人、活动时间、人数与城市。" />
              <NextStep icon={<CalendarClock size={22} />} title="确认档期" body="根据场地和酒店资源核对可用日期。" />
              <NextStep icon={<FileCheck2 size={22} />} title="本次询价确认" body="整理本次价格、未包含项、付款和取消条款。" />
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link className="rounded-ui bg-gold px-5 py-3 font-semibold text-ink" href="/advisor?state=submit">
                继续补充 AI 顾问方案
              </Link>
              <Link className="rounded-ui border border-line px-5 py-3 font-semibold text-ink" href="/">
                返回首页
              </Link>
            </div>
          </div>

          <aside className="rounded-ui border border-line bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold tracking-[0.2em] text-gold">DEMO SUMMARY</p>
            <h2 className="mt-3 text-xl font-semibold text-ink">示例需求摘要 [MOCK]</h2>
            <dl className="mt-5 grid gap-4 text-sm">
              <SummaryItem label="活动类型" value="经销商大会" />
              <SummaryItem label="地点" value="吉隆坡 [MOCK]" />
              <SummaryItem label="人数" value="120 人 [MOCK]" />
              <SummaryItem label="预算" value="¥80 - 100 万 [MOCK]" />
              <SummaryItem label="待确认" value="本次价格、档期、付款和取消条款" />
            </dl>
          </aside>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function NextStep({ body, icon, title }: { body: string; icon: ReactNode; title: string }) {
  return (
    <article className="rounded-ui border border-line p-4">
      <span className="text-gold">{icon}</span>
      <h3 className="mt-3 font-semibold text-ink">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-ocean/70">{body}</p>
    </article>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-ocean/55">{label}</dt>
      <dd className="mt-1 font-semibold text-ink">{value}</dd>
    </div>
  );
}
