import type {
  RealAdvisorAgentTurnRequest,
  RealAdvisorAgentTurnResult,
  RealAdvisorExtractedFacts,
  RealAdvisorRecommendedNextAction,
  RealAdvisorSafetyCode,
  RealAdvisorStage,
} from "@/lib/agent/realSchemas";
import { parseRealAdvisorAgentTurnResult } from "@/lib/agent/realSchemas";
import type { AdvisorAgentProvider } from "@/lib/agent/providers/types";

const serviceMatchers: Array<[string, RegExp]> = [
  ["会议物料", /物料|会议手册|手册|胸卡|易拉宝|PPT|ppt/i],
  ["接送机", /接送|机场|用车|transport|transfer/i],
  ["住宿", /住宿|酒店|hotel/i],
  ["晚宴", /晚宴|gala|dinner|宴会/i],
  ["AV/舞台", /\bAV\b|舞台|灯光|音响|screen|stage/i],
  ["茶歇", /茶歇|coffee break/i],
  ["同传", /同传|翻译|interpret/i],
  ["摄影摄像", /摄影|摄像|拍摄|video|photo/i],
];

export function createRulesAdvisorProvider(): AdvisorAgentProvider {
  return {
    name: "rules",
    async generateTurn(request) {
      return buildRulesTurn(request);
    },
  };
}

export function buildRulesTurn(request: RealAdvisorAgentTurnRequest): RealAdvisorAgentTurnResult {
  const message = request.message.trim();
  const facts = mergeFacts(request.currentFacts, extractFacts(message));
  const flags = safetyFlagsFor(message);
  const stage = classifyStage(message, facts);
  const recommendedNextAction = nextActionFor(stage, message);
  const canEnterConfigurator =
    stage === "configuration_ready" || (stage === "handoff_ready" && hasHandoffConfigurationFacts(facts));
  const shouldNotifyOperator = stage === "handoff_ready";
  const reply = replyFor({ message, facts, stage, flags, canEnterConfigurator });

  return parseRealAdvisorAgentTurnResult({
    stage,
    replyToCustomer: reply.replyToCustomer,
    followupQuestion: reply.followupQuestion,
    extractedFacts: facts,
    missingFacts: missingFactsFor(facts, stage),
    budgetUnderstanding: budgetUnderstandingFor(message, facts, stage),
    recommendedNextAction,
    canEnterConfigurator,
    shouldNotifyOperator,
    opsOnlySummary: shouldNotifyOperator
      ? {
          leadSummary: `客户咨询${facts.city ?? "目标城市待确认"}${facts.eventType ?? "会务活动"}，需要顾问确认正式价格、档期和条款。`,
          suggestedFollowup: "由运营核实活动时间、联系方式和资源询价需求后再跟进。",
          missingInformation: missingFactsFor(facts, stage),
          recommendedOpening: "已收到你的需求，我先帮你确认正式报价和档期。",
        }
      : undefined,
    leadSignals: shouldNotifyOperator
      ? {
          authenticityLevel: "medium",
          intentLevel: "high",
          urgencyLevel: /这周|明天|尽快|定供应商|付定金/.test(message) ? "high" : "medium",
          reasons: ["客户要求顾问确认正式事项或推进下一步"],
        }
      : undefined,
    safetyFlags: flags.map((code) => ({
      code,
      customerSafeHandling: customerSafeHandlingFor(code),
    })),
  });
}

function mergeFacts(
  currentFacts: RealAdvisorAgentTurnRequest["currentFacts"],
  extractedFacts: RealAdvisorExtractedFacts,
): RealAdvisorExtractedFacts {
  const services = [
    ...(currentFacts?.requestedServices ?? []),
    ...(extractedFacts.requestedServices ?? []),
  ].filter(Boolean);

  return {
    ...currentFacts,
    ...extractedFacts,
    requestedServices: services.length ? Array.from(new Set(services)) : undefined,
  };
}

function extractFacts(message: string): RealAdvisorExtractedFacts {
  const city = extractCity(message);
  const eventType = extractEventType(message);
  const attendeeCount = extractAttendeeCount(message);
  const budgetRange = extractBudgetRange(message);
  const requestedServices = extractServices(message);

  return {
    city,
    region: city ? cityRegion(city) : undefined,
    eventType,
    eventIntent: eventType,
    attendeeCount,
    scaleBand: attendeeCount ? scaleBandFor(attendeeCount) : undefined,
    budgetRange,
    requestedServices: requestedServices.length ? requestedServices : undefined,
    contactProvided: /电话|微信|手机号|whatsapp|email|邮箱/i.test(message),
  };
}

