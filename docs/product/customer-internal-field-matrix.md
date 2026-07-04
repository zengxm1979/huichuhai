# 客户可见 / 运营内参字段矩阵

本文档定义会出海 AI 办会顾问、询价表单、预算匹配和运营通知中的字段可见性。后续实现时，客户侧页面和小程序不能直接消费内部数据对象，必须通过客户可见 API 白名单输出。

## 可见性分级

| 分级 | 含义 | 可出现位置 |
|---|---|---|
| `public` | 公开内容，未登录客户和搜索引擎可见 | 官网页面、方案页、场地页、FAQ、GEO 内容 |
| `customer` | 客户本人可见，与当前咨询相关 | AI 顾问面板、询价表单、提交确认页、小程序客户侧 |
| `operator` | Chris / 运营可见 | Supabase Dashboard、后续运营后台、内部通知 |
| `server_only` | 只允许服务端计算或存储，不直接返回前端 | 评分规则、模型提示词、字段过滤逻辑、原始对话审计 |

核心原则：

- 客户侧默认只能看到 `public` 和 `customer` 字段。
- `operator` 字段只能出现在 Chris / 运营后台和内部通知中。
- `server_only` 字段不能进入任何客户端响应。
- 不能依赖前端隐藏内部字段，接口层必须做白名单过滤。
- 同一份结构化数据可以派生客户版和运营版，但不能共用同一个展示组件。

## 询价主表 `inquiries`

| 字段 | 可见性 | 客户侧用途 | 运营侧用途 | 备注 |
|---|---|---|---|---|
| `id` | `server_only` | 不展示 | 关联查询 | 客户侧可使用短 token 或会话 ID，不暴露数据库 ID |
| `company` | `customer` | 联系信息确认 | 客户识别 | 客户自己填写，可回显 |
| `contact_name` | `customer` | 联系信息确认 | 客户识别 | 客户自己填写，可回显 |
| `phone` | `customer` | 联系信息确认 | 跟进联系 | 客户侧只回显客户自己提交的信息 |
| `whatsapp` | `customer` | 联系信息确认 | 跟进联系 | 同上 |
| `wechat` | `customer` | 联系信息确认 | 跟进联系 | 同上 |
| `email` | `customer` | 联系信息确认 | 跟进联系 | 同上 |
| `event_type` | `customer` | 需求摘要 | 需求判断 | 可见 |
| `event_start_date` | `customer` | 需求摘要 | 需求判断 | 可见 |
| `event_end_date` | `customer` | 需求摘要 | 需求判断 | 可见 |
| `attendee_count` | `customer` | 需求摘要 | 预算估算 | 可见 |
| `budget_range` | `customer` | 预算匹配 | 预算判断 | 可见，但不评价客户预算高低 |
| `budget_preference` | `customer` | 方案选择 | 跟进判断 | 如经济型、标准型、高配型 |
| `budget_advice_summary` | `customer` | 预算说明 | 需求理解 | 只能表达服务取舍 |
| `budget_estimate_summary` | `customer` | 预算估算摘要 | 预算判断 | 不是正式报价 |
| `selected_package` | `customer` | 方案包展示 | 跟进判断 | 建议值：经济型 / 标准型 / 高配型 / 自定义 |
| `needs_completeness_score` | `operator` | 不展示 | 判断信息完整度 | 客户侧可展示“还需确认项”，不能展示评分 |
| `budget_match_score` | `operator` | 不展示 | 判断预算匹配 | 客户侧只展示预算覆盖度文案或进度，不展示内部分数 |
| `service_fit_score` | `operator` | 不展示 | 判断服务可行性 | 客户侧只展示可行性说明 |
| `match_summary` | 分版本 | 客户版展示服务匹配；运营版展示判断摘要 | 运营判断 | 必须派生为 `customer_match_summary` 和 `operator_match_summary` |
| `event_materials_needed` | `customer` | 服务项选择 | 物料协调 | 可见 |
| `event_materials_types` | `customer` | 服务项选择 | 物料协调 | 可见 |
| `event_materials_notes` | `customer` | 服务项备注 | 物料协调 | 可见 |
| `venue_id` | `customer` | 意向场地 | 场地询价 | 只展示场地公开信息 |
| `scenario_slug` | `customer` | 场景来源 | 来源分析 | 可见 |
| `notes` | 分版本 | 客户备注可见 | 运营备注不可见 | 需要拆分 `customer_notes` / `operator_notes` |
| `source` | `operator` | 不展示 | 渠道分析 | 可用于统计，不展示给客户 |
| `status` | 分版本 | 展示客户友好状态 | 内部线索状态 | 客户侧只能展示“已提交 / 顾问确认中 / 已联系”等 |
| `created_at` | `customer` | 提交时间 | 运营排序 | 可见 |

