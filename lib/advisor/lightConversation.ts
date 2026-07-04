export type AdvisorRequirementSummary = {
  eventCity?: string;
  eventType?: string;
  attendeeCount?: number;
  budgetRange?: string;
  requestedServices: string[];
  eventDate?: string;
  locationFlexibility?: "locked" | "flexible" | "undecided";
};

export type LightChatMessage = {
  role: "advisor" | "customer";
  text: string;
};

export const advisorCityOptions = ["吉隆坡", "槟城", "新山", "新加坡", "暂未确定", "其他"] as const;

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

export function createInitialRequirementSummary(): AdvisorRequirementSummary {
  return {
    requestedServices: [],
  };
}

export function extractRequirementsFromText(text: string): Partial<AdvisorRequirementSummary> {
  const clean = text.trim();
  const patch: Partial<AdvisorRequirementSummary> = {};

  const city = extractCity(clean);
  if (city) {
    patch.eventCity = city;
    patch.locationFlexibility = city === "暂未确定" ? "undecided" : "locked";
  }

  const attendeeCount = extractAttendeeCount(clean);
  if (attendeeCount) patch.attendeeCount = attendeeCount;

  const eventType = extractEventType(clean);
  if (eventType) patch.eventType = eventType;

  const budgetRange = extractBudgetRange(clean);
  if (budgetRange) patch.budgetRange = budgetRange;

  const services = extractServices(clean);
  if (services.length > 0) patch.requestedServices = services;

  const eventDate = extractEventDate(clean);
  if (eventDate) patch.eventDate = eventDate;

  return patch;
}

export function mergeRequirements(
  current: Partial<AdvisorRequirementSummary>,
  patch: Partial<AdvisorRequirementSummary>,
): AdvisorRequirementSummary {
  return {
    eventCity: patch.eventCity ?? current.eventCity,
    eventType: patch.eventType ?? current.eventType,
    attendeeCount: patch.attendeeCount ?? current.attendeeCount,
    budgetRange: patch.budgetRange ?? current.budgetRange,
    eventDate: patch.eventDate ?? current.eventDate,
    locationFlexibility: patch.locationFlexibility ?? current.locationFlexibility,
    requestedServices: unique([...(current.requestedServices ?? []), ...(patch.requestedServices ?? [])]),
  };
}

export function isRequirementReady(summary: Partial<AdvisorRequirementSummary>) {
  return Boolean(
    summary.eventCity &&
      summary.eventCity !== "暂未确定" &&
      summary.eventType &&
      summary.attendeeCount &&
      summary.budgetRange,
  );
}

export function buildAdvisorReply(summary: Partial<AdvisorRequirementSummary>) {
  if (isRequirementReady(summary)) {
    const services =
      summary.requestedServices && summary.requestedServices.length > 0
        ? `，已记录服务项：${summary.requestedServices.join("、")}`
        : "";
    return `收到。已整理 ${summary.eventCity} / ${summary.attendeeCount}人 / ${summary.eventType} / 预算${summary.budgetRange}${services}。信息已足够进入方案配置。预算只作为参考范围，正式价格、档期、付款和取消条款需基于本次询价确认。`;
  }

  const missing = getMissingFields(summary);
  return `收到，我先同步到需求摘要。还需要补充：${missing.join("、")}。可以直接说“地点在吉隆坡，120人，经销商大会，预算80-100万，需要物料和接送机”。`;
}

export function getMissingFields(summary: Partial<AdvisorRequirementSummary>) {
  const missing: string[] = [];
  if (!summary.eventCity || summary.eventCity === "暂未确定") missing.push("会务地点");
  if (!summary.eventType) missing.push("活动类型");
  if (!summary.attendeeCount) missing.push("预计人数");
  if (!summary.budgetRange) missing.push("预算范围");
  return missing.length > 0 ? missing : ["活动日期或特殊要求"];
}

export function summaryToDisplayRows(summary: Partial<AdvisorRequirementSummary>) {
  return [
    { label: "会务地点", value: summary.eventCity ?? "待确认" },
    { label: "活动类型", value: summary.eventType ?? "待确认" },
    { label: "预计人数", value: summary.attendeeCount ? `${summary.attendeeCount} 人` : "待确认" },
    { label: "预算范围", value: summary.budgetRange ?? "待确认" },
    {
      label: "服务项",
      value: summary.requestedServices?.length ? summary.requestedServices.join("、") : "待确认",
    },
  ];
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

function extractAttendeeCount(text: string) {
  const match = text.match(/(\d{2,5})\s*(人|位|pax|PAX)/);
  return match ? Number(match[1]) : undefined;
}

function extractEventType(text: string) {
  if (/经销商|渠道|代理商/.test(text)) return "经销商大会";
  if (/年会/.test(text)) return "企业年会";
  if (/发布|发布会|新品/.test(text)) return "新品发布会";
  if (/培训|工作坊|workshop/i.test(text)) return "培训 / 工作坊";
  if (/晚宴|答谢宴/.test(text)) return "商务晚宴";
  if (/会议|大会|峰会|论坛/.test(text)) return "商务会议";
  return undefined;
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

function extractEventDate(text: string) {
  const date = text.match(/(20\d{2}[年/-]\d{1,2}[月/-]\d{1,2}日?|\d{1,2}月\d{1,2}日)/);
  return date?.[1];
}

function unique(values: string[]) {
  return Array.from(new Set(values));
}