function extractCity(message: string) {
  if (/新山|johor bahru|johor|JB\b/i.test(message)) return "新山";
  if (/吉隆坡|Kuala Lumpur|\bKL\b|KLCC/i.test(message)) return "吉隆坡";
  if (/槟城|penang/i.test(message)) return "槟城";
  if (/新加坡|singapore/i.test(message)) return "新加坡";
  return undefined;
}

function cityRegion(city: string) {
  if (city === "新加坡") return "新加坡";
  return "马来西亚";
}

function extractEventType(message: string) {
  if (/投资大会|投资人|investment/i.test(message)) return "投资大会";
  if (/经销商|dealer/i.test(message)) return "经销商大会";
  if (/内部培训|培训|training/i.test(message)) return "内部培训";
  if (/项目路演|路演|roadshow/i.test(message)) return "项目路演";
  if (/客户答谢|答谢/i.test(message)) return "客户答谢会";
  if (/商务|conference|summit|大会/i.test(message)) return "商务会议";
  return undefined;
}

function extractAttendeeCount(message: string) {
  const match = message.match(/(\d{2,4})\s*(?:人|位|pax|-pax)/i);
  return match ? Number(match[1]) : undefined;
}

function extractBudgetRange(message: string) {
  const range = message.match(/预算(?:只有)?\s*([0-9]+(?:\s*[-到~]\s*[0-9]+)?)\s*万/);
  if (!range) return undefined;
  return `${range[1].replace(/\s+/g, "")}万`;
}

function extractServices(message: string) {
  return serviceMatchers.flatMap(([service, matcher]) => (matcher.test(message) ? [service] : []));
}

function scaleBandFor(attendeeCount: number) {
  if (attendeeCount < 80) return "small";
  if (attendeeCount <= 200) return "medium";
  return "large";
}

function safetyFlagsFor(message: string): RealAdvisorSafetyCode[] {
  const flags: RealAdvisorSafetyCode[] = [];
  if (/报价|多少钱|价格|KLCC/.test(message)) flags.push("quote_requested");
  if (/档期|付定金|取消|合同|条款|锁/.test(message)) flags.push("availability_requested");
  if (/底价|供应商名字|供应商名称|返点|谈判空间/.test(message)) flags.push("supplier_internal_requested");
  if (/案例|照片|现场图|客户名/.test(message)) flags.push("private_data_risk");
  return Array.from(new Set(flags));
}

function classifyStage(message: string, facts: RealAdvisorExtractedFacts): RealAdvisorStage {
  if (
    /这周|明天|尽快|定供应商|付定金|取消|合同|正式报价|档期/.test(message) &&
    !/直接给我报价吧|多少钱/.test(message)
  ) {
    return "handoff_ready";
  }

  if (hasConfigurationFacts(facts)) return "configuration_ready";

  if (facts.budgetRange || /标准型|经济型|高配型|预算只有/.test(message)) return "structuring";

  if (facts.city || facts.eventType || facts.requestedServices?.length) return "exploring";

  return "orientation";
}

function hasConfigurationFacts(facts: RealAdvisorExtractedFacts) {
  const hasCore = Boolean(facts.city && facts.eventType && facts.attendeeCount);
  const hasBudgetOrServices = Boolean(facts.budgetRange || facts.requestedServices?.length);
  return hasCore && hasBudgetOrServices;
}

function hasHandoffConfigurationFacts(facts: RealAdvisorExtractedFacts) {
  return Boolean(facts.city && facts.eventType && facts.attendeeCount);
}

function nextActionFor(stage: RealAdvisorStage, message: string): RealAdvisorRecommendedNextAction {
  if (stage === "handoff_ready") return "handoff_to_operator";
  if (stage === "configuration_ready") return "enter_configurator";
  if (/哪个|比较|方案|适合/.test(message)) return "compare_options";
  if (stage === "structuring") return "ask_one_question";
  return "continue_orientation";
}

function missingFactsFor(facts: RealAdvisorExtractedFacts, stage: RealAdvisorStage) {
  if (stage === "orientation") return ["活动目的或目标城市"];
  const missing: string[] = [];
  if (!facts.city) missing.push("目标城市");
  if (!facts.eventType) missing.push("活动类型");
  if (!facts.attendeeCount) missing.push("大致人数");
  if (!facts.budgetRange) missing.push("预算意识");
  if (!facts.requestedServices?.length) missing.push("核心服务项");
  return missing;
}

