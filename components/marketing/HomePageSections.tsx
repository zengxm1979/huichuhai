"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, BadgeCheck, Building2, CheckCircle2, ShieldCheck } from "lucide-react";
import { faqs, featuredVenues, materialSupport, serviceScenarios } from "@/content/site";

export function HomePageSections() {
  return (
    <>
      <section className="relative min-h-[620px] overflow-hidden bg-ink text-white">
        <img
          alt="商务会议厅示例图"
          className="absolute inset-0 h-full w-full object-cover opacity-60"
          src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=2200&q=85"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-ink/20" />
        <div className="relative mx-auto flex min-h-[620px] max-w-7xl flex-col justify-center px-5 py-20">
          <p className="text-sm font-semibold tracking-[0.28em] text-gold">会出海 · HUI CHU HAI</p>
          <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight md:text-6xl">
            帮中国企业在东南亚，把一场会办得更省心
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/80">
            首站马来西亚。精选场地、中文沟通、本地执行支持，为商务会议、渠道大会和企业接待梳理清晰方案。
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link className="rounded-ui bg-gold px-6 py-3 font-semibold text-ink" href="/inquiry">
              免费提交办会需求
            </Link>
            <Link className="rounded-ui border border-white/35 px-6 py-3 font-semibold text-white" href="/advisor">
              问问 AI 办会顾问
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-5 text-sm text-white/78">
            {["国际化场地资源", "全程中文服务", "落地执行保障", "预算透明可控"].map((item) => (
              <span className="flex items-center gap-2" key={item}>
                <CheckCircle2 className="text-gold" size={16} />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-14" id="scenarios">
        <div className="mx-auto max-w-7xl px-5">
          <SectionTitle action="查看全部场景" eyebrow="Services" title="我们服务的五大场景" />
          <div className="mt-6 grid gap-4 md:grid-cols-5">
            {serviceScenarios.map((item) => (
              <article className="overflow-hidden rounded-ui border border-line bg-white shadow-sm" key={item.title}>
                <img alt={`${item.title}示例图`} className="h-36 w-full object-cover" src={item.image} />
                <div className="p-4">
                  <h3 className="font-semibold text-ink">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-ocean/75">{item.summary}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-cloud py-14" id="venues">
        <div className="mx-auto max-w-7xl px-5">
          <SectionTitle action="了解场地服务" eyebrow="Venues" title="精选场地（马来西亚）" />
          <div className="mt-6 grid gap-4 md:grid-cols-[repeat(4,minmax(0,1fr))_260px]">
            {featuredVenues.map((venue) => (
              <article className="overflow-hidden rounded-ui border border-line bg-white shadow-sm" key={venue.name}>
                <img alt={`${venue.name}示例图`} className="h-36 w-full object-cover" src={venue.image} />
                <div className="p-4">
                  <h3 className="font-semibold text-ink">{venue.name}</h3>
                  <p className="mt-2 text-sm text-ocean/75">
                    {venue.city} · {venue.capacity}
                  </p>
                  <p className="mt-3 text-sm font-semibold text-ink">{venue.price}</p>
                </div>
              </article>
            ))}
            <aside className="rounded-ui border border-line bg-white p-5">
              <div className="grid gap-5 text-sm text-ocean">
                <TrustLine icon={<BadgeCheck size={18} />} title="实地考察支持" body="资源待确认，先以 MOCK 内容演示。" />
                <TrustLine icon={<Building2 size={18} />} title="独家资源与档期" body="优先锁定热门场地与档期。" />
                <TrustLine icon={<ShieldCheck size={18} />} title="中文合同与对接" body="全程中文沟通，便于客户决策。" />
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="bg-white py-10">
        <div className="mx-auto max-w-7xl px-5">
          <div className="grid items-center gap-8 rounded-ui bg-ink p-8 text-white md:grid-cols-[1fr_320px]">
            <div className="flex items-center gap-6">
              <div className="hidden h-28 w-28 rounded-full border border-teal/50 bg-[radial-gradient(circle_at_35%_25%,#8ee7e7,#0b3a4b_48%,#061d32)] md:block" />
              <div>
                <p className="text-sm font-semibold tracking-[0.2em] text-gold">AI ADVISOR</p>
                <h2 className="mt-2 text-3xl font-semibold">AI 办会顾问</h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-white/70">
                  为您快速生成办会方案、服务项和预算结构。AI 仅用于初步梳理，正式报价由顾问确认。
                </p>
              </div>
            </div>
            <div className="grid gap-3">
              <Link className="rounded-ui bg-gold px-5 py-3 text-center font-semibold text-ink" href="/advisor">
                立即咨询 AI 办会顾问
              </Link>
              <Link className="rounded-ui border border-white/35 px-5 py-3 text-center font-semibold text-white" href="/inquiry">
                提交具体需求
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-cloud py-14" id="materials">
        <div className="mx-auto max-w-7xl px-5">
          <SectionTitle action="查看会务支持" eyebrow="Materials" title="会务物料与视觉支持" />
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {materialSupport.map((item) => (
              <article className="group overflow-hidden rounded-ui border border-line bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft" key={item.title}>
                <MaterialPhoto image={item.image} alt={item.alt} />
                <div className="p-4">
                  <p className="text-sm font-semibold leading-6 text-ink">{item.title}</p>
                  <p className="mt-2 min-h-10 text-xs leading-5 text-ocean/70">{item.summary}</p>
                  <p className="mt-3 rounded-ui bg-gold/15 px-2 py-1 text-xs font-semibold text-ocean">{item.detail}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="mx-auto max-w-7xl px-5">
          <SectionTitle eyebrow="Process" title="我们的服务流程" />
          <div className="mt-6 grid gap-3 rounded-ui border border-line bg-white p-4 md:grid-cols-5">
            {["需求沟通", "方案与场地", "确认与预订", "落地执行", "活动复盘"].map((step, index) => (
              <div className="flex items-start gap-3 p-3" key={step}>
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-gold text-sm font-semibold text-ink">
                  {index + 1}
                </span>
                <div>
                  <p className="font-semibold">{step}</p>
                  <p className="mt-1 text-xs leading-5 text-ocean/70">顾问确认后推进，关键节点同步。</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-cloud py-14" id="faq">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 md:grid-cols-[1fr_360px]">
          <div>
            <SectionTitle eyebrow="FAQ / GEO" title="常见问题" />
            <div className="mt-6 grid gap-3">
              {faqs.map((faq) => (
                <div className="rounded-ui border border-line bg-white p-4 text-sm font-semibold text-ink" key={faq}>
                  {faq}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-ui bg-white p-6">
            <p className="text-xl font-semibold">准备好在东南亚办一场成功会议？</p>
            <p className="mt-3 text-sm leading-7 text-ocean/75">先提交基础需求，顾问会确认正式报价、档期和合同条款。</p>
            <div className="mt-6 grid gap-3">
              <Link className="rounded-ui bg-gold px-5 py-3 text-center font-semibold text-ink" href="/inquiry">
                免费提交办会需求
              </Link>
              <Link className="rounded-ui border border-line px-5 py-3 text-center font-semibold text-ink" href="/advisor">
                问问 AI 办会顾问
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function SectionTitle({ action, eyebrow, title }: { action?: string; eyebrow: string; title: string }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">{eyebrow}</p>
        <h2 className="mt-2 text-2xl font-semibold text-ink md:text-3xl">{title}</h2>
      </div>
      {action ? (
        <span className="hidden items-center gap-1 text-sm font-semibold text-ocean md:flex">
          {action}
          <ArrowRight size={16} />
        </span>
      ) : null}
    </div>
  );
}

function TrustLine({ body, icon, title }: { body: string; icon: ReactNode; title: string }) {
  return (
    <div className="flex gap-3">
      <span className="text-gold">{icon}</span>
      <div>
        <p className="font-semibold text-ink">{title}</p>
        <p className="mt-1 text-xs leading-5 text-ocean/70">{body}</p>
      </div>
    </div>
  );
}

function MaterialPhoto({ alt, image }: { alt: string; image: string }) {
  return (
    <div className="relative h-36 overflow-hidden bg-ink">
      <img alt={alt} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" src={image} />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
    </div>
  );
}
