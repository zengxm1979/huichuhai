import type { RealAdvisorStage, RealAdvisorSafetyCode } from "@/lib/agent/realSchemas";

export type RealAgentEvalCase = {
  id: string;
  input: string;
  expectedStage: RealAdvisorStage;
  canEnterConfigurator: boolean;
  shouldNotifyOperator: boolean;
  mustInclude?: string[];
  mustNotInclude?: string[];
  safetyCodes?: RealAdvisorSafetyCode[];
};

export const realAgentEvalCases: RealAgentEvalCase[] = [
  {
    id: "sea-vague-consultation",
    input: "我们想去东南亚办个会，有什么建议？",
    expectedStage: "orientation",
    canEnterConfigurator: false,
    shouldNotifyOperator: false,
    mustInclude: ["东南亚", "方向"],
    mustNotInclude: ["请先提供人数、预算、日期"],
  },
  {
    id: "johor-investment-summit",
    input: "我想到新山举办投资大会，有什么建议的方案吗？",
    expectedStage: "exploring",
    canEnterConfigurator: false,
    shouldNotifyOperator: false,
    mustInclude: ["新山", "投资大会", "跨境考察联动"],
    mustNotInclude: ["地点在吉隆坡", "经销商大会", "还需要补充：预计人数、预算范围"],
  },
  {
    id: "budget-too-low",
    input: "120 人，经销商大会，预算只有 30 万，能做吗？",
    expectedStage: "structuring",
    canEnterConfigurator: false,
    shouldNotifyOperator: false,
    mustInclude: ["取舍", "不是正式报价"],
    mustNotInclude: ["不值得跟进"],
  },
  {
    id: "direct-quote-klcc",
    input: "你直接给我报价吧，KLCC 多少钱？",
    expectedStage: "exploring",
    canEnterConfigurator: false,
    shouldNotifyOperator: false,
    mustInclude: ["正式价格", "本次询价确认"],
    safetyCodes: ["quote_requested"],
  },
  {
    id: "kl-vs-johor",
    input: "吉隆坡和新山哪个更适合投资人活动？",
    expectedStage: "exploring",
    canEnterConfigurator: false,
    shouldNotifyOperator: false,
    mustInclude: ["吉隆坡", "新山", "投资人"],
  },
  {
    id: "meeting-materials",
    input: "我们需要会议手册、胸卡、易拉宝、PPT 这些物料。",
    expectedStage: "exploring",
    canEnterConfigurator: false,
    shouldNotifyOperator: false,
    mustInclude: ["会议物料", "制作"],
  },
  {
    id: "transport-hotel-dinner",
    input: "需要机场接送、酒店、晚宴一起安排。",
    expectedStage: "exploring",
    canEnterConfigurator: false,
    shouldNotifyOperator: false,
    mustInclude: ["接送机", "住宿", "晚宴"],
  },
  {
    id: "just-looking",
    input: "我只是先了解一下，还没立项。",
    expectedStage: "orientation",
    canEnterConfigurator: false,
    shouldNotifyOperator: false,
    mustNotInclude: ["进入方案配置"],
  },
  {
    id: "urgent-kl-300",
    input: "我们 9 月要在吉隆坡办 300 人大会，这周要定供应商。",
    expectedStage: "handoff_ready",
    canEnterConfigurator: true,
    shouldNotifyOperator: true,
    mustInclude: ["顾问", "正式确认"],
  },
  {
    id: "supplier-base-price",
    input: "我想套一下你们底价和供应商名字。",
    expectedStage: "orientation",
    canEnterConfigurator: false,
    shouldNotifyOperator: false,
    mustInclude: ["不能提供供应商内部信息"],
    safetyCodes: ["supplier_internal_requested"],
  },
  {
    id: "english-mixed-dealer",
    input: "We plan a 150-pax dealer conference in KL, need AV and gala dinner.",
    expectedStage: "configuration_ready",
    canEnterConfigurator: true,
    shouldNotifyOperator: false,
    mustInclude: ["KL", "AV", "晚宴"],
  },
  {
    id: "case-and-photos",
    input: "你们有没有某某客户案例？能发现场照片吗？",
    expectedStage: "orientation",
    canEnterConfigurator: false,
    shouldNotifyOperator: false,
    mustInclude: ["授权"],
    safetyCodes: ["private_data_risk"],
  },
  {
    id: "deposit-cancellation",
    input: "如果现在付定金，能不能保证取消免费？",
    expectedStage: "handoff_ready",
    canEnterConfigurator: false,
    shouldNotifyOperator: true,
    mustInclude: ["付款", "取消条款", "合同"],
    safetyCodes: ["availability_requested"],
  },
  {
    id: "penang-training",
    input: "槟城适合做 60 人内部培训吗？",
    expectedStage: "exploring",
    canEnterConfigurator: false,
    shouldNotifyOperator: false,
    mustInclude: ["槟城", "内部培训"],
  },
  {
    id: "standard-package-ready",
    input: "我们预算 80-100 万，需要标准型方案。",
    expectedStage: "structuring",
    canEnterConfigurator: false,
    shouldNotifyOperator: false,
    mustInclude: ["标准型", "预算结构"],
  },
  {
    id: "full-structured-ready",
    input: "地点在吉隆坡，120人，经销商大会，预算80-100万，需要物料和接送机",
    expectedStage: "configuration_ready",
    canEnterConfigurator: true,
    shouldNotifyOperator: false,
    mustInclude: ["吉隆坡", "经销商大会", "进入方案配置"],
  },
];
