import type { AgentExtractedFacts, ScaleBand } from "@/lib/agent/schemas";

const serviceKeywords: Array<{ label: string; keywords: string[] }> = [
  { label: "场地", keywords: ["场地", "会场", "会议厅", "酒店"] },
  { label: "晚宴", keywords: ["晚宴", "宴会", "餐标", "用餐", "围餐"] },
  { label: "茶歇", keywords: ["茶歇", "coffee break", "点心"] },
  { label: "AV/舞台", keywords: ["AV", "av", "舞台", "灯光", "音响", "LED", "屏幕"] },
  { label: "会议物料", keywords: ["物料", "背板", "易拉宝", "胸卡", "手册", "指示牌"] },
  { label: "接送机", keywords: ["接送机", "接送", "用车", "机场", "巴士", "大巴"] },
  { label: "住宿", keywords: ["住宿", "房间", "酒店房", "房晚"] },
  { label: "同传", keywords: ["同传", "翻译", "口译"] },
  { label: "摄影摄像", keywords: ["摄影", "摄像", "拍摄", "照片", "视频"] },
];

export function extractAgentFacts(message: string, currentFacts: AgentExtractedFacts = {}): AgentExtractedFacts {
  const clean = message.trim();
  const attendeeCount = extractAttendeeCount(clean) ?? currentFacts.attendeeCount;
  const requestedServices = unique([...(currentFacts.requestedServices ?? []), ...extractServices(clean)]);
  const customerPriorityFocus = unique([...(currentFacts.customerPriorityFocus ?? []), ...extractCustomerPriorityFocus(clean)]);

  return {
    city: extractCity(clean) ?? currentFacts.city,
    eventType: extractEventType(clean) ?? currentFacts.eventType,
    attendeeCount,
    budgetRange: extractBudgetRange(clean) ?? currentFacts.budgetRange,
    scaleBand: attendeeCount ? scaleBandFromAttendeeCount(attendeeCount) : currentFacts.scaleBand,
    requestedServices,
    customerPriorityFocus,
  };
}

function extractCity(text: string) {
  if (/(吉隆坡|Kuala\s*Lumpur|\bKL\b)/i.test(text)) return "吉隆坡";
  if (/(槟城|Penang)/i.test(text)) return "槟城";
  if (/(新山|Johor|JB)/i.test(text)) return "新山";
  if (/(新加坡|Singapore)/i.test(text)) return "新加坡";
  if (/(暂未确定|未确定|不确定|待定)/.test(text)) return "暂未确定";
  if (/其他/.test(text)) return "其他";
  return undefined;
}

function extractEventType(text: string) {
  if (/投资|招商|路演/.test(text)) return "投资大会";
  if (/经销商|渠道|代理商/.test(text)) return "经销商大会";
  if (/年会/.test(text)) return "企业年会";
  if (/发布|发布会|新品/.test(text)) return "新品发布会";
  if (/培训|工作坊|workshop/i.test(text)) return "培训 / 工作坊";
  if (/晚宴|答谢宴/.test(text)) return "商务晚宴";
  if (/会议|大会|峰会|论坛/.test(text)) return "商务会议";
  return undefined;
}

function extractAttendeeCount(text: string) {
  const match = text.match(/(\d{2,5})\s*(人|位|pax|PAX)/);
  return match ? Number(match[1]) : undefined;
}

function extractBudgetRange(text: string) {
  const range = text.match(/(?:预算)?\s*([0-9]+)\s*(?:-|~|到|至|－|—)\s*([0-9]+)\s*万/);
  if (range) return `${range[1]}-${range[2]}万`;

  const single = text.match(/预算\s*([0-9]+)\s*万/);
  if (single) return `${single[1]}万左右`;

  return undefined;
}

function extractServices(text: string) {
  return serviceKeywords
    .filter((service) => service.keywords.some((keyword) => text.includes(keyword)))
    .map((service) => service.label);
}

function extractCustomerPriorityFocus(text: string) {
  const focus: string[] = [];
  if (/投资|招商|路演/.test(text)) focus.push("投资交流 / 项目路演");
  if (/考察|参访|走访/.test(text)) focus.push("考察联动");
  if (/接待|客户/.test(text)) focus.push("客户接待");
  if (/预算|价格|费用/.test(text)) focus.push("预算控制");
  return focus;
}

function scaleBandFromAttendeeCount(attendeeCount: number): ScaleBand {
  if (attendeeCount < 80) return "small";
  if (attendeeCount <= 250) return "medium";
  return "large";
}

function unique(values: string[]) {
  return Array.from(new Set(values)).filter(Boolean);
}
