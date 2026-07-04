# Huichuhai MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first runnable independent-site MVP for 会出海, including core public pages, AI advisor mock flow, inquiry capture, field visibility boundaries, and a lightweight operator handoff path.

**Architecture:** Start with a Next.js App Router application using static/mock data and explicit customer/internal data contracts. The first coding milestone is a frontend MVP with deterministic mock state; Supabase, AI, and notification integrations are added behind service boundaries after UI and field visibility are proven.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, lucide-react, Vitest, Testing Library, Playwright, Supabase Postgres, Resend or webhook-based notifications.

---

## Source Documents

- Product spec: `docs/superpowers/specs/2026-07-04-huichuhai-platform-design.md`
- Field matrix: `docs/product/customer-internal-field-matrix.md`
- Original PRD: `docs/product/source/会出海-OutboundMICE-产品需求文档-v1.0.docx`
- Selected AI advisor visual direction: `docs/design/high-fidelity/ai-advisor-plan-configurator-v1.png`
- AI advisor state mocks: `docs/design/high-fidelity/ai-advisor-state-*.png`

## Planned File Structure

```text
app/
  layout.tsx
  page.tsx
  advisor/page.tsx
  inquiry/page.tsx
  inquiry/success/page.tsx
  venues/[slug]/page.tsx
  solutions/[slug]/page.tsx
  ops/leads/page.tsx
components/
  advisor/AdvisorPanel.tsx
  advisor/AdvisorStateHeader.tsx
  advisor/PackageSelector.tsx
  advisor/ServiceSelectionTable.tsx
  advisor/BudgetMatchPanel.tsx
  advisor/SubmitToAdvisorPanel.tsx
  advisor/customerVisibility.ts
  layout/SiteHeader.tsx
  layout/SiteFooter.tsx
  marketing/HomeHero.tsx
  marketing/ScenarioGrid.tsx
  inquiry/InquiryForm.tsx
  ops/LeadSummaryTable.tsx
content/
  scenarios.ts
  venues.ts
  faqs.ts
  mockInquiries.ts
lib/
  advisor/types.ts
  advisor/mockAdvisorFlow.ts
  advisor/customerMappers.ts
  advisor/operatorMappers.ts
  constants/packageTiers.ts
  validation/inquirySchema.ts
  supabase/client.ts
  supabase/server.ts
  notifications/operatorNotifier.ts
tests/
  advisor/customerVisibility.test.ts
  advisor/packageTiers.test.ts
  inquiry/inquirySchema.test.ts
  e2e/advisor-customer-visibility.spec.ts
supabase/
  migrations/001_initial_schema.sql
  seed/venues_seed.json
  seed/faqs_seed.json
  seed/scenarios_seed.json
```

## Package Tier Names

Use these exact customer-facing names:

```ts
export const PACKAGE_TIERS = [
  {
    id: "economy",
    label: "经济型",
    description: "保留核心会务需求，控制非必要搭建、物料和接待成本。",
  },
  {
    id: "standard",
    label: "标准型",
    description: "配置完整，覆盖多数商务会议、经销商大会和企业活动的常规需求。",
  },
  {
    id: "premium",
    label: "高配型",
    description: "增加品牌呈现、现场体验和接待配置，适合重要客户、发布会和高规格活动。",
  },
] as const;
```

---

### Task 1: Bootstrap Next.js App

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.mjs`
- Create: `postcss.config.mjs`
- Create: `tailwind.config.ts`
- Create: `app/layout.tsx`
- Create: `app/globals.css`
- Create: `app/page.tsx`

- [ ] **Step 1: Create the Next.js project files**

Create `package.json`:

```json
{
  "name": "huichuhai",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest",
    "e2e": "playwright test"
  },
  "dependencies": {
    "@hookform/resolvers": "^3.9.0",
    "@supabase/ssr": "^0.5.2",
    "@supabase/supabase-js": "^2.45.4",
    "clsx": "^2.1.1",
    "lucide-react": "^0.468.0",
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-hook-form": "^7.53.0",
    "tailwind-merge": "^2.5.4",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@playwright/test": "^1.48.2",
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.0.1",
    "@types/node": "^22.9.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "autoprefixer": "^10.4.20",
    "eslint": "^9.15.0",
    "eslint-config-next": "^15.0.0",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.15",
    "typescript": "^5.6.3",
    "vitest": "^2.1.5"
  }
}
```

- [ ] **Step 2: Install dependencies**

Run:

```bash
npm install
```

Expected: dependencies install and `package-lock.json` is created.

- [ ] **Step 3: Add TypeScript and Next config**

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "es2022"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

Create `next.config.mjs`:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
```

- [ ] **Step 4: Add Tailwind config**

Create `postcss.config.mjs`:

```js
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

export default config;
```

