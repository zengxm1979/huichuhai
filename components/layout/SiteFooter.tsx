import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="bg-ink text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="text-xl font-semibold">会出海</p>
          <p className="mt-3 max-w-md text-sm leading-7 text-white/65">
            面向中国企业出海办会的本地服务平台。当前内容含 MOCK 信息，正式价格、场地和联系方式以上线前确认为准。
          </p>
        </div>
        <div>
          <p className="font-semibold text-gold">客户入口</p>
          <div className="mt-3 grid gap-2 text-sm text-white/70">
            <Link href="/advisor">AI 办会顾问</Link>
            <Link href="/inquiry">免费提交办会需求</Link>
          </div>
        </div>
        <div>
          <p className="font-semibold text-gold">联系信息</p>
          <p className="mt-3 text-sm text-white/70">电话、微信、WhatsApp、邮箱均为待确认信息，暂不展示真实联系方式。</p>
        </div>
      </div>
    </footer>
  );
}
