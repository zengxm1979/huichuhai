# 会出海 Huichuhai

会出海是面向中国企业出海办会、会务活动和商务接待的服务平台。项目首站以马来西亚为起点，后续设计上预留扩展至东南亚其他国家和城市。

当前阶段以产品规划、信息架构、AI 办会顾问和高保真 UI 方向为主，尚未进入代码实现。

## 文档入口

- 原始 PRD：`docs/product/source/会出海-OutboundMICE-产品需求文档-v1.0.docx`
- 平台设计规格：`docs/superpowers/specs/2026-07-04-huichuhai-platform-design.md`
- AI 顾问面板高保真结构参考：`docs/design/high-fidelity/ai-advisor-plan-configurator-v1.png`
- AI 顾问面板 4 个关键状态稿：`docs/design/high-fidelity/ai-advisor-state-*.png`
- 文档说明：`docs/README.md`

## 当前关键结论

- 先建设独立站，后续复用 API 和数据结构建设微信小程序。
- 品牌主体是“会出海”，Chris 作为可信背书和人工顾问，不把网站做成个人 IP 主页。
- AI 办会顾问是核心前台能力，应能完成需求收集、预算解释、方案匹配、线索评分和人工提醒。
- “需求与预算匹配表”是 AI 顾问转人工前的关键产物，用于同时服务客户决策和 Chris / 运营跟进。
- AI 顾问面板当前选定“方案配置器”方向：客户可选择方案包、调整服务项、查看预算匹配，系统同步生成给 Chris 的摘要。
- 高保真视觉方向采用图多字精、商务可信、东南亚目的地感和企业服务感，不走旅游感或传统 SaaS 感。

## 建设顺序

1. 产品需求与设计规格确认。
2. AI 顾问面板和关键页面高保真 UI。
3. 独立站 MVP 实现。
4. AI 顾问能力接入。
5. 微信小程序复用建设。
