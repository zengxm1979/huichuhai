export const PACKAGE_TIERS = [
  {
    id: "economy",
    label: "经济型",
    description: "保留核心会务需求，控制非必要搭建、物料和接待成本。",
  },
  {
    id: "standard",
    label: "标准型",
    description: "配置完整，覆盖多数商务会议、经销商大会和企业活动的常规需求。",
  },
  {
    id: "premium",
    label: "高配型",
    description: "增加品牌呈现、现场体验和接待配置，适合重要客户、发布会和高规格活动。",
  },
] as const;

export type PackageTierId = (typeof PACKAGE_TIERS)[number]["id"];
export type PackageTierLabel = (typeof PACKAGE_TIERS)[number]["label"];
