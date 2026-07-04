import { getCityGuidance } from "@/lib/agent/knowledge/regionGuidance";
import { advisorAgentPolicies, scrubForbiddenCustomerPhrases } from "@/lib/agent/policies";
import { extractAgentFacts } from "@/lib/agent/requirement-extractor";
import { classifyAdvisorStage } from "@/lib/agent/stage-classifier";
import { shouldNotifyOperator } from "@/lib/agent/handoff-scorer";
import type { AdvisorAnswerStrategy, AgentTurnRequest, AgentTurnResult, AgentExtractedFacts } from "@/lib/agent/schemas";

export function runAdvisorTurn(request: AgentTurnRequest): AgentTurnResult {
  const message = request.message.trim();
  const facts = extractAgentFacts(message, request.currentFacts);
  const stage = classifyAdvisorStage(facts, message);
  const answerStrategy = selectAnswerStrategy(stage, message, facts);
  const followupQuestion = buildFollowupQuestion(answerStrategy, facts);
  const notifyOperator = shouldNotifyOperator(stage, facts, message);

  return {
    stage,
    understoodIntent: buildUnderstoodIntent(facts, message),
    extractedFacts: facts,
    customerGoalSummary: buildCustomerGoalSummary(facts),
    customerPriorityFocus: facts.customerPriorityFocus,
    regionPreferenceSummary: facts.city ? `倾向${facts.city}` : undefined,
    answerStrategy,
    reply: scrubForbiddenCustomerPhrases(buildReply(answerStrategy, facts, followupQuestion)),
    followupQuestion,
    canEnterConfigurator: stage === "structuring" || stage === "handoff_ready",
    shouldNotifyOperator: notifyOperator,
  };
}

function selectAnswerStrategy(
  stage: AgentTurnResult["stage"],
  message: string,
  facts: AgentExtractedFacts,
): AdvisorAnswerStrategy {
  if (stage === "handoff_ready") return "handoff_to_operator";
  if (stage === "structuring") return "enter_configurator";
  if (facts.city && facts.eventType && /建议|方案|比较|怎么|如何|适合|推荐/.test(message)) return "compare_options";
  if (stage === "exploring") return "explain_first";
  return "ask_one_question";
}

function buildReply(strategy: AdvisorAnswerStrategy, facts: AgentExtractedFacts, followupQuestion?: string) {
  if (strategy === "handoff_to_operator") {
    return `已整理到可以交给顾问确认的程度。接下来顾问会基于本次询价确认正式价格、档期、付款和取消条款；我也可以先把当前方案方向整理成配置草案。${advisorAgentPolicies.customerSafeQuoteNotice}`;
  }

  if (strategy === "enter_configurator") {
    const services = facts.requestedServices?.length ? `，已记录服务项：${facts.requestedServices.join("、")}` : "";
    return `收到。已整理 ${facts.city} / ${facts.attendeeCount}人 / ${facts.eventType} / 预算${facts.budgetRange}${services}。信息已足够进入第二层方案配置。${advisorAgentPolicies.customerSafeQuoteNotice}`;
  }

  const guidance = getCityGuidance(facts.city);
  if (strategy === "compare_options" && guidance) {
    const eventType = facts.eventType ?? "这类活动";
    return `${guidance.positioning} 如果做${eventType}，建议先看三个方向：1. ${guidance.directions[0]}；2. ${guidance.directions[1]}；3. ${guidance.directions[2]}。${followupQuestion ?? guidance.followupQuestion}`;
  }

  if (strategy === "explain_first") {
    const context = [facts.city, facts.eventType].filter(Boolean).join(" / ");
    return context
      ? `可以，先按 ${context} 判断方向。现阶段不用急着报人数和预算，我们先确认活动目标、城市适配和关注重点，再决定是否进入配置。${followupQuestion ?? "你更想先比较城市差异，还是先看这个地点可以怎么做？"}`
      : `可以，我先帮你判断办会方向。先不用进入报价配置，我们可以从目标城市、活动意图或关注重点开始。${followupQuestion ?? "你更想先看城市适配，还是先看活动形态？"}`;
  }

  return `可以，我先做方向判断，再帮你收窄到可执行方案。${followupQuestion ?? "你这次更想先确认目标城市，还是活动类型？"}`;
}

function buildFollowupQuestion(strategy: AdvisorAnswerStrategy, facts: AgentExtractedFacts) {
  if (strategy === "enter_configurator" || strategy === "handoff_to_operator") return undefined;
  const guidance = getCityGuidance(facts.city);
  if (guidance) return guidance.followupQuestion;
  if (!facts.city) return "你倾向在哪个城市举办，还是希望先比较几个城市？";
  if (!facts.eventType) return "这次更偏投资交流、客户接待、经销商大会，还是发布活动？";
  return "你更想先看城市差异，还是先看这个地点可以怎么做？";
}

function buildUnderstoodIntent(facts: AgentExtractedFacts, message: string) {
  if (facts.city && facts.eventType) return `咨询${facts.city}${facts.eventType}方向`;
  if (facts.city) return `咨询${facts.city}办会方向`;
  if (facts.eventType) return `咨询${facts.eventType}方案方向`;
  return message.slice(0, 40) || "初步办会咨询";
}

function buildCustomerGoalSummary(facts: AgentExtractedFacts) {
  if (facts.city && facts.eventType) return `在${facts.city}举办${facts.eventType}`;
  if (facts.city) return `倾向在${facts.city}举办活动`;
  if (facts.eventType) return `计划举办${facts.eventType}`;
  return undefined;
}