## 服务项选择 `inquiry_service_selections`

| 字段 | 可见性 | 客户侧用途 | 运营侧用途 | 备注 |
|---|---|---|---|---|
| `id` | `server_only` | 不展示 | 关联查询 | 不直接暴露 |
| `inquiry_id` | `server_only` | 不展示 | 关联查询 | 不直接暴露 |
| `category` | `customer` | 服务模块 | 服务分析 | 如场地、晚宴、AV、物料 |
| `item_name` | `customer` | 服务项名称 | 服务分析 | 可见 |
| `unit` | `customer` | 计费单位 | 成本估算 | 可见 |
| `quantity` | `customer` | 数量 | 成本估算 | 可见 |
| `selection_status` | `customer` | 已选 / 可选 / 待确认 | 服务判断 | 客户侧不使用“风险”类标签 |
| `importance_level` | `operator` | 不展示 | 判断客户重视程度 | 客户侧可转译为“建议保留 / 可调整” |
| `unit_price_min` | `customer` | 预算区间 | 估算依据 | 只展示区间，不承诺最终价 |
| `unit_price_max` | `customer` | 预算区间 | 估算依据 | 同上 |
| `subtotal_min` | `customer` | 小计区间 | 估算依据 | 同上 |
| `subtotal_max` | `customer` | 小计区间 | 估算依据 | 同上 |
| `customer_preference` | `customer` | 客户选择 | 跟进参考 | 可见 |
| `tradeoff_note` | 分版本 | 客户版说明取舍 | 运营版说明风险 | 需要可见性字段 |
| `requires_human_confirmation` | `customer` | 需顾问确认 | 跟进重点 | 可见 |
| `visibility` | `server_only` | 控制输出 | 控制输出 | 值：`customer / internal` |
| `source_note` | `operator` | 不展示 | 数据来源 | MOCK / verified 说明 |

## 预算估算 `budget_estimates` 与 `budget_estimate_items`

| 字段 | 可见性 | 客户侧用途 | 运营侧用途 | 备注 |
|---|---|---|---|---|
| `estimate_title` | `customer` | 预算标题 | 预算版本 | 如“标准型预算结构估算” |
| `currency` | `customer` | 币种 | 报价准备 | 可见 |
| `estimate_type` | `operator` | 不展示 | 区分 AI / 运营估算 | 客户侧不需要知道 |
| `selected_package` | `customer` | 方案包 | 跟进判断 | 经济型 / 标准型 / 高配型 |
| `total_min` | `customer` | 总预算下限 | 估算依据 | 必须标注非正式报价 |
| `total_max` | `customer` | 总预算上限 | 估算依据 | 同上 |
| `needs_completeness_score` | `operator` | 不展示 | 完整度判断 | 客户侧只展示缺失项 |
| `budget_match_score` | `operator` | 不展示 | 预算匹配判断 | 客户侧可展示“预算覆盖度”但不用分数 |
| `service_fit_score` | `operator` | 不展示 | 服务可行性判断 | 客户侧可展示服务可行性说明 |
| `match_summary` | 分版本 | 客户版预算解释 | 运营版判断摘要 | 不共用原文 |
| `assumptions` | `customer` | 估算前提 | 跟进判断 | 可见，例如人数、天数、餐标 |
| `exclusions` | `customer` | 不包含事项 | 合同准备 | 可见 |
| `requires_human_confirmation` | `customer` | 需确认事项 | 跟进重点 | 可见 |
| `created_by` | `operator` | 不展示 | 追踪来源 | AI / operator |
| `budget_estimate_items.visibility` | `server_only` | 控制明细输出 | 控制明细输出 | 只返回 `customer` 明细 |

## AI 对话 `ai_conversations`

| 字段 | 可见性 | 客户侧用途 | 运营侧用途 | 备注 |
|---|---|---|---|---|
| `session_id` | `server_only` | 不展示 | 会话追踪 | 不直接暴露 |
| `channel` | `operator` | 不展示 | 渠道分析 | 如 web / miniapp / wechat |
| `entry_page` | `operator` | 不展示 | 来源分析 | 可用于运营 |
| `messages_summary` | 分版本 | 客户版只展示需求摘要 | 运营版可看对话摘要 | 不把原始运营判断给客户 |
| `extracted_requirements` | `customer` | 需求摘要 | 结构化线索 | 只输出客户已提供的信息 |
| `selected_package` | `customer` | 方案包 | 线索判断 | 可见 |
| `service_selection_summary` | `customer` | 服务项摘要 | 线索判断 | 可见 |
| `budget_match_summary` | 分版本 | 客户版预算解释 | 运营版预算判断 | 必须分版本 |
| `needs_completeness_score` | `operator` | 不展示 | 线索排序 | 内部 |
| `budget_match_score` | `operator` | 不展示 | 线索排序 | 内部 |
| `service_fit_score` | `operator` | 不展示 | 线索排序 | 内部 |
| `authenticity_score` | `operator` | 不展示 | 真实性判断 | 严禁客户侧展示 |
| `intent_score` | `operator` | 不展示 | 意向判断 | 严禁客户侧展示 |
| `lead_priority` | `operator` | 不展示 | 跟进优先级 | 严禁客户侧展示 |
| `score_reasons` | `operator` | 不展示 | 判断依据 | 严禁客户侧展示 |
| `risk_flags` | `operator` | 不展示 | 风险提醒 | 严禁客户侧展示 |
| `handoff_reason` | `operator` | 不展示 | 转人工原因 | 客户侧只展示“已提交顾问确认” |
| `handoff_status` | 分版本 | 客户友好状态 | 内部状态 | 客户侧文案要转译 |

