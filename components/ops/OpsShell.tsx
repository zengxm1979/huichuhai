import Link from "next/link";
import type { ReactNode } from "react";
import { BrandLogo } from "@/components/brand/BrandLogo";

const opsLinks = [
  { href: "/ops/resources", label: "资源主档" },
  { href: "/ops/content-candidates", label: "内容素材" },
  { href: "/ops/quote-requests", label: "当次询价单" },
  { href: "/ops/leads", label: "AI 线索" },
  { href: "/ops/model-settings", label: "AI 模型" },
];

export function OpsShell({ children, title }: { children: ReactNode; title: string }) {
  return (
    <main className="min-h-screen bg-cloud">
      <header className="bg-ink text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-5">
          <div className="flex items-center gap-3">
            <BrandLogo className="h-11 w-11 rounded-ui bg-white p-1" tone="dark" variant="mark" />
            <div>
              <p className="text-lg font-semibold">HCH 会出海 Ops</p>
              <p className="text-sm text-white/60">内部运营视图 / 不向客户展示</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-ui bg-gold px-4 py-2 text-sm font-semibold text-ink">审核预览 / MOCK</span>
            <a className="rounded-ui border border-white/20 px-4 py-2 text-sm font-semibold text-white/80" href="/ops/logout">
              退出
            </a>
          </div>
        </div>
        <nav className="mx-auto flex max-w-7xl flex-wrap gap-2 px-5 pb-5">
          {opsLinks.map((link) => (
            <Link className="rounded-ui border border-white/20 px-3 py-2 text-sm font-semibold text-white/80" href={link.href} key={link.href}>
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
            审核预览 / MOCK。资源主档仅维护参考条件；当次价格、档期、付款和取消条款必须由询价单确认，不代表真实资源库已落库。
          </p>
        </div>
        {children}
      </section>
    </main>
  );
}
