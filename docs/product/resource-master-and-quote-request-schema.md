# 资源主档与当次询价单定义

日期：2026-07-04
状态：已确认
适用范围：会出海内部资源管理、AI 顾问预算解释、Chris / 运营当次询价跟进

## 1. 定位

会出海系统中不应沉淀“长期固定成交价”，而应沉淀两层对象：

1. `resource_master`
   - 长期合作资源主档
   - 用于沉淀合作关系、参考价格区间、适用条件、动态影响因素和内部合作备注
2. `inquiry_quote_requests`
   - 当次询价单
   - 用于沉淀某个客户、某个活动、某个日期下的实时档期和本次价格确认结果

资源主档解决“我们长期有什么资源、通常大概什么范围、适合什么客户”。
当次询价单解决“这一次活动能不能做、这一次多少钱、这一次档期和条款是什么”。

## 2. 业务原则

1. 客户侧只能看到参考范围，不能看到内部协议价、底价、返点、谈判空间。
2. AI 顾问可以解释预算结构，但不能承诺实时档期和最终价格。
3. 正式报价、档期、付款和取消条款，必须来自当次询价单。
4. 上一次活动的临时报价，不能覆盖资源主档中的参考条件。
5. Phase 2 资源内容素材状态使用 `draft / needs_review / verified / public_ready`。没有经过服务端白名单放行、且未达到可客户回答条件的资源，不应进入正式客户答复。`published` 只属于未来 Phase 3 正式发布系统，不是 Phase 2 可操作状态。

## 3. 资源主档 `resource_master`

### 3.1 作用

记录会出海已建立合作关系或重点可调用的资源，包括：

- 场地 / 酒店会议厅
- 客房
- 晚宴 / 餐标
- 茶歇
- AV / 舞台 / LED
- 会议物料
- 接送机 / 用车
- 同传 / 翻译
- 摄影摄像
- 主持 / 执行 / 搭建类供应商

### 3.2 字段分组

#### A. 基础识别字段

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | uuid | 主键 |
| `resource_type` | enum | 资源类型，如 `venue / guest_room / banquet / transport / av / materials / translation / photo_video / staffing` |
| `resource_name` | string | 资源名称 |
| `supplier_name` | string | 供应方名称 |
| `city` | string | 城市 |
| `district` | string | 区域 |
| `address` | string | 地址，可为空 |
| `service_scope` | string[] | 可服务内容列表 |
| `suitable_scenarios` | string[] | 适合场景，如经销商大会、培训、发布会 |

#### B. 能力与适用字段

| 字段 | 类型 | 说明 |
|---|---|---|
| `capacity_or_spec` | string | 容量或规格说明 |
| `minimum_order_requirement` | string | 最低起订门槛 |
| `lead_time_requirement` | string | 提前预订或准备周期 |
| `service_availability_note` | string | 服务适用边界 |
| `customer_visible_summary` | text | 客户可见摘要 |

#### C. 参考商业条件字段

| 字段 | 类型 | 说明 |
|---|---|---|
| `reference_price_min` | decimal | 参考区间下限 |
| `reference_price_max` | decimal | 参考区间上限 |
| `currency` | enum | `CNY / MYR / SGD / USD` 等 |
| `pricing_unit` | string | 计价单位，如每桌、每晚、每天、每套 |
| `price_scope_note` | text | 对参考价格口径的说明 |
| `requires_quote_confirmation` | boolean | 是否必须二次询价，默认 `true` |

#### D. 动态浮动字段

| 字段 | 类型 | 说明 |
|---|---|---|
| `seasonality_rule` | text | 淡旺季规律 |
| `date_conflict_sensitivity` | enum | `low / medium / high`，表示档期敏感度 |
| `peak_period_note` | text | 旺季或特殊日期备注 |
| `quote_volatility_level` | enum | `low / medium / high`，表示报价波动程度 |

#### E. 内部合作字段

| 字段 | 类型 | 说明 |
|---|---|---|
| `strategic_cooperation_level` | enum | `prospect / normal / priority / strategic` |
| `agreement_status` | enum | `none / discussing / active / expired` |
| `agreement_effective_from` | date | 协议开始时间 |
| `agreement_effective_to` | date | 协议结束时间 |
| `internal_negotiation_note` | text | 谈判经验、内部口径 |
| `internal_risk_note` | text | 风险提示 |
| `internal_owner` | string | 资源负责人 |

#### F. 数据治理字段

| 字段 | 类型 | 说明 |
|---|---|---|
| `content_status` | enum | Phase 2 使用 `draft / needs_review / verified / public_ready`；`public_ready` 只表示内部内容生产准备就绪，不等于公开发布 |
| `source_note` | string | 来源说明 |
| `last_verified_at` | datetime | 最近确认时间 |
| `created_at` | datetime | 创建时间 |
| `updated_at` | datetime | 更新时间 |

### 3.3 客户侧输出原则

客户侧最多输出：