## 运营提醒 `ai_operator_alerts`

该表全部属于 `operator`，不对客户侧开放。

| 字段 | 可见性 | 用途 |
|---|---|---|
| `lead_priority` | `operator` | 跟进排序 |
| `alert_title` | `operator` | 内部提醒标题 |
| `alert_summary` | `operator` | 内部摘要 |
| `attention_reason` | `operator` | 为什么需要关注 |
| `customer_match_summary` | `operator` | 给 Chris 的需求与预算匹配摘要 |
| `selected_package` | `operator` | 推荐方案包 |
| `budget_risks` | `operator` | 预算风险或预算缺口 |
| `missing_information` | `operator` | 需要人工补齐的信息 |
| `recommended_followup_focus` | `operator` | 跟进重点 |
| `recommended_next_action` | `operator` | 下一步动作 |
| `recommended_reply` | `operator` | 推荐开场白 |
| `notification_channel` | `operator` | 通知渠道 |
| `recipient` | `operator` | 接收人 |
| `delivery_status` | `operator` | 发送状态 |

## 客户侧 API 白名单

客户侧 AI 顾问状态接口只允许返回：

```ts
type CustomerAdvisorState = {
  inquiry: {
    company?: string;
    contactName?: string;
    phone?: string;
    whatsapp?: string;
    wechat?: string;
    email?: string;
    eventType?: string;
    eventStartDate?: string;
    eventEndDate?: string;
    attendeeCount?: number;
    budgetRange?: string;
    budgetPreference?: "经济型" | "标准型" | "高配型" | "自定义";
    selectedPackage?: "经济型" | "标准型" | "高配型" | "自定义";
    customerStatus: "draft" | "ready_to_submit" | "submitted" | "consultant_confirming";
  };
  serviceSelections: Array<{
    category: string;
    itemName: string;
    unit: string;
    quantity: number;
    selectionStatus: "required" | "selected" | "optional" | "removed" | "pending_confirm";
    unitPriceMin?: number;
    unitPriceMax?: number;
    subtotalMin?: number;
    subtotalMax?: number;
    customerPreference?: string;
    tradeoffNote?: string;
    requiresHumanConfirmation: boolean;
  }>;
  budgetEstimate?: {
    title: string;
    currency: "CNY" | "MYR";
    selectedPackage: "经济型" | "标准型" | "高配型" | "自定义";
    totalMin: number;
    totalMax: number;
    customerMatchSummary: string;
    assumptions: string[];
    exclusions: string[];
    requiresHumanConfirmation: string[];
  };
  nextActions: Array<{
    label: string;
    action: "continue_adjusting" | "submit_to_advisor" | "confirm_missing_info";
  }>;
};
```

客户侧响应中禁止出现以下字段名：

```text
authenticity_score
intent_score
lead_priority
score_reasons
risk_flags
attention_reason
budget_risks
recommended_followup_focus
recommended_next_action
recommended_reply
operator_notes
```

## 运营通知允许内容

运营通知可以包含：

- 客户基本信息。
- 活动关键信息。
- 推荐方案包。
- 客户已选 / 删除 / 待确认服务项。
- 预算估算区间和预算缺口。
- 真实性与意向判断。
- 风险标记。
- 建议跟进动作。
- 推荐开场白。

运营通知不能转发给客户，也不能截图给客户作为报价依据。

## UI 检查清单

客户侧 UI 上线前必须检查：

- 不出现 `authenticity_score`、`intent_score`、`lead_priority`。
- 不出现“高意向”“低意向”“真实性不足”“疑似探价”“垃圾线索”。
- 不出现“值得优先跟进”“建议 10 分钟内联系”等运营话术。
- 不出现 Chris / 运营内部推荐开场白。
- 预算超出时只表达“当前方案超出预算范围，可调整以下服务项”，不评价客户预算能力。
- 提交顾问状态只展示“待顾问确认正式报价 / 档期 / 合同条款”，不展示内部摘要。
