# 会出海独立站部署准备与审核站状态

日期：2026-07-05

## 当前结论

当前阶段只打通客户审核路径，不视为正式生产发布。

- 临时审核域名固定为：`hch.ideaegg.com.cn`
- 域名用途：客户审核临时域名
- 不把该域名写死到品牌文案或长期对外材料中
- 不开启搜索引擎收录
- 当前默认不加密码 / Basic Auth，避免增加客户审核摩擦

## 已完成部署进展

- 本地目录已通过 Vercel CLI 链接到 Vercel 项目：`ideaegg/huichuhai`
- Vercel 项目配置已确认：
  - Framework Preset：Next.js
  - Root Directory：`.`
- 环境变量已存在于 Production / Preview：
  - `NEXT_PUBLIC_SITE_INDEXABLE`
  - `NEXT_PUBLIC_SITE_URL`
  - `OPS_PREVIEW_TOKEN`
- 已使用当前本地 `codex/huichuhai-mvp-d` 代码执行 production deploy。
- Production deployment：`https://huichuhai-gh8mysb6n-ideaegg.vercel.app`
- Vercel alias：`https://huichuhai.vercel.app`
- Vercel 自定义域名已添加到项目：`hch.ideaegg.com.cn`
- DNS CNAME 已生效：`hch.ideaegg.com.cn -> 3c8709cf49652c4c.vercel-dns-017.com`
- Vercel verify 已通过：`status=ok`，`reason=configured_correctly`，`configuredBy=CNAME`，`project=huichuhai`
- 审核站正式域名已可访问：`https://hch.ideaegg.com.cn`

## 已完成线上验收

基于 `https://hch.ideaegg.com.cn`：

- 首页 HTTP 200，最终地址：`https://hch.ideaegg.com.cn/`
- 首页内容包含 `noindex` / `会出海` / `HCH`
- `/robots.txt` HTTP 200，内容为 `Disallow: /`
- `/sitemap.xml` HTTP 200，返回空 `urlset`
- `/ops/leads?token=hch-review-202607` HTTP 200
- 旧 token `huichuhai-ops-preview` HTTP 404
- 备用 Vercel alias `https://huichuhai.vercel.app` 保留为排障入口，不作为客户主审核 URL

## 已确定部署决策

### 域名

- 临时审核域名：`hch.ideaegg.com.cn`
- 正式生产域名：待客户审核后另行确认

### GitHub -> Vercel 分支策略

- 当前不要求先合并 `main`
- 审核站部署来源：`codex/huichuhai-mvp-d`
- Vercel Production Branch 临时设置为：`codex/huichuhai-mvp-d`
- 本次 CLI production deploy 已使用当前本地代码完成，绕过了 `main` 的失败部署
- 仍需在 Vercel UI 中确认 Production Branch 是否已切为 `codex/huichuhai-mvp-d`，这是当前唯一剩余运维风险
- 客户审核通过后，再决定是否切回 `main` 或正式生产分支

### 审核站访问策略

- 默认：`noindex + nofollow + robots Disallow + 空 sitemap`
- 当前不默认加密码 / Basic Auth
- 如客户明确要求限制访问，再追加访问保护

### 环境变量默认值

```text
NEXT_PUBLIC_SITE_INDEXABLE=false
NEXT_PUBLIC_SITE_URL=https://hch.ideaegg.com.cn
OPS_PREVIEW_TOKEN=hch-review-202607
```

`OPS_PREVIEW_TOKEN` 必须通过环境变量注入。当前代码仅保留 `hch-review-202607` 作为审核阶段 fallback，不再使用旧值。

## Noindex / Nofollow 实现

已新增环境变量控制：

- `NEXT_PUBLIC_SITE_INDEXABLE=true`：允许收录，生成可用 robots 和 sitemap。
- 未设置或任何其他值：审核模式，metadata 为 `noindex,nofollow`，`robots.txt` 禁止抓取，`sitemap.xml` 返回空列表。

当前审核站必须保持：

```text
NEXT_PUBLIC_SITE_INDEXABLE=false
```

正式上线前必须重新确认：

- 是否已经切换到正式域名。
- 是否所有 MOCK 标识和真实服务边界已经确认。
- 是否允许搜索引擎收录。
- 是否设置正式 `NEXT_PUBLIC_SITE_URL`。

## 仓库上线条件检查

当前仓库已具备 Vercel 最小上线条件：

- Next.js App Router 项目
- `npm install`
- `npm run build`
- 标准 Next.js 输出，无需自定义 output 目录
- 当前不依赖真实 Supabase、AI API、短信、邮件或登录系统即可启动
- `/ops/*` 页面已有 token 预览保护
- 品牌运行资产已改为设计线程批准 PNG
- 已新增 `robots.ts` / `sitemap.ts`
- 已新增 `.env.example`

当前不需要：