function budgetUnderstandingFor(message: string, facts: RealAdvisorExtractedFacts, stage: RealAdvisorStage) {
  if (!facts.budgetRange && !/报价|多少钱|预算|标准型|经济型|高配型/.test(message)) return undefined;

  return {
    level: stage === "configuration_ready" ? "ready_for_estimate" : facts.budgetRange ? "rough_range" : "unknown",
    customerVisibleSummary:
      "当前只能作为预算结构估算或参考范围，正式价格、档期、付款和取消条款需顾问基于本次询价确认。",
    assumptions: ["按活动城市、规模、服务项和提前期影响做方向判断"],
    exclusions: ["正式报价", "实时档期", "付款条款", "取消条款", "供应商内部条件"],
  } as const;
}

function replyFor({
  message,
  facts,
  stage,
  flags,
  canEnterConfigurator,
}: {
  message: string;
  facts: RealAdvisorExtractedFacts;
  stage: RealAdvisorStage;
  flags: RealAdvisorSafetyCode[];
  canEnterConfigurator: boolean;
}) {
  if (flags.includes("supplier_internal_requested")) {
    return {
      replyToCustomer:
        "不能提供供应商内部信息。供应商名称、底价、返点和谈判空间属于内部合作信息。我可以改为帮你说明客户可见的服务范围、参考预算影响因素，以及哪些事项需要顾问基于本次询价确认。",
      followupQuestion: "你更想先了解城市方案，还是先看服务项会怎样影响预算？",
    };
  }

  if (flags.includes("private_data_risk") && /案例|照片|现场图|客户名/.test(message)) {
    return {
      replyToCustomer:
        "案例和现场照片只能使用已获授权的公开材料；未授权客户名、照片或现场信息不能直接对外展示。现阶段我可以先按场景说明可参考的活动方向，具体素材由顾问确认后提供。",
      followupQuestion: "你更关心同类型客户案例，还是先看城市和活动形式建议？",
    };
  }

  if (/吉隆坡.*新山|新山.*吉隆坡/.test(message)) {
    return {
      replyToCustomer:
        "吉隆坡更适合强调商务形象、国际航班便利和大型会议资源；新山更适合跨境联动、产业考察和预算更克制的商务接待。投资人活动如果重视国际形象和集中会务，先看吉隆坡；如果想结合新加坡周边和园区考察，新山更有特色。",
      followupQuestion: "这次更看重商务形象，还是跨境考察联动？",
    };
  }

  if (stage === "handoff_ready") {
    return {
      replyToCustomer:
        "这类事项需要顾问接手做正式确认。我可以把当前需求整理给顾问，用于确认正式价格、实时档期、付款和取消条款；在顾问确认前，不能承诺锁定资源或合同条件。",
      followupQuestion: "你方便补充联系人和活动日期范围吗？",
    };
  }

  if (canEnterConfigurator) {
    const cityDisplay = /\bKL\b/i.test(message) && facts.city === "吉隆坡" ? "KL/吉隆坡" : facts.city;
    return {
      replyToCustomer: `我已经理解到：${cityDisplay ?? "目标城市"}、${facts.attendeeCount ?? "待确认"} 人左右、${facts.eventType ?? "会务活动"}，服务项包含${facts.requestedServices?.join("、") ?? "核心会务服务"}。现在可以进入方案配置，先看预算结构估算和需要顾问确认的事项；这不是正式报价。`,
      followupQuestion: "是否先按标准型进入方案配置？",
    };
  }

  if (/新山/.test(facts.city ?? "") && /投资大会/.test(facts.eventType ?? "")) {
    return {
      replyToCustomer:
        "新山适合做偏跨境商务、产业考察和投资交流的投资大会，尤其适合把马来西亚本地商务接待与新加坡周边资源联动起来。可先考虑三种方向：本地商务接待型，突出会议效率和政府/园区接待；跨境考察联动型，把会议和企业参访放在一起；小型闭门路演型，更适合高质量投资人交流。现在还不需要先填完整报价字段。",
      followupQuestion: "你这次更偏投资交流、项目路演，还是客户接待型活动？",
    };
  }

  if (/东南亚/.test(message) && !facts.city) {
    return {
      replyToCustomer:
        "东南亚办会可以先从几个方向判断：商务形象与交通效率、客户/经销商接待体验、以及预算和执行复杂度。马来西亚通常适合作为第一站，因为城市选择、酒店会场、晚宴和接送组织更容易形成可控方案。",
      followupQuestion: "你想先比较城市差异，还是先看一种可落地的活动框架？",
    };
  }

  if (/预算只有|30\s*万/.test(message)) {
    return {
      replyToCustomer:
        "这个预算可以先做取舍判断，但这不是正式报价。120 人经销商大会如果预算偏紧，通常要优先保留会场、基础 AV、签到物料和必要茶歇，晚宴、住宿、接送范围、舞台规格需要按目标再缩小。",
      followupQuestion: "你更希望保留现场商务形象，还是优先把总预算压住？",
    };
  }

  if (flags.includes("quote_requested")) {
    return {
      replyToCustomer:
        "我不能直接给正式价格。会务资源价格会受日期、人数、餐饮、AV、物料、住宿和提前期影响；正式价格、实时档期、付款和取消条款都需要顾问基于本次询价确认。我可以先帮你拆预算结构和需要确认的条件。",
      followupQuestion: "你可以先告诉我城市、规模和核心服务项，我会整理成顾问可确认的询价摘要。",
    };
  }

  if (/会议手册|胸卡|易拉宝|PPT|物料/i.test(message)) {
    return {
      replyToCustomer:
        "这类需求应归入会议物料与视觉支持，通常会影响设计、制作、运输、现场布置和返工时间。会议手册、胸卡、易拉宝、PPT 支持可以一起作为一个物料包来估算，但最终制作数量、材质和交付时间还需要确认。",
      followupQuestion: "这些物料是只需要设计，还是需要当地制作和现场布置？",
    };
  }

  if (/接送|酒店|晚宴|gala|dinner/i.test(message)) {
    return {
      replyToCustomer:
        "接送机、住宿和晚宴会明显影响预算结构。接送机要看航班批次和车辆等级，住宿要看房晚和酒店档次，晚宴要看餐标、酒水、场地和舞台要求；这些都只能先做参考估算，正式条件要本次询价确认。",
      followupQuestion: "你希望先按商务标准做完整接待，还是先控制预算保留必要项？",
    };
  }

  if (/只是先了解|还没立项/.test(message)) {
    return {
      replyToCustomer:
        "可以先停留在轻咨询阶段。现在最有价值的是把活动目的、目标城市和大致参会对象想清楚；不需要马上进入配置页或留完整信息。",
      followupQuestion: "你想先了解城市选择，还是先了解一场会通常由哪些服务项组成？",
    };
  }

  if (/槟城/.test(facts.city ?? "") && /内部培训/.test(facts.eventType ?? "")) {
    return {
      replyToCustomer:
        "槟城适合做 60 人左右的内部培训，尤其适合把安静会议、团队沟通和轻量接待结合起来。它不应被做成旅游感行程，重点应放在培训空间、住宿便利、会后简洁交流和交通组织。",
      followupQuestion: "这次培训是否需要住宿，还是只做一到两天的本地会务？",
    };
  }

  if (/标准型/.test(message)) {
    return {
      replyToCustomer:
        "标准型可以作为预算结构的中间方案：通常优先保留会场、茶歇、基础 AV、会议物料和必要接送，再根据预算决定晚宴、住宿、同传和摄影摄像。这里仍是参考估算，不是正式报价。",
      followupQuestion: "目标城市和大致人数确定后，我可以再判断是否进入方案配置。",
    };
  }

  return {
    replyToCustomer:
      "我先按顾问方式帮你梳理方向。现阶段可以先判断城市适配、活动目的、参会对象和关键服务项，再决定是否进入配置页做预算结构估算。",
    followupQuestion: "你这次活动更偏品牌展示、客户接待，还是内部沟通？",
  };
}

function customerSafeHandlingFor(code: RealAdvisorSafetyCode) {
  if (code === "quote_requested") return "只解释参考范围和影响因素，正式价格需本次询价确认。";
  if (code === "availability_requested") return "不承诺档期、付款、取消或合同条款，交由顾问确认。";
  if (code === "supplier_internal_requested") return "拒绝供应商内部信息，转为客户可见服务说明。";
  if (code === "private_data_risk") return "只使用授权材料，未授权案例和图片不对外展示。";
  return "避免把 MOCK 或未确认内容当作真实知识。";
}
