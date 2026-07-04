# 会出海文档索引

本目录用于管理项目需求、产品设计、技术架构、内容策略和后续实现计划。

## 已归档文档

- `product/source/会出海-OutboundMICE-产品需求文档-v1.0.docx`
  - Chris 提供的原始 PRD 文档。
  - 用作业务背景、初始需求和客户交付依据。

- `superpowers/specs/2026-07-04-huichuhai-platform-design.md`
  - 当前产品设计规格。
  - 已包含业务定位、独立站信息架构、AI 办会顾问、预算匹配、数据模型、GEO、目录规划和后续实现方向。

- `product/customer-internal-field-matrix.md`
  - 客户可见 / 运营内参字段矩阵。
  - 定义 AI 顾问、预算匹配、询价表单和运营通知中的字段可见性边界。

- `superpowers/plans/2026-07-04-huichuhai-mvp-implementation.md`
  - MVP 实现计划。
  - 用于正式进入代码阶段时按任务拆解执行。

- `design/high-fidelity/ai-advisor-plan-configurator-v1.png`
  - AI 办会顾问面板高保真结构参考。
  - 当前选定方向为“方案配置器”：客户侧可选择方案包、调整服务项、理解预算结构；运营侧可生成给 Chris 的结构化摘要。
  - 图片稿只作为结构与视觉气质参考，最终文案、价格和真实数据以规格文档和 Chris 确认信息为准。

- `design/high-fidelity/ai-advisor-state-1-initial-consultation.png`
  - AI 顾问初始咨询状态。

- `design/high-fidelity/ai-advisor-state-2-plan-configuration.png`
  - AI 顾问方案配置状态。

- `design/high-fidelity/ai-advisor-state-3-budget-mismatch.png`
  - AI 顾问预算不匹配与调整建议状态。

- `design/high-fidelity/ai-advisor-state-4-submit-to-advisor.png`
  - AI 顾问提交真人顾问确认状态。

## 文档管理原则

- 原始输入文档保存在 `docs/product/source/`，尽量不直接改动。
- 经过讨论沉淀的规格、架构和设计结论保存在 Markdown 文档中，便于版本管理。
- 高保真图片稿保存在 `docs/design/high-fidelity/`，需配套文字说明，避免把生成图中的错误文字当作最终内容。
- 使用 MOCK 信息时必须明确标记，不能混入正式客户承诺。
- AI 对客户真实性、意向、风险和跟进优先级的判断属于运营内参，不能展示给客户。
- 进入实现前，应先完成高保真 UI 和实现计划拆解。
