type CityGuidance = {
  city: string;
  positioning: string;
  directions: string[];
  followupQuestion: string;
};

const cityGuidance: Record<string, CityGuidance> = {
  新山: {
    city: "新山",
    positioning: "新山适合轻商务、跨境往来和产业考察联动，尤其适合希望衔接新加坡客群或产业资源的活动。",
    directions: ["本地商务接待型", "跨境考察联动型", "小型闭门交流型"],
    followupQuestion: "你这次更偏投资交流、项目路演，还是客户接待型活动？",
  },
  吉隆坡: {
    city: "吉隆坡",
    positioning: "吉隆坡适合较完整的商务会议、经销商大会和发布活动，资源密度、国际航班和酒店选择更成熟。",
    directions: ["主会场会议型", "品牌发布型", "经销商大会型"],
    followupQuestion: "你更希望优先比较场地档次，还是先整理服务组合？",
  },
  槟城: {
    city: "槟城",
    positioning: "槟城适合科技、制造、客户答谢和中小规模闭门交流，商务属性强于纯旅游接待。",
    directions: ["产业交流型", "客户答谢型", "闭门研讨型"],
    followupQuestion: "你更关注产业参访联动，还是现场会议体验？",
  },
  新加坡: {
    city: "新加坡",
    positioning: "新加坡适合高规格商务、金融科技、投资路演和区域总部型活动，但预算敏感度通常更高。",
    directions: ["高规格路演型", "区域总部交流型", "投资人闭门型"],
    followupQuestion: "你想先比较新加坡和马来西亚的预算差异，还是先看新加坡可执行形态？",
  },
};

export function getCityGuidance(city?: string) {
  if (!city) return undefined;
  return cityGuidance[city];
}