- 资源名称
- 城市 / 区域
- 容量 / 规格
- 参考价格区间
- 适用场景
- 公开服务说明
- “需顾问确认档期和正式报价”的提示

客户侧禁止输出：

- 供应商内部联系人
- 合作等级
- 协议状态细节
- 内部谈判备注
- 风险备注
- 任何底价、返点、保留价、议价空间

## 4. 当次询价单 `inquiry_quote_requests`

### 4.1 作用

记录某个客户针对某次活动发起的实时询价。
它代表“这一次”的档期和价格确认，不代表长期固定条件。

### 4.2 字段分组

#### A. 询价上下文字段

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | uuid | 主键 |
| `inquiry_id` | uuid | 关联客户线索 |
| `resource_master_id` | uuid | 关联资源主档 |
| `quote_request_type` | enum | `venue / room / banquet / transport / av / materials / bundle` |
| `event_type` | string | 活动类型 |
| `event_date_start` | date | 活动开始日期 |
| `event_date_end` | date | 活动结束日期 |
| `attendee_count` | integer | 人数 |
| `customer_budget_range` | string | 客户预算范围 |

#### B. 本次需求字段

| 字段 | 类型 | 说明 |
|---|---|---|
| `requested_services` | jsonb | 本次需要的服务项 |
| `requested_room_nights` | integer | 房晚数，可为空 |
| `requested_banquet_level` | string | 晚宴标准 |
| `requested_materials_scope` | text | 物料范围 |
| `requested_transport_scope` | text | 接送或用车范围 |
| `requested_special_notes` | text | 特殊说明 |

#### C. 本次询价结果字段

| 字段 | 类型 | 说明 |
|---|---|---|
| `availability_status` | enum | `unknown / available / limited / unavailable / waiting_reply` |
| `quoted_price_min` | decimal | 本次询价下限 |
| `quoted_price_max` | decimal | 本次询价上限 |
| `currency` | enum | 币种 |
| `seasonality_note` | text | 本次价格波动原因 |
| `conflict_note` | text | 档期冲突说明，内部可见 |
| `supplier_response_summary` | text | 供应方反馈摘要 |

#### D. 条款与状态字段

| 字段 | 类型 | 说明 |
|---|---|---|
| `payment_term_summary` | text | 付款条款摘要 |
| `cancellation_term_summary` | text | 取消条款摘要 |
| `quote_status` | enum | `draft / waiting_supplier / quoted / expired / converted / cancelled` |
| `quoted_by` | string | 询价执行人 |
| `quoted_at` | datetime | 询价确认时间 |
| `expires_at` | datetime | 本次报价失效时间 |

#### E. 对客与内部输出字段

| 字段 | 类型 | 说明 |
|---|---|---|
| `customer_visible_quote_summary` | text | 给客户看的本次询价摘要 |
| `operator_followup_note` | text | 给运营看的跟进备注 |
| `created_at` | datetime | 创建时间 |
| `updated_at` | datetime | 更新时间 |

### 4.3 客户侧输出原则

在没有拿到本次询价结果之前，客户侧只能看到：

- 参考价格区间
- 影响报价的主要因素
- 需要顾问确认的事项

在当次询价结果已经确认后，客户侧才可看到：

- 本次档期是否可用
- 本次询价范围
- 已确认的付款与取消条款摘要
- 本次报价有效性提示

### 4.4 内部输出原则

运营侧可看到：

- 供应方反馈原文摘要
- 档期冲突原因
- 谈判过程备注
- 本次价格是否优于参考价
- 是否值得进一步推进

## 5. AI 顾问使用规则

AI 顾问调用资源数据时必须遵守：

1. 若只有 `resource_master`，只能说“参考范围”。
2. 若无 `inquiry_quote_requests` 结果，不能说“正式报价”。
3. 若 `requires_quote_confirmation = true`，必须提示顾问确认。
4. AI 预算说明必须明确：
   - 这是预算结构估算或参考范围
   - 实时档期、正式价格、付款和取消条款需基于本次询价确认

## 6. MVP 内部实现建议

第一阶段不要求完整后台，但应至少预留：

1. mock 数据结构
2. 类型定义
3. 内部页面入口
4. 客户可见字段白名单边界

MVP 内部页面最小集合：

1. 资源列表页
2. 资源录入 / 编辑页
3. 当次询价单列表页
4. 当次询价单详情 / 更新页

补充说明：

- 只有资源主档列表页，不算完成“运营录入资源”的需求。
- 只有当次询价单列表页，不算完成“从线索发起询价并更新结果”的需求。
- 运营需要至少具备 `新建资源`、`编辑资源`、`从线索发起询价`、`更新询价状态 / 报价 / 档期` 这四个动作入口。

## 7. 与当前前台 MVP 的关系

当前前台独立站可以继续以客户咨询和 AI 顾问 mock 流程为主。
但从现在开始，任何涉及资源、预算、价格、档期的内部延展，都必须建立在本文件定义的两层对象上，而不是回到“固定价格库”的错误模型。
