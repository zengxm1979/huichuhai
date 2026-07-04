# 会出海独立站部署准备状态

日期：2026-07-05

## 当前结论

当前阶段只打通客户审核路径，不视为正式生产发布。

- 临时审核域名固定为：`hch.ideaegg.com.cn`
- 域名用途：客户审核临时域名
- 不把该域名写死到品牌文案或长期对外材料中
- 不开启搜索引擎收录
- 当前默认不加密码 / Basic Auth，避免增加客户审核摩擦

## 已确定部署决策

### 域名

- 临时审核域名：`hch.ideaegg.com.cn`
- 正式生产域名：待客户审核后另行确认

### GitHub -> Vercel 分支策略

- 当前不要求先合并 `main`
- 审核站部署来源：`codex/huichuhai-mvp-d`
- Vercel Production Branch 临时设置为：`codex/huichuhai-mvp-d`
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

当前未配置：

- `vercel.json`：暂不需要
- `.vercel/`：需 Vercel 项目连接后生成或由 Vercel 托管

## Vercel 接入清单

### 项目配置

- Framework Preset：Next.js
- Root Directory：仓库根目录
- Install Command：`npm install`
- Build Command：`npm run build`
- Output Directory：留空，由 Vercel 自动识别 Next.js
- Production Branch：`codex/huichuhai-mvp-d`

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

## 阿里云 DNS CNAME 准备

Vercel 项目中添加自定义域名：

```text
hch.ideaegg.com.cn
```

Vercel 会给出 CNAME target。拿到 target 后，在阿里云执行：

1. 进入 `ideaegg.com.cn` 的 DNS 解析控制台。
2. 新增解析记录。
3. 记录类型选择 `CNAME`。
4. 主机记录填写：`hch`
5. 记录值填写 Vercel 提供的 CNAME target。
6. TTL 使用默认值。
7. 保存后回到 Vercel 点击 Verify。
8. 等 HTTPS 证书自动签发完成后再交付客户访问。

不要提前写死或猜测 CNAME target。

## 已可直接执行项

- 使用当前分支 `codex/huichuhai-mvp-d` 创建 Vercel 项目。
- 设置 Vercel Production Branch 为 `codex/huichuhai-mvp-d`。
- 设置审核环境变量。
- 在 Vercel 添加自定义域名 `hch.ideaegg.com.cn`。
- 拿到 Vercel CNAME target 后交给 DNS 权限持有人配置。
- 用线上 URL 执行审核验收清单。

## 需权限后执行项

- Vercel 项目创建 / 管理权限。
- GitHub 仓库 `zengxm1979/huichuhai` 导入权限。
- `ideaegg.com.cn` 阿里云 DNS 权限。
- Vercel 提供 CNAME target 后的 DNS 记录配置。

## Blockers

1. 谁持有 Vercel 项目创建 / 管理权限。
2. 谁持有 `ideaegg.com.cn` 的阿里云 DNS 权限。
3. Vercel 账号是否可直接导入 GitHub 仓库 `zengxm1979/huichuhai`。

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