- `vercel.json`：暂不需要
- `.vercel/`：由 Vercel CLI 本地生成，已加入 `.gitignore`，不提交仓库

## Vercel 接入清单

### 项目配置

- Project：`ideaegg/huichuhai`
- Framework Preset：Next.js
- Root Directory：仓库根目录 `.`
- Install Command：`npm install`
- Build Command：`npm run build`
- Output Directory：留空，由 Vercel 自动识别 Next.js
- Production Branch：`codex/huichuhai-mvp-d`，仍需在 Vercel UI 最终确认

### 环境变量

客户审核站：

```text
NEXT_PUBLIC_SITE_INDEXABLE=false
NEXT_PUBLIC_SITE_URL=https://hch.ideaegg.com.cn
OPS_PREVIEW_TOKEN=hch-review-202607
```

未来真实服务接入再补：

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
```

本阶段不要求配置这些真实服务变量。

### Preview / Production 区别

- Vercel Preview Deployment：用于分支检查，保持 noindex。
- Vercel Production Deployment：本阶段也只是审核站，仍保持 noindex。
- 正式生产发布：只有在正式域名、真实信息和上线口径确认后，才考虑 `NEXT_PUBLIC_SITE_INDEXABLE=true`。

## 阿里云 DNS CNAME 记录

Vercel 项目中已添加自定义域名：

```text
hch.ideaegg.com.cn
```

当前已生效 CNAME：

```text
类型：CNAME
主机记录：hch
记录值：3c8709cf49652c4c.vercel-dns-017.com.
```

备选 A 记录，仅在 CNAME 方案不可用时使用：

```text
类型：A
主机记录：hch
记录值：76.76.21.21
```

Vercel verify 已执行并通过：

```text
status=ok
reason=configured_correctly
configuredBy=CNAME
project=huichuhai
```

## 正式审核域名验收结果

已基于 `https://hch.ideaegg.com.cn` 验收：

- 首页 HTTP 200
- 最终地址为 `https://hch.ideaegg.com.cn/`
- 首页 metadata 仍为 `noindex,nofollow`
- `/robots.txt` 返回 `Disallow: /`
- `/sitemap.xml` 返回空 `urlset`
- 新 token 可访问 `/ops/leads`
- 旧 token 返回 404

## 已可直接执行项

- 在 Vercel UI 中确认 Production Branch 是否为 `codex/huichuhai-mvp-d`。

## 需权限后执行项

- Vercel 项目 `ideaegg/huichuhai` 管理权限。
- Vercel UI 中 Production Branch 设置确认权限。

## Blockers

当前 DNS blocker 已解除。唯一剩余运维风险：

1. Vercel UI 中 Production Branch 是否已切为 `codex/huichuhai-mvp-d` 尚待确认。本次生产部署是通过 CLI 从当前分支代码完成，已经绕过 `main` 的失败部署。

非本轮 blocker，但正式上线前仍需确认：

- 正式域名
- 正式 SEO 收录策略
- 真实服务接入

## 上线后验收项

审核站打通后至少检查：

- `https://hch.ideaegg.com.cn` 可访问。
- HTTPS 证书有效。
- 移动端首屏可读，logo 正常。
- Header / footer / advisor / inquiry / ops 使用批准 PNG 资产。
- favicon / app icon 使用批准 PNG 资产。
- 首页 CTA 可打开 AI 轻对话。
- `/advisor` 初始咨询可走服务端 Agent route。
- `/inquiry` 表单可跳转成功页。
- `/robots.txt` 为 `Disallow: /`。
- 页面 metadata robots 为 `noindex,nofollow`。
- `/sitemap.xml` 为空。
- `/ops/*` 无 token 仍不可访问。
- `/ops/*?token=hch-review-202607` 可用于内部审核。

## 面向客户审核交付清单

交付客户前准备：

- 审核 URL：`https://hch.ideaegg.com.cn`
- 备用 Vercel URL：`https://huichuhai.vercel.app`
- 审核说明：当前为客户审核站，非最终生产域名。
- 页面清单：
  - `/`
  - `/advisor`
  - `/inquiry`
  - `/inquiry/success`
- 已知 MOCK 内容说明：
  - 价格与预算为参考范围。
  - 场地、案例、电话、联系人未作为真实最终信息承诺。
  - AI 回复为 Phase 1 受控 Agent / MOCK 逻辑。
- 客户需确认：
  - 正式域名。
  - 是否允许搜索引擎收录。
  - 真实联系方式。
  - 是否接入真实询盘数据库、通知和 AI API。

## 正式迁移预案边界

正式域名到位后再执行：

1. 切换 `NEXT_PUBLIC_SITE_URL` 到正式域名。
2. 确认是否设置 `NEXT_PUBLIC_SITE_INDEXABLE=true`。
3. 重新生成 robots / sitemap 行为。
4. 检查 MOCK 内容和正式联系方式。
5. 决定 Production Branch 是否切回 `main` 或正式生产分支。