Create `tailwind.config.ts`:

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#061D32",
        ocean: "#0B3A4B",
        teal: "#1AA6A6",
        gold: "#D9A24A",
        coral: "#E06F4F",
        cloud: "#F6F3EE",
        line: "#D9E2E7",
      },
      borderRadius: {
        ui: "8px",
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 5: Create base layout and smoke page**

Create `app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  color-scheme: light;
}

body {
  margin: 0;
  background: #f6f3ee;
  color: #061d32;
}
```

Create `app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "会出海",
  description: "帮中国企业在东南亚，把一场会办得更省心。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
```

Create `app/page.tsx`:

```tsx
export default function HomePage() {
  return (
    <main className="min-h-screen bg-cloud px-8 py-10">
      <h1 className="text-4xl font-semibold text-ink">会出海</h1>
      <p className="mt-4 max-w-2xl text-lg text-ocean">
        帮中国企业在东南亚，把一场会办得更省心。
      </p>
    </main>
  );
}
```

- [ ] **Step 6: Verify build**

Run:

```bash
npm run build
```

Expected: Next.js production build completes with exit code 0.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json tsconfig.json next.config.mjs postcss.config.mjs tailwind.config.ts app
git commit -m "feat: bootstrap next app"
```

---

### Task 2: Add Package Tier Constants And Visibility Guard

**Files:**
- Create: `lib/constants/packageTiers.ts`
- Create: `lib/advisor/types.ts`
- Create: `components/advisor/customerVisibility.ts`
- Create: `tests/advisor/packageTiers.test.ts`
- Create: `tests/advisor/customerVisibility.test.ts`

- [ ] **Step 1: Add package tier constants**

Create `lib/constants/packageTiers.ts`:

```ts
export const PACKAGE_TIERS = [
  {
    id: "economy",
    label: "经济型",
    description: "保留核心会务需求，控制非必要搭建、物料和接待成本。",
  },
  {
    id: "standard",
    label: "标准型",
    description: "配置完整，覆盖多数商务会议、经销商大会和企业活动的常规需求。",
  },
  {
    id: "premium",
    label: "高配型",
    description: "增加品牌呈现、现场体验和接待配置，适合重要客户、发布会和高规格活动。",
  },
] as const;

export type PackageTierId = (typeof PACKAGE_TIERS)[number]["id"];
export type PackageTierLabel = (typeof PACKAGE_TIERS)[number]["label"];
```

- [ ] **Step 2: Add customer and internal advisor types**

Create `lib/advisor/types.ts`:

```ts
import type { PackageTierLabel } from "@/lib/constants/packageTiers";

export type CustomerStatus =
  | "draft"
  | "ready_to_submit"
  | "submitted"
  | "consultant_confirming";

export type ServiceSelectionStatus =
  | "required"
  | "selected"
  | "optional"
  | "removed"
  | "pending_confirm";

export type CustomerAdvisorState = {
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
    budgetPreference?: PackageTierLabel | "自定义";
    selectedPackage?: PackageTierLabel | "自定义";
    customerStatus: CustomerStatus;
  };
  serviceSelections: Array<{
    category: string;
    itemName: string;
    unit: string;
    quantity: number;
    selectionStatus: ServiceSelectionStatus;
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
    selectedPackage: PackageTierLabel | "自定义";
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

export type InternalAdvisorState = CustomerAdvisorState & {
  internal: {
    authenticityScore: number;
    intentScore: number;
    leadPriority: "urgent" | "high" | "medium" | "low";
    scoreReasons: string[];
    riskFlags: string[];
    recommendedFollowupFocus: string;
    recommendedNextAction: string;
    recommendedReply: string;
  };
};
```

- [ ] **Step 3: Add customer visibility guard**

Create `components/advisor/customerVisibility.ts`:

```ts
const FORBIDDEN_CUSTOMER_KEYS = [
  "authenticity_score",
  "authenticityScore",
  "intent_score",
  "intentScore",
  "lead_priority",
  "leadPriority",
  "score_reasons",
  "scoreReasons",
  "risk_flags",
  "riskFlags",
  "attention_reason",
  "attentionReason",
  "budget_risks",
  "budgetRisks",
  "recommended_followup_focus",
  "recommendedFollowupFocus",
  "recommended_next_action",
  "recommendedNextAction",
  "recommended_reply",
  "recommendedReply",
  "operator_notes",
  "operatorNotes",
] as const;

export function assertCustomerSafePayload(payload: unknown): void {
  const seen = new Set<unknown>();

  function visit(value: unknown, path: string): void {
    if (!value || typeof value !== "object") return;
    if (seen.has(value)) return;
    seen.add(value);

    for (const [key, child] of Object.entries(value)) {
      if (FORBIDDEN_CUSTOMER_KEYS.includes(key as (typeof FORBIDDEN_CUSTOMER_KEYS)[number])) {
        throw new Error(`Forbidden customer field at ${path ? `${path}.` : ""}${key}`);
      }
      visit(child, path ? `${path}.${key}` : key);
    }
  }

  visit(payload, "");
}
```

- [ ] **Step 4: Add tests**

Create `tests/advisor/packageTiers.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { PACKAGE_TIERS } from "@/lib/constants/packageTiers";

describe("PACKAGE_TIERS", () => {
  it("uses the approved customer-facing labels", () => {
    expect(PACKAGE_TIERS.map((tier) => tier.label)).toEqual([
      "经济型",
      "标准型",
      "高配型",
    ]);
  });
});
```

Create `tests/advisor/customerVisibility.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { assertCustomerSafePayload } from "@/components/advisor/customerVisibility";

describe("assertCustomerSafePayload", () => {
  it("allows customer-visible advisor data", () => {
    expect(() =>
      assertCustomerSafePayload({
        inquiry: { selectedPackage: "标准型" },
        budgetEstimate: { customerMatchSummary: "当前方案基本覆盖预算范围。" },
      }),
    ).not.toThrow();
  });

  it("blocks internal scoring fields", () => {
    expect(() =>
      assertCustomerSafePayload({
        inquiry: { selectedPackage: "标准型" },
        internal: { intentScore: 5 },
      }),
    ).toThrow("Forbidden customer field");
  });

  it("blocks nested operator recommendation fields", () => {
    expect(() =>
      assertCustomerSafePayload({
        next: { recommendedReply: "10 分钟内联系客户。" },
      }),
    ).toThrow("Forbidden customer field");
  });
});
```

- [ ] **Step 5: Run tests**

Run:

```bash
npm run test -- tests/advisor/packageTiers.test.ts tests/advisor/customerVisibility.test.ts
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add lib/constants/packageTiers.ts lib/advisor/types.ts components/advisor/customerVisibility.ts tests/advisor
git commit -m "feat: add advisor data contracts"
```

---

### Task 3: Build AI Advisor Mock Flow

**Files:**
- Create: `content/mockInquiries.ts`
- Create: `lib/advisor/mockAdvisorFlow.ts`
- Create: `components/advisor/AdvisorPanel.tsx`
- Create: `components/advisor/AdvisorStateHeader.tsx`
- Create: `components/advisor/PackageSelector.tsx`
- Create: `components/advisor/ServiceSelectionTable.tsx`
- Create: `components/advisor/BudgetMatchPanel.tsx`
- Create: `components/advisor/SubmitToAdvisorPanel.tsx`
- Create: `app/advisor/page.tsx`

- [ ] **Step 1: Add mock advisor states**

Create `content/mockInquiries.ts`:

```ts
import type { CustomerAdvisorState } from "@/lib/advisor/types";

export const advisorStates: Record<
  "initial" | "configuration" | "budgetMismatch" | "submit",
  CustomerAdvisorState
> = {
  initial: {
    inquiry: { customerStatus: "draft" },
    serviceSelections: [],
    nextActions: [{ label: "生成初步方案", action: "confirm_missing_info" }],
  },
  configuration: {
    inquiry: {
      eventType: "经销商大会",
      attendeeCount: 120,
      budgetRange: "¥80-100万",
      selectedPackage: "标准型",
      customerStatus: "draft",
    },
    serviceSelections: [
      {
        category: "场地",
        itemName: "酒店会议厅",
        unit: "天",
        quantity: 1,
        selectionStatus: "selected",
        unitPriceMin: 120000,
        unitPriceMax: 180000,
        subtotalMin: 120000,
        subtotalMax: 180000,
        tradeoffNote: "核心项目，建议保留。",
        requiresHumanConfirmation: true,
      },
      {
        category: "会议物料",
        itemName: "胸牌、桌牌、指示牌、背景板",
        unit: "批",
        quantity: 1,
        selectionStatus: "selected",
        unitPriceMin: 15000,
        unitPriceMax: 30000,
        subtotalMin: 15000,
        subtotalMax: 30000,
        tradeoffNote: "可按设计复杂度调整。",
        requiresHumanConfirmation: true,
      },
    ],
    budgetEstimate: {
      title: "标准型预算结构估算",
      currency: "CNY",
      selectedPackage: "标准型",
      totalMin: 900000,
      totalMax: 1100000,
      customerMatchSummary: "当前方案基本覆盖预算范围，部分酒店房源和物料制作需顾问确认。",
      assumptions: ["120 人", "吉隆坡", "会议 + 晚宴", "含基础会议物料"],
      exclusions: ["正式酒店档期", "最终合同条款", "加急制作费用"],
      requiresHumanConfirmation: ["酒店档期", "晚宴菜单", "物料制作周期"],
    },
    nextActions: [
      { label: "提交给顾问确认", action: "submit_to_advisor" },
      { label: "继续调整方案", action: "continue_adjusting" },
    ],
  },
  budgetMismatch: {
    inquiry: {
      eventType: "经销商大会",
      attendeeCount: 120,
      budgetRange: "¥60-70万",
      selectedPackage: "标准型",
      customerStatus: "draft",
    },
    serviceSelections: [
      {
        category: "晚宴",
        itemName: "中式围桌晚宴",
        unit: "人",
        quantity: 120,
        selectionStatus: "selected",
        unitPriceMin: 180000,
        unitPriceMax: 280000,
        subtotalMin: 180000,
        subtotalMax: 280000,
        tradeoffNote: "可调整餐标或改为简餐形式。",
        requiresHumanConfirmation: true,
      },
      {
        category: "AV/舞台",
        itemName: "LED 屏 + 灯光 + 音响",
        unit: "套",
        quantity: 1,
        selectionStatus: "optional",
        unitPriceMin: 80000,
        unitPriceMax: 150000,
        subtotalMin: 80000,
        subtotalMax: 150000,
        tradeoffNote: "可改为基础 AV 配置。",
        requiresHumanConfirmation: true,
      },
    ],
    budgetEstimate: {
      title: "预算调整建议",
      currency: "CNY",
      selectedPackage: "标准型",
      totalMin: 800000,
      totalMax: 920000,
      customerMatchSummary: "当前方案超出预算范围，可优先调整晚宴、AV 和部分物料配置。",
      assumptions: ["120 人", "预算 ¥60-70万", "标准型配置"],
      exclusions: ["正式报价", "酒店档期", "合同条款"],
      requiresHumanConfirmation: ["晚宴餐标", "AV 配置", "物料范围"],
    },
    nextActions: [
      { label: "应用经济型建议", action: "continue_adjusting" },
      { label: "继续手动调整", action: "continue_adjusting" },
      { label: "提交顾问确认", action: "submit_to_advisor" },
    ],
  },
  submit: {
    inquiry: {
      company: "示例公司 [MOCK]",
      contactName: "张伟 [MOCK]",
      whatsapp: "+86 138 1234 5678 [MOCK]",
      eventType: "经销商大会",
      attendeeCount: 120,
      budgetRange: "¥80-100万",
      selectedPackage: "标准型",
      customerStatus: "ready_to_submit",
    },
    serviceSelections: [],
    budgetEstimate: {
      title: "提交前预算结构估算",
      currency: "CNY",
      selectedPackage: "标准型",
      totalMin: 900000,
      totalMax: 1100000,
      customerMatchSummary: "信息已整理，可提交顾问确认正式报价、档期和合同条款。",
      assumptions: ["120 人", "经销商大会", "吉隆坡", "标准型"],
      exclusions: ["正式报价", "合同条款", "供应商最终确认"],
      requiresHumanConfirmation: ["酒店档期", "晚宴菜单", "同传设备", "合同条款"],
    },
    nextActions: [
      { label: "提交给顾问确认", action: "submit_to_advisor" },
      { label: "继续调整方案", action: "continue_adjusting" },
    ],
  },
};
```

- [ ] **Step 2: Add mock flow selector**

Create `lib/advisor/mockAdvisorFlow.ts`:

```ts
import { advisorStates } from "@/content/mockInquiries";

export type AdvisorMockState = keyof typeof advisorStates;

export function getAdvisorState(state: AdvisorMockState) {
  return advisorStates[state];
}
```

- [ ] **Step 3: Build advisor page shell**

Create `app/advisor/page.tsx`:

```tsx
import { AdvisorPanel } from "@/components/advisor/AdvisorPanel";
import { getAdvisorState } from "@/lib/advisor/mockAdvisorFlow";

export default function AdvisorPage() {
  return <AdvisorPanel state={getAdvisorState("configuration")} />;
}
```

- [ ] **Step 4: Build `AdvisorPanel`**

Create `components/advisor/AdvisorPanel.tsx`:

```tsx
import type { CustomerAdvisorState } from "@/lib/advisor/types";
import { assertCustomerSafePayload } from "./customerVisibility";
import { AdvisorStateHeader } from "./AdvisorStateHeader";
import { PackageSelector } from "./PackageSelector";
import { ServiceSelectionTable } from "./ServiceSelectionTable";
import { BudgetMatchPanel } from "./BudgetMatchPanel";
import { SubmitToAdvisorPanel } from "./SubmitToAdvisorPanel";

export function AdvisorPanel({ state }: { state: CustomerAdvisorState }) {
  assertCustomerSafePayload(state);

  return (
    <main className="min-h-screen bg-cloud text-ink">
      <AdvisorStateHeader inquiry={state.inquiry} />
      <section className="grid grid-cols-[1fr_360px] gap-0">
        <div className="px-8 py-6">
          <div className="mb-6 h-44 rounded-ui bg-ocean text-white">
            <div className="flex h-full items-end p-6">
              <div>
                <p className="text-sm text-white/75">吉隆坡 · 商务会议方案</p>
                <h1 className="mt-2 text-3xl font-semibold">AI 办会顾问</h1>
              </div>
            </div>
          </div>
          <PackageSelector selected={state.inquiry.selectedPackage ?? "标准型"} />
          <ServiceSelectionTable selections={state.serviceSelections} />
        </div>
        <aside className="min-h-screen bg-ink p-6 text-white">
          <BudgetMatchPanel estimate={state.budgetEstimate} />
          <SubmitToAdvisorPanel actions={state.nextActions} />
        </aside>
      </section>
    </main>
  );
}
```

- [ ] **Step 5: Build child components**

Create `components/advisor/AdvisorStateHeader.tsx`:

```tsx
import type { CustomerAdvisorState } from "@/lib/advisor/types";

export function AdvisorStateHeader({ inquiry }: { inquiry: CustomerAdvisorState["inquiry"] }) {
  return (
    <header className="flex items-center justify-between bg-ink px-8 py-4 text-white">
      <div className="flex items-center gap-4">
        <span className="text-xl font-semibold">会出海</span>
        <span className="h-6 w-px bg-white/25" />
        <span>AI 办会顾问</span>
      </div>
      <div className="flex gap-6 text-sm text-white/85">
        <span>活动类型：{inquiry.eventType ?? "暂未确定"}</span>
        <span>预计人数：{inquiry.attendeeCount ? `${inquiry.attendeeCount} 人` : "暂未确定"}</span>
        <span>预算范围：{inquiry.budgetRange ?? "暂未确定"}</span>
      </div>
    </header>
  );
}
```

Create `components/advisor/PackageSelector.tsx`:

```tsx
import { PACKAGE_TIERS, type PackageTierLabel } from "@/lib/constants/packageTiers";

export function PackageSelector({ selected }: { selected: PackageTierLabel | "自定义" }) {
  return (
    <section className="mb-6">
      <h2 className="text-xl font-semibold">选择方案包</h2>
      <div className="mt-4 grid grid-cols-3 gap-3">
        {PACKAGE_TIERS.map((tier) => (
          <button
            key={tier.id}
            className={[
              "rounded-ui border p-4 text-left",
              selected === tier.label ? "border-teal bg-ocean text-white" : "border-line bg-white",
            ].join(" ")}
          >
            <div className="font-semibold">{tier.label}</div>
            <p className="mt-2 text-sm opacity-80">{tier.description}</p>
          </button>
        ))}
      </div>
    </section>
  );
}
```

Create `components/advisor/ServiceSelectionTable.tsx`:

```tsx
import type { CustomerAdvisorState } from "@/lib/advisor/types";

export function ServiceSelectionTable({
  selections,
}: {
  selections: CustomerAdvisorState["serviceSelections"];
}) {
  return (
    <section className="rounded-ui border border-line bg-white">
      <div className="border-b border-line px-4 py-3">
        <h2 className="font-semibold">服务项配置</h2>
      </div>
      <div className="divide-y divide-line">
        {selections.map((item) => (
          <div key={`${item.category}-${item.itemName}`} className="grid grid-cols-5 gap-4 px-4 py-3 text-sm">
            <span className="font-medium">{item.category}</span>
            <span>{item.itemName}</span>
            <span>{item.quantity} {item.unit}</span>
            <span>
              {item.subtotalMin && item.subtotalMax
                ? `¥${item.subtotalMin.toLocaleString()} - ¥${item.subtotalMax.toLocaleString()}`
                : "待估算"}
            </span>
            <span className="text-ocean">{item.tradeoffNote ?? "可由顾问确认"}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
```

Create `components/advisor/BudgetMatchPanel.tsx`:

```tsx
import type { CustomerAdvisorState } from "@/lib/advisor/types";

export function BudgetMatchPanel({ estimate }: { estimate?: CustomerAdvisorState["budgetEstimate"] }) {
  if (!estimate) {
    return (
      <section>
        <h2 className="text-xl font-semibold">我会帮你形成</h2>
        <ul className="mt-4 space-y-3 text-sm text-white/80">
          <li>初步方案包</li>
          <li>服务项清单</li>
          <li>预算结构估算</li>
        </ul>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-xl font-semibold">{estimate.title}</h2>
      <div className="mt-4 text-4xl font-semibold text-gold">
        ¥{estimate.totalMin.toLocaleString()} - ¥{estimate.totalMax.toLocaleString()}
      </div>
      <p className="mt-4 text-sm leading-6 text-white/80">{estimate.customerMatchSummary}</p>
      <div className="mt-6">
        <h3 className="font-semibold">需人工确认</h3>
        <ul className="mt-3 space-y-2 text-sm text-white/75">
          {estimate.requiresHumanConfirmation.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
```

Create `components/advisor/SubmitToAdvisorPanel.tsx`:

```tsx
import type { CustomerAdvisorState } from "@/lib/advisor/types";

export function SubmitToAdvisorPanel({ actions }: { actions: CustomerAdvisorState["nextActions"] }) {
  return (
    <div className="mt-8 space-y-3">
      {actions.map((action) => (
        <button
          key={`${action.action}-${action.label}`}
          className={[
            "w-full rounded-ui border px-4 py-3 text-center font-semibold",
            action.action === "submit_to_advisor"
              ? "border-gold bg-gold text-ink"
              : "border-white/25 text-white",
          ].join(" ")}
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 6: Verify**

Run:

```bash
npm run test -- tests/advisor/customerVisibility.test.ts
npm run build
```

Expected: tests pass and build completes.

- [ ] **Step 7: Commit**

```bash
git add app/advisor components/advisor content/mockInquiries.ts lib/advisor
git commit -m "feat: add advisor mock flow"
```

---

### Task 4: Build Public Site Pages

**Files:**
- Create: `components/layout/SiteHeader.tsx`
- Create: `components/layout/SiteFooter.tsx`
- Create: `components/marketing/HomeHero.tsx`
- Create: `components/marketing/ScenarioGrid.tsx`
- Create: `content/scenarios.ts`
- Create: `content/venues.ts`
- Create: `content/faqs.ts`
- Modify: `app/page.tsx`
- Create: `app/solutions/[slug]/page.tsx`
- Create: `app/venues/[slug]/page.tsx`

- [ ] **Step 1: Add content seeds**

Create `content/scenarios.ts`:

```ts
export const scenarios = [
  {
    slug: "dealer-conference",
    title: "经销商大会",
    description: "适合 80-300 人会议、晚宴、品牌展示和渠道沟通。",
  },
  {
    slug: "annual-meeting",
    title: "年会与颁奖",
    description: "适合企业年会、颁奖晚宴、员工激励和主题活动。",
  },
  {
    slug: "business-reception",
    title: "商务接待",
    description: "适合客户来访、商务宴请、会议室与接送安排。",
  },
];
```

Create `content/venues.ts`:

```ts
export const venues = [
  {
    slug: "mock-kl-convention-hall",
    name: "[MOCK] 吉隆坡商务会议厅",
    city: "吉隆坡",
    capacity: "80-250 人",
    description: "适合经销商大会、培训和中型发布活动。信息待 Chris 确认。",
    contentStatus: "mock",
  },
];
```

Create `content/faqs.ts`:

```ts
export const faqs = [
  {
    question: "AI 生成的预算是正式报价吗？",
    answer: "不是。AI 预算用于理解服务范围，正式报价、档期和合同条款需由真人顾问确认。",
  },
  {
    question: "会出海第一阶段服务哪些地区？",
    answer: "首站以马来西亚和吉隆坡为重点，后续预留扩展到东南亚其他城市。",
  },
];
```

- [ ] **Step 2: Build layout components**

Create `components/layout/SiteHeader.tsx`:

```tsx
import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="flex items-center justify-between bg-ink px-8 py-4 text-white">
      <Link href="/" className="text-xl font-semibold">会出海</Link>
      <nav className="flex gap-6 text-sm text-white/80">
        <Link href="/advisor">AI 办会顾问</Link>
        <Link href="/inquiry">提交需求</Link>
      </nav>
    </header>
  );
}
```

Create `components/layout/SiteFooter.tsx`:

```tsx
export function SiteFooter() {
  return (
    <footer className="bg-ink px-8 py-8 text-sm text-white/65">
      会出海 · 首站马来西亚 · 独立站 MVP
    </footer>
  );
}
```

- [ ] **Step 3: Build home components**

Create `components/marketing/HomeHero.tsx`:

```tsx
import Link from "next/link";

export function HomeHero() {
  return (
    <section className="bg-ocean px-8 py-20 text-white">
      <p className="text-sm text-gold">首站马来西亚 · 精选场地 · 中文沟通 · 本地支持</p>
      <h1 className="mt-4 max-w-4xl text-5xl font-semibold leading-tight">
        帮中国企业在东南亚，把一场会办得更省心。
      </h1>
      <div className="mt-8 flex gap-3">
        <Link className="rounded-ui bg-gold px-5 py-3 font-semibold text-ink" href="/inquiry">
          免费提交办会需求
        </Link>
        <Link className="rounded-ui border border-white/30 px-5 py-3 font-semibold" href="/advisor">
          问问 AI 办会顾问
        </Link>
      </div>
    </section>
  );
}
```

Create `components/marketing/ScenarioGrid.tsx`:

```tsx
import Link from "next/link";
import { scenarios } from "@/content/scenarios";

export function ScenarioGrid() {
  return (
    <section className="px-8 py-12">
      <h2 className="text-2xl font-semibold">常见办会场景</h2>
      <div className="mt-6 grid grid-cols-3 gap-4">
        {scenarios.map((scenario) => (
          <Link key={scenario.slug} href={`/solutions/${scenario.slug}`} className="rounded-ui border border-line bg-white p-5">
            <h3 className="font-semibold">{scenario.title}</h3>
            <p className="mt-2 text-sm text-ocean">{scenario.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Wire public pages**

Modify `app/page.tsx`:

```tsx
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { HomeHero } from "@/components/marketing/HomeHero";
import { ScenarioGrid } from "@/components/marketing/ScenarioGrid";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <HomeHero />
        <ScenarioGrid />
      </main>
      <SiteFooter />
    </>
  );
}
```

Create `app/solutions/[slug]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { scenarios } from "@/content/scenarios";

export default function SolutionPage({ params }: { params: { slug: string } }) {
  const scenario = scenarios.find((item) => item.slug === params.slug);
  if (!scenario) notFound();

  return (
    <>
      <SiteHeader />
      <main className="px-8 py-12">
        <h1 className="text-4xl font-semibold">{scenario.title}</h1>
        <p className="mt-4 max-w-2xl text-ocean">{scenario.description}</p>
      </main>
      <SiteFooter />
    </>
  );
}
```

Create `app/venues/[slug]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { venues } from "@/content/venues";

export default function VenuePage({ params }: { params: { slug: string } }) {
  const venue = venues.find((item) => item.slug === params.slug);
  if (!venue) notFound();

  return (
    <>
      <SiteHeader />
      <main className="px-8 py-12">
        <p className="text-sm text-coral">{venue.contentStatus === "mock" ? "[MOCK] 待确认" : ""}</p>
        <h1 className="mt-2 text-4xl font-semibold">{venue.name}</h1>
        <p className="mt-4 text-ocean">{venue.city} · {venue.capacity}</p>
        <p className="mt-4 max-w-2xl">{venue.description}</p>
      </main>
      <SiteFooter />
    </>
  );
}
```

- [ ] **Step 5: Verify**

Run:

```bash
npm run build
```

Expected: build completes with static pages generated.

- [ ] **Step 6: Commit**

```bash
git add app components/layout components/marketing content
git commit -m "feat: add public site pages"
```

---

### Task 5: Build Inquiry Form

**Files:**
- Create: `lib/validation/inquirySchema.ts`
- Create: `components/inquiry/InquiryForm.tsx`
- Create: `app/inquiry/page.tsx`
- Create: `app/inquiry/success/page.tsx`
- Create: `tests/inquiry/inquirySchema.test.ts`

- [ ] **Step 1: Add inquiry schema**

Create `lib/validation/inquirySchema.ts`:

```ts
import { z } from "zod";

export const inquirySchema = z.object({
  company: z.string().min(1, "请填写公司名称"),
  contactName: z.string().min(1, "请填写联系人"),
  phone: z.string().optional(),
  wechat: z.string().optional(),
  whatsapp: z.string().optional(),
  email: z.string().email("邮箱格式不正确").optional().or(z.literal("")),
  eventType: z.string().min(1, "请选择活动类型"),
  eventDate: z.string().min(1, "请填写活动时间"),
  attendeeCount: z.coerce.number().int().positive("请填写预计人数"),
  budgetRange: z.string().optional(),
  notes: z.string().optional(),
}).refine((data) => data.phone || data.wechat || data.whatsapp || data.email, {
  message: "请至少填写一种联系方式",
  path: ["phone"],
});

export type InquiryInput = z.infer<typeof inquirySchema>;
```

- [ ] **Step 2: Add schema tests**

Create `tests/inquiry/inquirySchema.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { inquirySchema } from "@/lib/validation/inquirySchema";

describe("inquirySchema", () => {
  it("accepts a valid inquiry with one contact method", () => {
    const result = inquirySchema.safeParse({
      company: "示例公司",
      contactName: "张伟",
      wechat: "zhangwei",
      eventType: "经销商大会",
      eventDate: "2026年9月",
      attendeeCount: 120,
    });

    expect(result.success).toBe(true);
  });

  it("requires at least one contact method", () => {
    const result = inquirySchema.safeParse({
      company: "示例公司",
      contactName: "张伟",
      eventType: "经销商大会",
      eventDate: "2026年9月",
      attendeeCount: 120,
    });

    expect(result.success).toBe(false);
  });
});
```

- [ ] **Step 3: Add form UI**

Create `components/inquiry/InquiryForm.tsx`:

```tsx
export function InquiryForm() {
  return (
    <form className="grid max-w-3xl gap-4 rounded-ui border border-line bg-white p-6" action="/inquiry/success">
      <input className="rounded-ui border border-line px-3 py-2" name="company" placeholder="公司名称" required />
      <input className="rounded-ui border border-line px-3 py-2" name="contactName" placeholder="联系人" required />
      <input className="rounded-ui border border-line px-3 py-2" name="wechat" placeholder="微信" />
      <input className="rounded-ui border border-line px-3 py-2" name="whatsapp" placeholder="WhatsApp" />
      <input className="rounded-ui border border-line px-3 py-2" name="eventType" placeholder="活动类型，例如经销商大会" required />
      <input className="rounded-ui border border-line px-3 py-2" name="eventDate" placeholder="活动时间，例如 2026 年 9 月" required />
      <input className="rounded-ui border border-line px-3 py-2" name="attendeeCount" placeholder="预计人数" required type="number" />
      <textarea className="min-h-28 rounded-ui border border-line px-3 py-2" name="notes" placeholder="补充说明：城市、预算、晚宴、物料、接送等" />
      <button className="rounded-ui bg-gold px-5 py-3 font-semibold text-ink" type="submit">
        提交办会需求
      </button>
    </form>
  );
}
```

- [ ] **Step 4: Add inquiry pages**

Create `app/inquiry/page.tsx`:

```tsx
import { InquiryForm } from "@/components/inquiry/InquiryForm";
import { SiteHeader } from "@/components/layout/SiteHeader";

export default function InquiryPage() {
  return (
    <>
      <SiteHeader />
      <main className="px-8 py-12">
        <h1 className="text-4xl font-semibold">提交办会需求</h1>
        <p className="mt-3 max-w-2xl text-ocean">
          填写基础信息后，会出海顾问会根据城市、人数、预算和服务项帮你确认下一步。
        </p>
        <div className="mt-8">
          <InquiryForm />
        </div>
      </main>
    </>
  );
}
```

Create `app/inquiry/success/page.tsx`:

```tsx
import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";

export default function InquirySuccessPage() {
  return (
    <>
      <SiteHeader />
      <main className="px-8 py-12">
        <h1 className="text-4xl font-semibold">需求已提交</h1>
        <p className="mt-4 max-w-2xl text-ocean">
          会出海顾问将在 24 小时内确认活动需求、预算结构、场地档期和正式报价方式。
        </p>
        <Link className="mt-8 inline-block rounded-ui bg-gold px-5 py-3 font-semibold text-ink" href="/advisor">
          继续补充方案信息
        </Link>
      </main>
    </>
  );
}
```

- [ ] **Step 5: Verify**

Run:

```bash
npm run test -- tests/inquiry/inquirySchema.test.ts
npm run build
```

Expected: schema tests pass and build completes.

- [ ] **Step 6: Commit**

```bash
git add lib/validation components/inquiry app/inquiry tests/inquiry
git commit -m "feat: add inquiry form"
```

---

### Task 6: Add Supabase Schema

**Files:**
- Create: `supabase/migrations/001_initial_schema.sql`
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/server.ts`

- [ ] **Step 1: Add initial schema**

Create `supabase/migrations/001_initial_schema.sql`:

```sql
create table if not exists inquiries (
  id uuid primary key default gen_random_uuid(),
  company text,
  contact_name text,
  phone text,
  whatsapp text,
  wechat text,
  email text,
  event_type text,
  event_start_date text,
  event_end_date text,
  attendee_count integer,
  budget_range text,
  budget_preference text,
  budget_advice_summary text,
  budget_estimate_summary text,
  selected_package text,
  needs_completeness_score integer,
  budget_match_score integer,
  service_fit_score integer,
  match_summary text,
  event_materials_needed boolean default false,
  event_materials_types text[],
  event_materials_notes text,
  venue_id uuid,
  scenario_slug text,
  customer_notes text,
  operator_notes text,
  source text,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

create table if not exists inquiry_service_selections (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid references inquiries(id) on delete cascade,
  category text not null,
  item_name text not null,
  unit text,
  quantity numeric,
  selection_status text not null,
  importance_level text,
  unit_price_min numeric,
  unit_price_max numeric,
  subtotal_min numeric,
  subtotal_max numeric,
  customer_preference text,
  tradeoff_note text,
  requires_human_confirmation boolean not null default false,
  visibility text not null default 'customer',
  source_note text,
  created_at timestamptz not null default now()
);

create table if not exists ai_conversations (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  inquiry_id uuid references inquiries(id) on delete set null,
  channel text not null,
  entry_page text,
  messages_summary text,
  extracted_requirements jsonb,
  selected_package text,
  service_selection_summary text,
  budget_match_summary text,
  needs_completeness_score integer,
  budget_match_score integer,
  service_fit_score integer,
  authenticity_score integer,
  intent_score integer,
  lead_priority text,
  score_reasons text[],
  risk_flags text[],
  handoff_reason text,
  handoff_status text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists ai_operator_alerts (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid references inquiries(id) on delete cascade,
  ai_conversation_id uuid references ai_conversations(id) on delete set null,
  lead_priority text,
  alert_title text,
  alert_summary text,
  attention_reason text,
  customer_match_summary text,
  selected_package text,
  budget_risks text[],
  missing_information text[],
  recommended_followup_focus text,
  recommended_next_action text,
  recommended_reply text,
  notification_channel text,
  recipient text,
  delivery_status text,
  created_at timestamptz not null default now()
);
```

- [ ] **Step 2: Add Supabase clients**

Create `lib/supabase/client.ts`:

```ts
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
```

Create `lib/supabase/server.ts`:

```ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    },
  );
}
```

- [ ] **Step 3: Verify migration syntax locally**

Run:

```bash
npx supabase db lint
```

Expected: no schema lint errors. If Supabase CLI is unavailable, record that in the task notes and verify SQL manually before applying it to a remote project.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/001_initial_schema.sql lib/supabase
git commit -m "feat: add initial supabase schema"
```

---

### Task 7: Add Lightweight Operator View

**Files:**
- Create: `lib/advisor/operatorMappers.ts`
- Create: `components/ops/LeadSummaryTable.tsx`
- Create: `app/ops/leads/page.tsx`

- [ ] **Step 1: Add operator mapper**

Create `lib/advisor/operatorMappers.ts`:

```ts
import type { InternalAdvisorState } from "@/lib/advisor/types";

export function toOperatorLeadSummary(state: InternalAdvisorState) {
  return {
    customer: state.inquiry.company ?? "未填写公司",
    selectedPackage: state.inquiry.selectedPackage ?? "未选择",
    leadPriority: state.internal.leadPriority,
    authenticityScore: state.internal.authenticityScore,
    intentScore: state.internal.intentScore,
    recommendedNextAction: state.internal.recommendedNextAction,
    recommendedReply: state.internal.recommendedReply,
  };
}
```

- [ ] **Step 2: Add operator table**

Create `components/ops/LeadSummaryTable.tsx`:

```tsx
type LeadRow = {
  customer: string;
  selectedPackage: string;
  leadPriority: string;
  authenticityScore: number;
  intentScore: number;
  recommendedNextAction: string;
};

export function LeadSummaryTable({ rows }: { rows: LeadRow[] }) {
  return (
    <table className="w-full border-collapse bg-white text-sm">
      <thead>
        <tr className="border-b border-line text-left">
          <th className="p-3">客户</th>
          <th className="p-3">方案</th>
          <th className="p-3">优先级</th>
          <th className="p-3">真实性</th>
          <th className="p-3">意向</th>
          <th className="p-3">建议动作</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={`${row.customer}-${row.selectedPackage}`} className="border-b border-line">
            <td className="p-3">{row.customer}</td>
            <td className="p-3">{row.selectedPackage}</td>
            <td className="p-3">{row.leadPriority}</td>
            <td className="p-3">{row.authenticityScore}/5</td>
            <td className="p-3">{row.intentScore}/5</td>
            <td className="p-3">{row.recommendedNextAction}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

- [ ] **Step 3: Add operator page**

Create `app/ops/leads/page.tsx`:

```tsx
import { LeadSummaryTable } from "@/components/ops/LeadSummaryTable";

const rows = [
  {
    customer: "示例公司 [MOCK]",
    selectedPackage: "标准型",
    leadPriority: "high",
    authenticityScore: 4,
    intentScore: 5,
    recommendedNextAction: "优先确认日期、预算上限和晚宴需求。",
  },
];

export default function OpsLeadsPage() {
  return (
    <main className="min-h-screen bg-cloud px-8 py-10">
      <h1 className="text-3xl font-semibold">运营线索</h1>
      <p className="mt-2 text-ocean">内部页面，不对客户开放。</p>
      <div className="mt-6">
        <LeadSummaryTable rows={rows} />
      </div>
    </main>
  );
}
```

- [ ] **Step 4: Verify customer route separation**

Run:

```bash
npm run build
```

Expected: build completes. Manually confirm customer pages do not link to `/ops/leads`.

- [ ] **Step 5: Commit**

```bash
git add lib/advisor/operatorMappers.ts components/ops app/ops
git commit -m "feat: add operator lead view"
```

---

### Task 8: Add Customer Visibility E2E Test

**Files:**
- Create: `playwright.config.ts`
- Create: `tests/e2e/advisor-customer-visibility.spec.ts`

- [ ] **Step 1: Add Playwright config**

Create `playwright.config.ts`:

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  webServer: {
    command: "npm run dev",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
```

- [ ] **Step 2: Add customer visibility E2E**

Create `tests/e2e/advisor-customer-visibility.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test("customer advisor page does not expose internal scoring language", async ({ page }) => {
  await page.goto("/advisor");

  await expect(page.getByText("AI 办会顾问")).toBeVisible();
  await expect(page.getByText("真实性")).toHaveCount(0);
  await expect(page.getByText("意向分")).toHaveCount(0);
  await expect(page.getByText("高意向")).toHaveCount(0);
  await expect(page.getByText("风险标记")).toHaveCount(0);
  await expect(page.getByText("推荐开场白")).toHaveCount(0);
});
```

- [ ] **Step 3: Run E2E**

Run:

```bash
npm run e2e -- tests/e2e/advisor-customer-visibility.spec.ts
```

Expected: test passes in Chromium.

- [ ] **Step 4: Commit**

```bash
git add playwright.config.ts tests/e2e/advisor-customer-visibility.spec.ts
git commit -m "test: protect advisor customer visibility"
```

---

### Task 9: Prepare Deployment And Documentation

**Files:**
- Create: `.env.example`
- Modify: `README.md`
- Modify: `docs/README.md`

- [ ] **Step 1: Add environment example**

Create `.env.example`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
OPERATOR_NOTIFICATION_EMAIL=
```

- [ ] **Step 2: Update README**

Modify `README.md` to include these sections:

- `## Local Development`
- Commands: `npm install`, then `npm run dev`
- Local URL: `http://localhost:3000`
- `## Verification`
- Commands: `npm run test`, `npm run build`, `npm run e2e`
- `## Data Safety`
- Required note: customer-facing pages must not expose AI authenticity scores, intent scores, lead priority, risk flags, or operator follow-up recommendations. Reference `docs/product/customer-internal-field-matrix.md`.

- [ ] **Step 3: Update docs index**

Modify `docs/README.md` to include:

```md
- `product/customer-internal-field-matrix.md`
  - Defines which fields are customer-visible, operator-only, and server-only.

- `superpowers/plans/2026-07-04-huichuhai-mvp-implementation.md`
  - Implementation plan for the independent-site MVP.
```

- [ ] **Step 4: Run verification**

Run:

```bash
npm run test
npm run build
```

Expected: tests pass and build completes.

- [ ] **Step 5: Commit**

```bash
git add .env.example README.md docs/README.md
git commit -m "docs: add development handoff notes"
```

---

## High-Fidelity UI Follow-Up

Before or during Task 3, run one more Product Design pass for:

- Homepage final desktop and mobile high-fidelity UI.
- AI advisor mobile / mini program adaptation.
- Operator lead view high-fidelity UI.

The current AI advisor images are sufficient for state coverage, but generated image text is not source of truth. Implementation must use the names, labels, field boundaries, and MOCK rules from the product documents.

## Self-Review

- Spec coverage: public site, AI advisor, inquiry form, package tiers, field visibility, operator handoff, Supabase schema, and verification are covered by Tasks 1-9.
- Placeholder scan: this plan avoids unresolved markers and unspecified implementation steps.
- Type consistency: package tier labels, advisor customer state, internal advisor state, and customer visibility guard use consistent field names across tasks.
