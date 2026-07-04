import { assertCustomerSafePayload } from "@/components/advisor/customerVisibility";
import { PACKAGE_TIERS } from "@/lib/constants/packageTiers";
import type { AdvisorStep, CustomerAdvisorState, InternalAdvisorState } from "@/lib/advisor/types";

const baseServices = [
  ["venue", "场地", "五星酒店会议厅", "天", 1, 120000, 180000, "核心项目，建议保留。"],
  ["dinner", "晚宴", "中式围桌晚宴", "人", 120, 180000, 280000, "可按餐标调整。"],
  ["break", "茶歇", "上午 + 下午茶歇", "人", 120, 30000, 50000, "可改为单次茶歇。"],
  ["av", "AV/舞台", "LED 屏 + 灯光 + 音响", "套", 1, 80000, 150000, "可改为基础 AV 配置。"],
  ["materials", "会议物料", "背板、指示牌、胸卡、手册", "套", 1, 20000, 50000, "按设计复杂度调整。"],
  ["transfer", "接送机", "机场接送 + 活动用车", "人", 120, 30000, 50000, "根据航班批次确认。"],
  ["hotel", "住宿", "五星酒店住宿", "间夜", 120, 96000, 144000, "房型与档期需确认。"],
  ["interpretation", "同传", "中英同传 2 通道", "通道", 2, 40000, 60000, "适合跨语种会议。"],
  ["photo", "摄影摄像", "摄影 + 剪辑精编", "套", 1, 20000, 30000, "可增加快剪交付。"],
] as const;

function serviceSelections(mode: "standard" | "mismatch") {
  return baseServices.map(([id, category, itemName, unit, quantity, min, max, note], index) => ({
    id,
    category,
    itemName,
    unit,
    quantity,
    selectionStatus:
      mode === "mismatch" && ["av", "materials", "photo"].includes(id) ? ("optional" as const) : ("selected" as const),
    unitPriceMin: min,
    unitPriceMax: max,
    subtotalMin: min,
    subtotalMax: max,
    tradeoffNote: note,
    requiresHumanConfirmation: index < 7,
  }));
}

export const advisorStates: Record<AdvisorStep, CustomerAdvisorState> = {
  initial: {
    step: "initial",
    inquiry: {
      customerStatus: "draft",
    },
    serviceSelections: [],
    nextActions: [{ label: "生成初步方案", action: "confirm_missing_info" }],
  },
  configuration: {
    step: "configuration",
    inquiry: {
      eventType: "经销商大会",
      city: "吉隆坡",
      attendeeCount: 120,
      budgetRange: "¥80 - 100 万",
      selectedPackage: "标准型",
      customerStatus: "draft",
    },
    serviceSelections: serviceSelections("standard"),
    budgetEstimate: {
      title: "预算结构估算（标准型）",
      currency: "CNY",
      selectedPackage: "标准型",
      totalMin: 900000,
      totalMax: 1100000,
      customerMatchSummary: "当前方案基本覆盖预算范围。金额为参考范围，酒店档期、晚宴菜单、付款和取消条款需基于本次询价确认。",
      assumptions: ["120 人", "吉隆坡", "会议 + 晚宴", "含基础会务物料"],
      exclusions: ["本次正式报价", "实时档期", "付款与取消条款", "加急制作费用"],
      requiresHumanConfirmation: ["酒店档期", "晚宴菜单", "付款、取消与合同条款"],
    },
    nextActions: [
      { label: "提交顾问确认", action: "submit_to_advisor" },
      { label: "继续调整方案", action: "continue_adjusting" },
    ],
  },
  budgetMismatch: {
    step: "budgetMismatch",
    inquiry: {
      eventType: "经销商大会",
      city: "吉隆坡",
      attendeeCount: 120,
      budgetRange: "¥60 - 70 万",
      selectedPackage: "标准型",
      customerStatus: "draft",
    },
    serviceSelections: serviceSelections("mismatch"),
    budgetEstimate: {
      title: "预算调整建议",
      currency: "CNY",
      selectedPackage: "标准型",
      totalMin: 800000,
      totalMax: 920000,
      customerMatchSummary: "当前方案超出预算范围，可优先调整晚宴、AV/舞台和部分物料配置。",
      assumptions: ["120 人", "预算 ¥60 - 70 万", "标准型配置"],
      exclusions: ["本次正式报价", "酒店档期", "付款与取消条款"],
      requiresHumanConfirmation: ["晚宴餐标", "AV 配置", "物料范围"],
    },
    nextActions: [
      { label: "应用经济型建议", action: "continue_adjusting" },
      { label: "提交顾问协助压缩预算", action: "submit_to_advisor" },
    ],
  },
  submit: {
    step: "submit",
    inquiry: {
      company: "示例科技有限公司 [MOCK]",
      contactName: "李女士 [MOCK]",
      eventType: "经销商大会",
      city: "吉隆坡",
      attendeeCount: 120,
      budgetRange: "¥80 - 100 万",
      selectedPackage: "标准型",
      customerStatus: "ready_to_submit",
    },
    serviceSelections: serviceSelections("standard"),
    budgetEstimate: {
      title: "待顾问确认的方案摘要",
      currency: "CNY",
      selectedPackage: "标准型",
      totalMin: 900000,
      totalMax: 1100000,
      customerMatchSummary: "方案已整理为顾问可跟进摘要，正式价格、档期、付款和取消条款需基于本次询价确认。",
      assumptions: ["120 人", "吉隆坡", "标准型", "含会议、晚宴、住宿、交通与物料"],
      exclusions: ["本次正式报价", "真实供应商合同", "未确认客户特殊需求"],
      requiresHumanConfirmation: ["场地档期", "房型数量", "付款与取消条款"],
    },
    nextActions: [{ label: "提交给顾问确认", action: "submit_to_advisor" }],
  },
};

export const internalLeadState: InternalAdvisorState = {
  ...advisorStates.submit,
  internal: {
    authenticityScore: 4,
    intentScore: 5,
    leadPriority: "high",
    budgetRisks: ["预算上限需确认", "晚宴餐标可能超出预期"],
    riskFlags: ["档期紧张 [MOCK]", "房量待确认"],
    recommendedNextAction: "优先确认活动日期、预算上限和住宿间夜。",
    recommendedFollowupFocus: "询问是否需要含白酒、中式菜单、接送机批次和付款主体。",
    recommendedReply:
      "李女士您好，我们已整理经销商大会的标准型方案。想先确认活动日期、预算上限和酒店房量，方便同步核档期与正式报价。[MOCK]",
  },
};

export function getCustomerAdvisorState(step: AdvisorStep): CustomerAdvisorState {
  const payload = advisorStates[step] ?? advisorStates.configuration;
  assertCustomerSafePayload(payload);
  return payload;
}

export function getPackageTiers() {
  return PACKAGE_TIERS;
}
