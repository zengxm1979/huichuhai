import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { InquiryForm } from "@/components/inquiry/InquiryForm";

export default function InquiryPage() {
  return (
    <>
      <SiteHeader />
      <main className="bg-cloud">
        <section className="mx-auto grid max-w-7xl gap-8 px-5 py-12 lg:grid-cols-[1fr_420px]">
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
          <aside className="rounded-ui bg-ink p-6 text-white">
            <h2 className="text-xl font-semibold">提交前可以先问 AI 顾问</h2>
            <p className="mt-3 text-sm leading-7 text-white/70">
              如果预算、服务项或方案包还不确定，可以先生成一版预算结构，再提交给顾问确认。
            </p>
            <Link className="mt-6 inline-block rounded-ui bg-gold px-5 py-3 font-semibold text-ink" href="/advisor">
              问问 AI 办会顾问
            </Link>
          </aside>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
