import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export default function InquirySuccessPage() {
  return (
    <>
      <SiteHeader />
      <main className="bg-cloud px-5 py-16">
        <section className="mx-auto max-w-3xl rounded-ui border border-line bg-white p-8 text-center shadow-sm">
          <CheckCircle2 className="mx-auto text-teal" size={48} />
          <h1 className="mt-5 text-3xl font-semibold text-ink">需求已收到</h1>
          <p className="mt-4 text-base leading-8 text-ocean/75">
            顾问会进一步确认正式报价、场地档期和合同条款。当前为第一阶段演示流程，未接入真实数据库或通知服务。
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link className="rounded-ui bg-gold px-5 py-3 font-semibold text-ink" href="/advisor?state=submit">
              继续补充 AI 顾问方案
            </Link>
            <Link className="rounded-ui border border-line px-5 py-3 font-semibold text-ink" href="/">
              返回首页
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
