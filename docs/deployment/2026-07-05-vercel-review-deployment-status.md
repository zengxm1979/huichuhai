# 会出海独立站部署准备状态

日期：2026-07-05

## 当前结论

当前阶段按“客户审核 / 临时预览”处理，不作为最终生产资产发布。默认开启 `noindex / nofollow`，避免临时域名被搜索引擎收录。

正式域名、正式 SEO 收录、真实询盘闭环和真实通知服务均未确认，不在本轮擅自开启。

## 临时子域名建议

基于 `ideaegg.com.cn` 体系，建议优先从以下 3 个中选择：

1. `review-hch.ideaegg.com.cn`
   - 含义清楚，明确是审核用途。
   - 不容易被客户误认为最终生产域名。
2. `hch-preview.ideaegg.com.cn`
   - 偏技术预览语义，适合内部和客户验收。
   - 与 Vercel preview 概念一致。
3. `huichuhai-review.ideaegg.com.cn`
   - 中文品牌拼音完整，便于非技术成员识别。
   - 域名较长，不建议作为最终生产域名。

推荐：`review-hch.ideaegg.com.cn`。

## Noindex / Nofollow 策略

已新增环境变量控制：

- `NEXT_PUBLIC_SITE_INDEXABLE=true`：允许收录，生成可用 robots 和 sitemap。
- 未设置或任何其他值：默认客户审核模式，metadata 为 `noindex,nofollow`，`robots.txt` 禁止抓取，`sitemap.xml` 返回空列表。

当前客户审核用途下，Vercel 环境变量应保持：

```text
NEXT_PUBLIC_SITE_INDEXABLE=false
```

或不设置该变量。

正式上线前必须重新确认：

- 是否已经切换到正式域名。
- 是否所有 MOCK 标识和真实服务边界已经确认。
- 是否允许搜索引擎收录。
- 是否设置 `NEXT_PUBLIC_SITE_URL=https://<正式域名>`。

## 仓库上线条件检查

当前仓库已具备 Vercel 最小上线条件：

- Next.js App Router 项目。
- `package.json` 已包含：
  - `npm run build`
  - `npm run start`
  - `npm run test`
- 构建输出为标准 Next.js 输出，无需自定义 output 目录。
- 当前不依赖真实 Supabase、AI API、短信、邮件或登录系统才能启动。
- `/ops/*` 页面已有 token 预览保护，缺省 token 为 `huichuhai-ops-preview`。
- 品牌运行资产已改为设计线程批准 PNG。

当前未发现：

- `vercel.json`
- `.vercel/`
- `.env.example`

## Vercel 接入清单

### 项目配置

- Framework Preset：Next.js
- Install Command：`npm install`
- Build Command：`npm run build`
- Output Directory：留空，由 Vercel 自动识别 Next.js
- Root Directory：仓库根目录
- Node.js：使用 Vercel 默认支持版本；如需锁定，后续再加 `.nvmrc` 或 `engines`

### 环境变量

客户审核 / 临时预览建议：

```text
NEXT_PUBLIC_SITE_INDEXABLE=false
OPS_PREVIEW_TOKEN=<审核用内部页面 token>
```

如绑定临时审核域名，可加：

```text
NEXT_PUBLIC_SITE_URL=https://review-hch.ideaegg.com.cn
```

但在 `NEXT_PUBLIC_SITE_INDEXABLE=false` 时，sitemap 仍不会输出正式 URL 列表。

未来真实服务接入再补：

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
```

本阶段不要求配置这些真实服务变量。

### Preview / Production 区别

- Preview Deployment：用于分支验收，保持 `NEXT_PUBLIC_SITE_INDEXABLE=false`。
- 临时客户审核域名：仍按审核站处理，保持 noindex。
- Production Deployment：只有在客户确认正式域名、真实信息、上线口径后，才考虑 `NEXT_PUBLIC_SITE_INDEXABLE=true`。

## 阿里云 DNS CNAME 准备

在 Vercel 项目中添加自定义域名后，Vercel 会给出 CNAME 目标。不要提前写死 DNS 记录。

待明确子域名后，在阿里云执行：

1. 进入对应域名 `ideaegg.com.cn` 的 DNS 解析控制台。
2. 新增解析记录。
3. 记录类型选择 `CNAME`。
4. 主机记录填写子域名前缀，例如：
   - `review-hch`
   - `hch-preview`
   - `huichuhai-review`
5. 记录值填写 Vercel 提供的 CNAME target。
6. TTL 使用默认值即可。
7. 保存后回到 Vercel 点击 Verify。
8. 等 HTTPS 证书自动签发完成后再交付客户访问。

## 上线后验收项

客户审核域名打通后，至少检查：

- 线上 URL 可访问。
- HTTPS 证书有效。
- 移动端首屏无明显遮挡、logo 正常。
- 首页 CTA 可打开 AI 轻对话。
- `/advisor` 初始咨询可走服务端 Agent route。
- `/inquiry` 表单可跳转成功页。
- favicon / app icon 使用批准资产。
- Header / footer / advisor / ops 使用批准 HCH 资产。
- `robots.txt` 在审核模式下为禁止抓取。
- 页面 metadata robots 为 `noindex,nofollow`。
- `/ops/*` 无 token 仍不可访问。

## 面向客户审核交付清单

交付客户前准备：

- 临时审核 URL。
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
  - 最终域名。
  - 是否允许搜索引擎收录。
  - 真实联系方式。
  - 是否接入真实询盘数据库、通知和 AI API。

## 阻塞项

当前不能直接完成正式发布的阻塞项：

- 未确认临时子域名最终选择。
- 未确认 Vercel 项目权限 / 是否已连接 GitHub 仓库。
- 未提供阿里云 DNS 操作权限或 CNAME 记录确认。
- 未确认客户审核站是否需要访问密码或仅 noindex 即可。
- 未确认正式上线是否允许收录。

## 下一步

1. 等设计线程确认批准 PNG 接入通过。
2. 由项目负责人确认临时子域名。
3. 连接 GitHub 到 Vercel，创建项目。
4. 设置客户审核环境变量，保持 noindex。
5. 绑定临时子域名并配置阿里云 CNAME。
6. 完成线上验收后，再准备正式域名迁移预案。
