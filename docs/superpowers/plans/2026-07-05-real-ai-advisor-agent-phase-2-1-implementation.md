# Phase 2.1 真实 AI 顾问 Agent 实施计划

日期：2026-07-05
状态：执行计划
依据：`docs/product/2026-07-05-real-ai-advisor-agent-design.md`

## 目标

把现有规则型 AI 顾问升级为“真实模型 Agent route + eval 基座”的可运行版本。继续保留 `/api/advisor/chat` 对前端兼容；在无 API key、模型调用失败、测试环境下稳定使用 fallback；客户侧继续只接收白名单 payload。

## 明确不做

- 不接正式 RAG / 知识库。
- 不把 MOCK 内容进入真实知识库。
- 不做 ops alert 持久化或真实通知。
- 不做微信 / 多渠道入口。
- 不自动生成正式报价。
- 不改 sitemap / noindex 策略。
- 不部署线上，除非后续另行确认。

## 文件范围

计划新增：

- `lib/agent/realSchemas.ts`：`RealAdvisorAgentTurnResult`、provider 输入输出、Zod schema。
- `lib/agent/providers/types.ts`：provider adapter 接口。
- `lib/agent/providers/mockProvider.ts`：稳定 rules fallback provider。
- `lib/agent/providers/openaiProvider.ts`：OpenAI provider adapter，只读取环境变量，不写真实密钥。
- `lib/agent/providers/index.ts`：按环境选择 provider。
- `lib/agent/realAdvisorOrchestrator.ts`：服务端编排、fallback、schema 校验和客户安全检查。
- `lib/agent/realCustomerMapper.ts`：客户 payload 白名单映射。
- `tests/agent/realAgentEval.fixtures.ts`：设计文档第 8 节 eval 场景。
- `tests/agent/realAgentEval.test.ts`：eval 基座测试。
- `tests/agent/realAgentProviderFallback.test.ts`：provider 失败 fallback 测试。
- `tests/agent/realAgentCustomerMapper.test.ts`：客户 / 内部字段隔离测试。

计划修改：

- `app/api/advisor/chat/route.ts`：内部切到新 orchestrator，输出保持前端兼容。
- `components/advisor/customerVisibility.ts`：补充 Phase 2.1 内部字段 denylist。
- `lib/agent/schemas.ts`：兼容 `configuration_ready` 阶段。
- `.env.example`：增加 `ADVISOR_AGENT_PROVIDER`、`OPENAI_API_KEY`、`OPENAI_ADVISOR_MODEL` 安全示例。
- `docs/product/2026-07-05-real-ai-advisor-agent-design.md`：补充 Phase 2.1 启用说明。

## 测试范围

先写失败测试，再补实现：

1. Schema / eval 测试：`RealAdvisorAgentTurnResult` 支持 `orientation / exploring / structuring / configuration_ready / handoff_ready`。
2. 15 条 eval 场景至少断言 `stage`、`canEnterConfigurator`、`shouldNotifyOperator`、关键安全口径、禁止客户字段。
3. Provider fallback 测试：provider 抛错时仍返回安全回复。
4. Mapper 测试：客户 payload 不包含 `opsOnlySummary`、`leadSignals`、真实性、意向、优先级、风险、供应商内部字段、底价、返点、内部备注。
5. Route 兼容：`/api/advisor/chat` 正常消息返回 customer-safe payload。
6. 全量 `npm run test` 通过。
7. `npm run build` 通过。
8. 本地 Chrome 验收 `/advisor`：
   - “我想到新山举办投资大会，有什么建议的方案吗？”先解释新山适配场景，给方向建议，最多追问一个关键问题。
   - “地点在吉隆坡，120人，经销商大会，预算80-100万，需要物料和接送机”进入配置准备态，预算不为 0。

## 上线与回滚边界

上线边界：

- 默认无 `OPENAI_API_KEY` 时使用 fallback，不影响审核站可用性。
- 配置 `ADVISOR_AGENT_PROVIDER=openai`，且存在 `OPENAI_API_KEY` 与 `OPENAI_ADVISOR_MODEL` 后才启用真实 provider。
- provider 失败必须回落到 fallback，不中断客户咨询。

回滚边界：

- 如果真实 provider 质量或稳定性不达标，可将 `ADVISOR_AGENT_PROVIDER` 切回 `mock` / `rules`。
- 如果 route 输出不兼容前端，可回退 `app/api/advisor/chat/route.ts` 到上一版 `runAdvisorTurn` 输出。
- 客户字段 mapper 与安全测试必须保留，不作为回滚对象。

## 执行顺序

1. 写 schema / mapper / eval 的失败测试。
2. 新增真实 Agent schema 与客户 mapper。
3. 新增 provider adapter 和 fallback provider。
4. 新增 orchestrator，接入 provider 选择、失败 fallback、schema 校验和安全过滤。
5. 改 `/api/advisor/chat` 内部编排，保持客户 payload 兼容。
6. 必要时做前端最小适配。
7. 更新 `.env.example` 与 Phase 2.1 说明文档。
8. 运行测试、构建、本地 Chrome 验收。
9. 提交并 push。
