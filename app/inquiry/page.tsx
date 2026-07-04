import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { InquiryForm } from "@/components/inquiry/InquiryForm";

export default function InquiryPage() {
  return (
    <>
      <SiteHeader />
      <main className="bg-cloud">
        <section className="mx-auto grid max-w-7xl items-start gap-8 px-5 py-12 lg:grid-cols-[1fr_340px]">
          <div>
            <p className="text-sm font-semibold tracking-[0.2em] text-gold">INQUIRY</p>
            <h1 className="mt-3 text-4xl font-semibold text-ink">提交办会需求</h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-ocean/75">
              填写基础信息后，会出海顾问会确认正式报价、场地档期和合同条款。第一阶段不接真实数据库，表单将跳转到成功页演示流程。
            </p>
            <div className="mt-6">
              <InquiryForm />
            </div>
          </div>
          <aside className="space-y-4">
            <section className="rounded-ui border border-line bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-ink">提交后会发生什么</h2>
              <div className="mt-4 grid gap-3 text-sm text-ocean/75">
                {["顾问确认活动城市、日期和人数", "核对预算结构与服务项取舍", "再确认正式报价、档期和合同条款"].map((item) => (
                  <p className="flex gap-2" key={item}>
                    <CheckCircle2 className="mt-0.5 shrink-0 text-teal" size={16} />
                    {item}
                  </p>
                ))}
              </div>
            </section>
            <section className="rounded-ui bg-ink p-5 text-white shadow-sm">
              <h2 className="text-lg font-semibold">提交前可先问 AI 顾问</h2>
              <p className="mt-3 text-sm leading-7 text-white/70">
                预算、服务项或方案包不确定时，先生成一版预算结构，再提交给顾问确认。
              </p>
              <Link className="mt-5 inline-block rounded-ui bg-gold px-4 py-2.5 text-sm font-semibold text-ink" href="/advisor">
                问问 AI 办会顾问
              </Link>
            </section>
          </aside>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
