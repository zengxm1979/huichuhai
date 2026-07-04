import Link from "next/link";
import type { ReactNode } from "react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { getOpsPreviewToken } from "@/lib/deployment/reviewAccess";

const opsLinks = [
  { href: "/ops/leads", label: "AI 线索" },
  { href: "/ops/resources", label: "资源主档" },
  { href: "/ops/quote-requests", label: "当次询价单" },
];

export function OpsShell({ children, title }: { children: ReactNode; title: string }) {
  const token = getOpsPreviewToken();

  return (
    <main className="min-h-screen bg-cloud">
      <header className="bg-ink text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-5">
          <div className="flex items-center gap-3">
            <BrandLogo className="h-11 w-11 rounded-ui bg-white p-1" tone="dark" variant="mark" />
            <div>
              <p className="text-lg font-semibold">HCH 会出海 Ops</p>
              <p className="text-sm text-white/60">内部运营视图 · 不向客户展示</p>
            </div>
          </div>
          <span className="rounded-ui bg-gold px-4 py-2 text-sm font-semibold text-ink">
            内部页面，请勿转发给客户
          </span>
        </div>
        <nav className="mx-auto flex max-w-7xl flex-wrap gap-2 px-5 pb-5">
          {opsLinks.map((link) => (
            <Link
              className="rounded-ui border border-white/20 px-3 py-2 text-sm font-semibold text-white/80"
              href={`${link.href}?token=${token}`}
              key={link.href}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </header>
      <section className="mx-auto max-w-7xl px-5 py-6">
        <div className="mb-5 rounded-ui border border-line bg-white p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">Internal Ops</p>
          <h1 className="mt-2 text-3xl font-semibold text-ink">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-ocean/70">
            MOCK 内部能力预览。资源主档只保存参考条件；当次价格、档期、付款和取消条款必须由询价单确认。
          </p>
        </div>
        {children}
      </section>
    </main>
  );
}
