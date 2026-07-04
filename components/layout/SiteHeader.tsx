import Link from "next/link";
import { CalendarCheck } from "lucide-react";
import { OpenAdvisorButton } from "@/components/advisor/OpenAdvisorButton";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-ink text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <Link className="flex items-center gap-3" href="/">
          <span className="grid h-9 w-9 place-items-center rounded-ui border border-gold/50 bg-gold/15 text-lg font-bold text-gold">
            会
          </span>
          <span>
            <span className="block text-lg font-semibold">会出海</span>
            <span className="block text-[11px] uppercase tracking-[0.24em] text-white/55">Hui Chu Hai</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-white/80 md:flex">
          <Link href="/">首页</Link>
          <a href="/#scenarios">服务场景</a>
          <a href="/#venues">精选场地</a>
          <a href="/#materials">会务物料</a>
          <a href="/#faq">FAQ</a>
        </nav>
        <div className="flex items-center gap-2">
          <OpenAdvisorButton
            className="hidden items-center gap-2 rounded-ui border border-white/25 px-4 py-2 text-sm text-white md:flex"
            showIcon
          >
            AI 顾问
          </OpenAdvisorButton>
          <Link className="flex items-center gap-2 rounded-ui bg-gold px-4 py-2 text-sm font-semibold text-ink" href="/inquiry">
            <CalendarCheck size={16} />
            提交需求
          </Link>
        </div>
      </div>
    </header>
  );
}
