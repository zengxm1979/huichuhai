export function InquiryForm() {
  const inputClass = "rounded-ui border border-line bg-white px-3 py-3 text-sm outline-none focus:border-teal";

  return (
    <form action="/inquiry/success" className="grid gap-4 rounded-ui border border-line bg-white p-5 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold text-ink">
          公司
          <input className={inputClass} name="company" placeholder="示例科技有限公司 [MOCK]" required />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-ink">
          联系人
          <input className={inputClass} name="contactName" placeholder="李女士 [MOCK]" required />
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <input className={inputClass} name="phone" placeholder="电话（可选）" />
        <input className={inputClass} name="wechat" placeholder="微信（可选）" />
        <input className={inputClass} name="whatsapp" placeholder="WhatsApp（可选）" />
        <input className={inputClass} name="email" placeholder="邮箱（可选）" type="email" />
      </div>
      <p className="text-xs text-ocean/60">请至少填写一种联系方式。真实电话、微信和邮箱待客户自行提交。</p>
      <div className="grid gap-4 md:grid-cols-3">
        <label className="grid gap-2 text-sm font-semibold text-ink">
          活动时间
          <input className={inputClass} name="eventDate" placeholder="2026年9月 [MOCK]" required />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-ink">
          人数
          <input className={inputClass} min={1} name="attendeeCount" placeholder="120" required type="number" />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-ink">
          活动类型
          <input className={inputClass} name="eventType" placeholder="经销商大会" required />
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <input className={inputClass} name="city" placeholder="城市（可选），如吉隆坡" />
        <input className={inputClass} name="budgetRange" placeholder="预算（可选），如 ¥80 - 100 万" />
      </div>
      <textarea
        className={`${inputClass} min-h-32 resize-y`}
        name="specialNeeds"
        placeholder="特殊需求（可选）：中餐、白酒、接送机、会议物料、同传、住宿、合同付款等"
      />
      <button className="rounded-ui bg-gold px-5 py-3 font-semibold text-ink" type="submit">
        提交办会需求
      </button>
    </form>
  );
}
