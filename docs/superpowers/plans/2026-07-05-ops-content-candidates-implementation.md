# Ops Content Candidates Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn `/ops/resources` into the upstream collection point for public-safe content material, and add an internal `/ops/content-candidates` review view without building a public CMS or changing indexing behavior.

**Architecture:** Resource master remains the source of operational truth, but new content-candidate fields are stored separately from supplier and negotiation fields. `/ops/content-candidates` reads only public-safe candidate fields plus derived gap signals, while customer/public payloads continue to go through explicit mappers that exclude internal and content-workflow fields.

**Tech Stack:** Next.js App Router, TypeScript, React client workspaces for Phase 1 mock state, Vitest, existing ops cookie/token access helpers.

---

## Scope Boundaries

- Build only internal Phase 2 preparation: resource content material fields, internal candidate list, mapper safety tests, and docs.
- Do not generate public city, scenario, venue, FAQ, or case pages.
- Do not change `robots.txt`, `sitemap.xml`, noindex behavior, or search indexing policy.
- Do not add a formal CMS, public publish workflow, versioning, publish user, or publish timestamp.
- Do not expose `/ops/*` links or content candidate status on customer pages.
- Keep resource entry fast: the new content material section must be grouped and visually separate from core resource fields.

## File Structure

- Modify `docs/product/2026-07-05-phase-2-roadmap.md`
  - Add "GEO 内容素材上游采集与候选池" as a Phase 2 item.
  - State that Phase 2 does not publish pages or change sitemap/indexing.
- Modify `docs/superpowers/specs/2026-07-04-huichuhai-platform-design.md`
  - Add the boundary: resource master can collect public-safe content candidates, but public pages must consume mapped and reviewed data only.
  - Keep existing resource master and quote request split intact.
- Modify `docs/delivery/2026-07-05-client-review-package.md`
  - Lightly mention that the internal ops entry may also support future GEO/content material collection.
  - Do not claim public GEO publishing exists.
- Modify `lib/resources/types.ts`
  - Add `ResourceContentStatus`, `ImageAuthorizationStatus`, `CasePotential`.
  - Add public-safe candidate fields to `ResourceMaster`.
- Modify `content/mockResources.ts`
  - Populate the new fields with mock review-stage values.
- Create `lib/resources/contentCandidates.ts`
  - Derive internal content candidate summaries and missing-material gaps from resource masters.
  - Enforce status transition rules for `public_ready`.
- Modify `lib/resources/customerMappers.ts`
  - Fix existing mojibake while touching this file.
  - Keep customer payload limited to approved customer fields and exclude content workflow fields.
- Modify `tests/resources/customerMappers.test.ts`
  - Add forbidden keys for content candidate and workflow fields.
  - Fix existing mojibake expectations while touching this file.
- Create `tests/resources/contentCandidates.test.ts`
  - Test gap derivation and `public_ready` gating.
- Modify `components/ops/ResourceOpsWorkspace.tsx`
  - Add a grouped "公开内容素材" section to create/edit resource forms.
  - Preserve existing create, edit, and start quote interactions.
- Modify `components/ops/ResourceTable.tsx`
  - Add a compact content status indicator only if it does not crowd the table.
- Create `components/ops/ContentCandidatesWorkspace.tsx`
  - Internal candidate list and lightweight status action UI.
- Create `components/ops/ContentCandidateTable.tsx`
  - Render city tags, use cases, FAQ seeds, image auth, case potential, status, and gaps.
- Modify `components/ops/OpsShell.tsx`
  - Add `/ops/content-candidates` to nav.
  - Fix existing mojibake while touching this file.
- Create `app/ops/content-candidates/page.tsx`
  - Use `requireOpsAccess("/ops/content-candidates", searchParams.token)`.
  - Render the new content candidate workspace under `OpsShell`.
- Modify `tests/deployment/reviewAccess.test.ts`
  - Include `/ops/content-candidates` in protected ops path coverage at helper level.

---

### Task 1: Document the Approved Product Boundary

**Files:**
- Modify: `docs/product/2026-07-05-phase-2-roadmap.md`
- Modify: `docs/superpowers/specs/2026-07-04-huichuhai-platform-design.md`
- Modify: `docs/delivery/2026-07-05-client-review-package.md`

- [ ] **Step 1: Update Phase 2 roadmap**

Add a Phase 2 item named `GEO 内容素材上游采集与候选池`. It should say:

```markdown
### GEO 内容素材上游采集与候选池

业务价值：
- 让 Chris / 运营在维护真实资源时同步沉淀城市、场景、FAQ、案例和图片授权素材。
- 为后续 GEO / SEO 内容矩阵提供可信上游，而不是临时编写公开页面。

前置条件：
- 资源主档字段能区分运营内部信息和 public-safe 候选素材。
- 图片、案例和 FAQ 素材具备授权状态或审核状态。

建议验收标准：
- `/ops/resources` 有独立的公开内容素材分区。
- `/ops/content-candidates` 能汇总候选素材并标出缺口。
- 客户侧页面不出现内容候选状态、供应商内部信息、报价冲突或运营判断。

风险 / 注意事项：
- Phase 2 不做公开页面自动生成，不改 sitemap，不开启正式收录。
- `public_ready` 只代表内部素材已准备好进入后续内容生产，不等于已经公开发布。
```

- [ ] **Step 2: Update platform design**

Add a short subsection under the ops/resource/GEO area:

```markdown
资源主档可以作为 GEO 和内容素材的上游采集点，但不是公开发布后台。运营录入的 `publicSummaryDraft`、`publicContentNotes`、`commonUseCases`、`cityContentTags`、`faqSeeds`、`casePotential` 和 `imageAuthorizationStatus` 只能先进入内部内容候选池。公开页面必须消费经过审核、白名单映射且处于 public-safe 状态的数据，不得直接读取资源主档原始对象。
```

- [ ] **Step 3: Update client review package lightly**

Add one sentence to the internal ops section:

```markdown
后续内部运营入口也会承担 GEO / FAQ / 城市页 / 场景页的素材沉淀，但当前审核站不具备公开 GEO 发布能力。
```

- [ ] **Step 4: Verify docs do not overclaim publishing**

Run:

```powershell
rg -n "一键发布|自动发布|已发布|正式收录|开启收录|published" docs/product/2026-07-05-phase-2-roadmap.md docs/delivery/2026-07-05-client-review-package.md docs/superpowers/specs/2026-07-04-huichuhai-platform-design.md
```

Expected: no line claims that Phase 2 publishes public GEO pages or enables indexing. Existing historical mentions of future formal collection are acceptable only when phrased as future Phase 3 work.

- [ ] **Step 5: Commit docs boundary**

```powershell
git add docs/product/2026-07-05-phase-2-roadmap.md docs/superpowers/specs/2026-07-04-huichuhai-platform-design.md docs/delivery/2026-07-05-client-review-package.md
git commit -m "docs: define ops content candidate boundary"
```

---

### Task 2: Add Content Candidate Types and Mock Data

**Files:**
- Modify: `lib/resources/types.ts`
- Modify: `content/mockResources.ts`
- Test: `tests/resources/contentCandidates.test.ts`

- [ ] **Step 1: Write failing type and mock behavior test**

Create `tests/resources/contentCandidates.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { mockResources } from "@/content/mockResources";

describe("resource content candidate fields", () => {
  it("uses Phase 2 content statuses and structured authorization values", () => {
    expect(mockResources.length).toBeGreaterThan(0);
    expect(mockResources.map((resource) => resource.contentStatus)).toEqual(
      expect.arrayContaining(["draft", "needs_review", "verified", "public_ready"]),
    );
    expect(mockResources.every((resource) => Array.isArray(resource.cityContentTags))).toBe(true);
    expect(mockResources.every((resource) => Array.isArray(resource.commonUseCases))).toBe(true);
    expect(mockResources.every((resource) => Array.isArray(resource.faqSeeds))).toBe(true);
    expect(mockResources.every((resource) =>
      ["unknown", "internal_only", "public_approved", "needs_replacement"].includes(resource.imageAuthorizationStatus),
    )).toBe(true);
    expect(mockResources.every((resource) =>
      ["none", "anonymous_candidate", "named_candidate", "approved"].includes(resource.casePotential),
    )).toBe(true);
  });
});
```

- [ ] **Step 2: Run failing test**

Run:

```powershell
npm.cmd run test -- tests/resources/contentCandidates.test.ts
```

Expected: fail because `contentCandidates.test.ts` imports fields not yet present on `ResourceMaster`.

- [ ] **Step 3: Update resource types**

In `lib/resources/types.ts`, add:

```ts
export type ResourceContentStatus = "draft" | "needs_review" | "verified" | "public_ready";

export type ImageAuthorizationStatus =
  | "unknown"
  | "internal_only"
  | "public_approved"
  | "needs_replacement";

export type CasePotential =
  | "none"
  | "anonymous_candidate"
  | "named_candidate"
  | "approved";
```

Update `ResourceMaster`:

```ts
  customerVisibleSummary: string;
  publicSummaryDraft: string;
  publicContentNotes: string;
  commonUseCases: string[];
  cityContentTags: string[];
  faqSeeds: string[];
  casePotential: CasePotential;
  imageAuthorizationStatus: ImageAuthorizationStatus;
  internalNegotiationNote: string;
  internalRiskNote: string;
  contentStatus: ResourceContentStatus;
  lastVerifiedAt: string;
```

- [ ] **Step 4: Update mock resources**

For each object in `content/mockResources.ts`, replace `contentStatus: "mock"` with one of the Phase 2 statuses and add the new fields. Example shape:

```ts
publicSummaryDraft: "适合用于 100-300 人商务会议的资源摘要 [MOCK]",
publicContentNotes: "可延展为新山投资大会资源段落，需 Chris 审核 [MOCK]",
commonUseCases: ["投资大会", "商务接待"],
cityContentTags: ["新山"],
faqSeeds: ["新山适合办投资大会吗？"],
casePotential: "anonymous_candidate",
imageAuthorizationStatus: "needs_replacement",
contentStatus: "needs_review",
```

- [ ] **Step 5: Run targeted test**

Run:

```powershell
npm.cmd run test -- tests/resources/contentCandidates.test.ts
```

Expected: pass.

- [ ] **Step 6: Commit type and mock changes**

```powershell
git add lib/resources/types.ts content/mockResources.ts tests/resources/contentCandidates.test.ts
git commit -m "feat: add resource content candidate fields"
```

---

### Task 3: Add Content Candidate Derivation and Safety Tests

**Files:**
- Create: `lib/resources/contentCandidates.ts`
- Modify: `tests/resources/contentCandidates.test.ts`
- Modify: `lib/resources/customerMappers.ts`
- Modify: `tests/resources/customerMappers.test.ts`

- [ ] **Step 1: Extend failing content candidate tests**

Append to `tests/resources/contentCandidates.test.ts`:

```ts
import {
  buildContentCandidateSummary,
  canMarkPublicReady,
  deriveContentCandidateGaps,
} from "@/lib/resources/contentCandidates";

describe("content candidate summaries", () => {
  it("derives missing material gaps from resource content fields", () => {
    const resource = {
      ...mockResources[0],
      cityContentTags: [],
      commonUseCases: [],
      faqSeeds: [],
      imageAuthorizationStatus: "unknown" as const,
      publicSummaryDraft: "",
      publicContentNotes: "",
      contentStatus: "draft" as const,
    };

    expect(deriveContentCandidateGaps(resource)).toEqual(
      expect.arrayContaining([
        "missing_city_tags",
        "missing_use_cases",
        "missing_faq_seeds",
        "missing_public_summary",
        "missing_public_notes",
        "missing_image_authorization",
        "needs_chris_review",
      ]),
    );
  });

  it("blocks public_ready when image authorization is not public approved", () => {
    const resource = {
      ...mockResources[0],
      imageAuthorizationStatus: "needs_replacement" as const,
      contentStatus: "verified" as const,
    };

    expect(canMarkPublicReady(resource)).toBe(false);
  });

  it("builds a summary without supplier or internal notes", () => {
    const summary = buildContentCandidateSummary(mockResources[0]);
    const serialized = JSON.stringify(summary);

    expect(serialized).not.toContain("supplierName");
    expect(serialized).not.toContain("internalNegotiationNote");
    expect(serialized).not.toContain("internalRiskNote");
    expect(summary.resourceName).toBe(mockResources[0].resourceName);
  });
});
```

- [ ] **Step 2: Run failing test**

Run:

```powershell
npm.cmd run test -- tests/resources/contentCandidates.test.ts
```

Expected: fail because `lib/resources/contentCandidates.ts` does not exist.

- [ ] **Step 3: Implement content candidate helpers**

Create `lib/resources/contentCandidates.ts`:

```ts
import type { ResourceContentStatus, ResourceMaster } from "@/lib/resources/types";

export type ContentCandidateGap =
  | "missing_city_tags"
  | "missing_use_cases"
  | "missing_faq_seeds"
  | "missing_public_summary"
  | "missing_public_notes"
  | "missing_image_authorization"
  | "needs_chris_review"
  | "missing_reference_price";

export type ContentCandidateSummary = {
  id: string;
  resourceName: string;
  resourceType: ResourceMaster["resourceType"];
  city: string;
  district: string;
  publicSummaryDraft: string;
  publicContentNotes: string;
  commonUseCases: string[];
  cityContentTags: string[];
  faqSeeds: string[];
  casePotential: ResourceMaster["casePotential"];
  imageAuthorizationStatus: ResourceMaster["imageAuthorizationStatus"];
  contentStatus: ResourceContentStatus;
  gaps: ContentCandidateGap[];
};

export function deriveContentCandidateGaps(resource: ResourceMaster): ContentCandidateGap[] {
  const gaps: ContentCandidateGap[] = [];

  if (resource.cityContentTags.length === 0) gaps.push("missing_city_tags");
  if (resource.commonUseCases.length === 0) gaps.push("missing_use_cases");
  if (resource.faqSeeds.length === 0) gaps.push("missing_faq_seeds");
  if (resource.publicSummaryDraft.trim().length === 0) gaps.push("missing_public_summary");
  if (resource.publicContentNotes.trim().length === 0) gaps.push("missing_public_notes");
  if (resource.imageAuthorizationStatus !== "public_approved") gaps.push("missing_image_authorization");
  if (resource.contentStatus === "draft" || resource.contentStatus === "needs_review") gaps.push("needs_chris_review");
  if (resource.referencePriceMin <= 0 || resource.referencePriceMax <= 0) gaps.push("missing_reference_price");

  return gaps;
}

export function canMarkPublicReady(resource: ResourceMaster): boolean {
  const gaps = deriveContentCandidateGaps(resource);
  return gaps.length === 0 && resource.imageAuthorizationStatus === "public_approved";
}

export function nextContentStatus(resource: ResourceMaster, requested: ResourceContentStatus): ResourceContentStatus {
  if (requested === "public_ready" && !canMarkPublicReady(resource)) {
    return resource.contentStatus;
  }

  return requested;
}

export function buildContentCandidateSummary(resource: ResourceMaster): ContentCandidateSummary {
  return {
    id: resource.id,
    resourceName: resource.resourceName,
    resourceType: resource.resourceType,
    city: resource.city,
    district: resource.district,
    publicSummaryDraft: resource.publicSummaryDraft,
    publicContentNotes: resource.publicContentNotes,
    commonUseCases: resource.commonUseCases,
    cityContentTags: resource.cityContentTags,
    faqSeeds: resource.faqSeeds,
    casePotential: resource.casePotential,
    imageAuthorizationStatus: resource.imageAuthorizationStatus,
    contentStatus: resource.contentStatus,
    gaps: deriveContentCandidateGaps(resource),
  };
}
```

- [ ] **Step 4: Strengthen customer mapper safety test**

In `tests/resources/customerMappers.test.ts`, extend `forbiddenCustomerKeys`:

```ts
  "publicSummaryDraft",
  "publicContentNotes",
  "commonUseCases",
  "cityContentTags",
  "faqSeeds",
  "casePotential",
  "imageAuthorizationStatus",
  "contentStatus",
  "public_summary_draft",
  "public_content_notes",
  "common_use_cases",
  "city_content_tags",
  "faq_seeds",
  "case_potential",
  "image_authorization_status",
  "content_status",
```

Fix mojibake expectations:

```ts
expect(summaries.every((summary) => summary.referencePriceLabel.includes("参考范围"))).toBe(true);
expect(payloads.every((payload) => payload.customerNotice.includes("正式价格"))).toBe(true);
```

- [ ] **Step 5: Fix customer mapper copy**

In `lib/resources/customerMappers.ts`, replace mojibake strings:

```ts
referencePriceLabel: `参考范围 ${formatMoney(resource.referencePriceMin, resource.currency)} - ${formatMoney(
  resource.referencePriceMax,
  resource.currency,
)} / ${resource.pricingUnit}`,
```

```ts
customerNotice: "正式价格、档期、付款和取消条款，需基于本次询价由顾问确认。",
```

```ts
return "等待供应商确认本次报价";
```

```ts
return `本次询价范围 ${formatMoney(request.quotedPriceMin, request.currency)} - ${formatMoney(
  request.quotedPriceMax,
  request.currency,
)}`;
```

- [ ] **Step 6: Run resource tests**

Run:

```powershell
npm.cmd run test -- tests/resources/contentCandidates.test.ts tests/resources/customerMappers.test.ts
```

Expected: pass.

- [ ] **Step 7: Commit mapper and derivation changes**

```powershell
git add lib/resources/contentCandidates.ts lib/resources/customerMappers.ts tests/resources/contentCandidates.test.ts tests/resources/customerMappers.test.ts
git commit -m "test: protect content candidate visibility"
```

---

### Task 4: Add Public Content Material Section to Resource Ops

**Files:**
- Modify: `components/ops/ResourceOpsWorkspace.tsx`
- Modify: `components/ops/ResourceTable.tsx`
- Test: covered by browser validation and type tests

- [ ] **Step 1: Add grouped form fields**

In `components/ops/ResourceOpsWorkspace.tsx`, add a separate section inside the existing resource form:

```tsx
<details className="rounded-ui border border-line bg-cloud/40 p-4">
  <summary className="cursor-pointer text-sm font-semibold text-ink">
    公开内容素材（内部候选，不直接对客户展示）
  </summary>
  <div className="mt-4 grid gap-4 md:grid-cols-2">
    <label className="text-sm font-semibold text-ink">
      公开摘要草稿
      <textarea name="publicSummaryDraft" defaultValue={resource?.publicSummaryDraft ?? ""} className="mt-2 min-h-24 w-full rounded-ui border border-line px-3 py-2" />
    </label>
    <label className="text-sm font-semibold text-ink">
      内容备注
      <textarea name="publicContentNotes" defaultValue={resource?.publicContentNotes ?? ""} className="mt-2 min-h-24 w-full rounded-ui border border-line px-3 py-2" />
    </label>
    <label className="text-sm font-semibold text-ink">
      城市标签（逗号分隔）
      <input name="cityContentTags" defaultValue={(resource?.cityContentTags ?? []).join(", ")} className="mt-2 w-full rounded-ui border border-line px-3 py-2" />
    </label>
    <label className="text-sm font-semibold text-ink">
      适用场景（逗号分隔）
      <input name="commonUseCases" defaultValue={(resource?.commonUseCases ?? []).join(", ")} className="mt-2 w-full rounded-ui border border-line px-3 py-2" />
    </label>
    <label className="text-sm font-semibold text-ink">
      FAQ 素材（每行一个问题）
      <textarea name="faqSeeds" defaultValue={(resource?.faqSeeds ?? []).join("\\n")} className="mt-2 min-h-24 w-full rounded-ui border border-line px-3 py-2" />
    </label>
    <label className="text-sm font-semibold text-ink">
      图片授权状态
      <select name="imageAuthorizationStatus" defaultValue={resource?.imageAuthorizationStatus ?? "unknown"} className="mt-2 w-full rounded-ui border border-line px-3 py-2">
        <option value="unknown">未知</option>
        <option value="internal_only">仅内部使用</option>
        <option value="public_approved">已确认可公开</option>
        <option value="needs_replacement">需替换图片</option>
      </select>
    </label>
    <label className="text-sm font-semibold text-ink">
      案例潜力
      <select name="casePotential" defaultValue={resource?.casePotential ?? "none"} className="mt-2 w-full rounded-ui border border-line px-3 py-2">
        <option value="none">暂无</option>
        <option value="anonymous_candidate">匿名案例候选</option>
        <option value="named_candidate">实名案例候选</option>
        <option value="approved">已确认授权</option>
      </select>
    </label>
    <label className="text-sm font-semibold text-ink">
      内容状态
      <select name="contentStatus" defaultValue={resource?.contentStatus ?? "draft"} className="mt-2 w-full rounded-ui border border-line px-3 py-2">
        <option value="draft">草稿</option>
        <option value="needs_review">待审核</option>
        <option value="verified">已核对</option>
        <option value="public_ready">可进入公开内容生产</option>
      </select>
    </label>
  </div>
  <p className="mt-3 text-xs leading-5 text-ocean/65">
    这里是 public-safe 候选素材，不代表已经公开发布；供应商、谈判、风险和当次报价不要填写在这里。
  </p>
</details>
```

- [ ] **Step 2: Parse content material fields on save**

Add helpers in `ResourceOpsWorkspace.tsx`:

```ts
function csvList(value: FormDataEntryValue | null): string[] {
  return String(value || "")
    .split(/[,，]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function lineList(value: FormDataEntryValue | null): string[] {
  return String(value || "")
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}
```

When building `next: ResourceMaster`, add:

```ts
publicSummaryDraft: String(formData.get("publicSummaryDraft") || ""),
publicContentNotes: String(formData.get("publicContentNotes") || ""),
commonUseCases: csvList(formData.get("commonUseCases")),
cityContentTags: csvList(formData.get("cityContentTags")),
faqSeeds: lineList(formData.get("faqSeeds")),
casePotential: String(formData.get("casePotential") || "none") as ResourceMaster["casePotential"],
imageAuthorizationStatus: String(formData.get("imageAuthorizationStatus") || "unknown") as ResourceMaster["imageAuthorizationStatus"],
contentStatus: String(formData.get("contentStatus") || "draft") as ResourceMaster["contentStatus"],
```

- [ ] **Step 3: Add compact content status to table**

In `components/ops/ResourceTable.tsx`, add a table column:

```tsx
<th className="px-4 py-3 text-left">内容状态</th>
```

Render:

```tsx
<td className="px-4 py-4 text-sm text-ocean">{contentStatusLabel[resource.contentStatus]}</td>
```

Add labels:

```ts
const contentStatusLabel: Record<ResourceMaster["contentStatus"], string> = {
  draft: "草稿",
  needs_review: "待审核",
  verified: "已核对",
  public_ready: "可进入内容生产",
};
```

- [ ] **Step 4: Run type check through build**

Run:

```powershell
npm.cmd run build
```

Expected: pass.

- [ ] **Step 5: Commit resource ops UI**

```powershell
git add components/ops/ResourceOpsWorkspace.tsx components/ops/ResourceTable.tsx
git commit -m "feat: collect public-safe resource content material"
```

---

### Task 5: Add Internal Content Candidates Page

**Files:**
- Create: `app/ops/content-candidates/page.tsx`
- Create: `components/ops/ContentCandidatesWorkspace.tsx`
- Create: `components/ops/ContentCandidateTable.tsx`
- Modify: `components/ops/OpsShell.tsx`
- Modify: `tests/deployment/reviewAccess.test.ts`

- [ ] **Step 1: Add protected page**

Create `app/ops/content-candidates/page.tsx`:

```tsx
import { ContentCandidatesWorkspace } from "@/components/ops/ContentCandidatesWorkspace";
import { OpsShell } from "@/components/ops/OpsShell";
import { mockResources } from "@/content/mockResources";
import { requireOpsAccess } from "@/lib/deployment/opsServerAccess";

type PageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function OpsContentCandidatesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  await requireOpsAccess("/ops/content-candidates", params.token);

  return (
    <OpsShell title="内容素材候选池">
      <ContentCandidatesWorkspace initialResources={mockResources} />
    </OpsShell>
  );
}
```

- [ ] **Step 2: Add candidate table**

Create `components/ops/ContentCandidateTable.tsx`:

```tsx
import type { ContentCandidateSummary } from "@/lib/resources/contentCandidates";

const gapLabel: Record<string, string> = {
  missing_city_tags: "缺城市标签",
  missing_use_cases: "缺场景",
  missing_faq_seeds: "缺 FAQ",
  missing_public_summary: "缺公开摘要",
  missing_public_notes: "缺内容备注",
  missing_image_authorization: "缺图片授权",
  needs_chris_review: "待 Chris 审核",
  missing_reference_price: "缺参考价范围",
};

export function ContentCandidateTable({
  candidates,
  onStatusChange,
}: {
  candidates: ContentCandidateSummary[];
  onStatusChange: (id: string, status: ContentCandidateSummary["contentStatus"]) => void;
}) {
  return (
    <div className="overflow-hidden rounded-ui border border-line bg-white">
      <table className="w-full min-w-[980px] border-collapse text-left">
        <thead className="bg-cloud text-xs uppercase tracking-[0.16em] text-ocean/60">
          <tr>
            <th className="px-4 py-3">资源</th>
            <th className="px-4 py-3">城市 / 场景</th>
            <th className="px-4 py-3">FAQ 素材</th>
            <th className="px-4 py-3">授权 / 案例</th>
            <th className="px-4 py-3">缺口</th>
            <th className="px-4 py-3">状态</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {candidates.map((candidate) => (
            <tr key={candidate.id}>
              <td className="px-4 py-4 align-top">
                <p className="font-semibold text-ink">{candidate.resourceName}</p>
                <p className="mt-1 text-sm text-ocean/70">{candidate.publicSummaryDraft || "缺公开摘要草稿"}</p>
              </td>
              <td className="px-4 py-4 align-top text-sm text-ocean">
                <p>{candidate.cityContentTags.join(" / ") || "缺城市标签"}</p>
                <p className="mt-1">{candidate.commonUseCases.join(" / ") || "缺适用场景"}</p>
              </td>
              <td className="px-4 py-4 align-top text-sm text-ocean">
                {candidate.faqSeeds.length > 0 ? candidate.faqSeeds.slice(0, 2).join("；") : "缺 FAQ 素材"}
              </td>
              <td className="px-4 py-4 align-top text-sm text-ocean">
                <p>图片：{candidate.imageAuthorizationStatus}</p>
                <p className="mt-1">案例：{candidate.casePotential}</p>
              </td>
              <td className="px-4 py-4 align-top">
                <div className="flex flex-wrap gap-2">
                  {candidate.gaps.length === 0 ? (
                    <span className="rounded-ui bg-teal/10 px-2 py-1 text-xs font-semibold text-teal">素材完整</span>
                  ) : (
                    candidate.gaps.map((gap) => (
                      <span className="rounded-ui bg-gold/10 px-2 py-1 text-xs font-semibold text-ocean" key={gap}>
                        {gapLabel[gap]}
                      </span>
                    ))
                  )}
                </div>
              </td>
              <td className="px-4 py-4 align-top">
                <select
                  className="rounded-ui border border-line px-3 py-2 text-sm"
                  onChange={(event) => onStatusChange(candidate.id, event.target.value as ContentCandidateSummary["contentStatus"])}
                  value={candidate.contentStatus}
                >
                  <option value="draft">草稿</option>
                  <option value="needs_review">待审核</option>
                  <option value="verified">已核对</option>
                  <option value="public_ready">可进入内容生产</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 3: Add workspace**

Create `components/ops/ContentCandidatesWorkspace.tsx`:

```tsx
"use client";

import { useMemo, useState } from "react";
import { ContentCandidateTable } from "@/components/ops/ContentCandidateTable";
import {
  buildContentCandidateSummary,
  nextContentStatus,
} from "@/lib/resources/contentCandidates";
import type { ResourceContentStatus, ResourceMaster } from "@/lib/resources/types";

export function ContentCandidatesWorkspace({ initialResources }: { initialResources: ResourceMaster[] }) {
  const [resources, setResources] = useState(initialResources);
  const [message, setMessage] = useState("内容素材候选池为审核预览 / MOCK，不代表已公开发布。");

  const candidates = useMemo(() => resources.map(buildContentCandidateSummary), [resources]);

  function updateStatus(id: string, requestedStatus: ResourceContentStatus) {
    setResources((current) =>
      current.map((resource) => {
        if (resource.id !== id) return resource;
        const contentStatus = nextContentStatus(resource, requestedStatus);
        setMessage(
          contentStatus === requestedStatus
            ? `已将 ${resource.resourceName} 标记为 ${requestedStatus}。`
            : `${resource.resourceName} 缺少公开授权或审核信息，暂不能标记为 public_ready。`,
        );
        return { ...resource, contentStatus };
      }),
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-ui border border-line bg-white p-5">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gold">Content Candidates</p>
        <h2 className="mt-2 text-2xl font-semibold text-ink">GEO 内容素材池</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-ocean/70">
          这里汇总资源主档中的 public-safe 候选素材，用于后续 FAQ、城市页、场景页、案例和 GEO 内容矩阵。当前不提供一键发布，不改 sitemap，不开启收录。
        </p>
        <p className="mt-3 rounded-ui bg-cloud px-3 py-2 text-sm font-semibold text-ocean">{message}</p>
      </div>
      <ContentCandidateTable candidates={candidates} onStatusChange={updateStatus} />
    </div>
  );
}
```

- [ ] **Step 4: Add nav item and fix ops shell copy**

In `components/ops/OpsShell.tsx`, set:

```ts
const opsLinks = [
  { href: "/ops/resources", label: "资源主档" },
  { href: "/ops/content-candidates", label: "内容素材" },
  { href: "/ops/quote-requests", label: "当次询价单" },
  { href: "/ops/leads", label: "AI 线索" },
];
```

Also replace mojibake shell copy with:

```tsx
<p className="text-lg font-semibold">HCH 会出海 Ops</p>
<p className="text-sm text-white/60">内部运营视图 / 不向客户展示</p>
```

```tsx
<span className="rounded-ui bg-gold px-4 py-2 text-sm font-semibold text-ink">审核预览 / MOCK</span>
```

```tsx
退出
```

```tsx
审核预览 / MOCK。资源主档仅维护参考条件；当次价格、档期、付款和取消条款必须由询价单确认，不代表真实资源库已落库。
```

- [ ] **Step 5: Extend access tests**

In `tests/deployment/reviewAccess.test.ts`, add `/ops/content-candidates` to protected path cases. If the current test uses helper paths, include:

```ts
expect(sanitizeOpsNextPath("/ops/content-candidates")).toBe("/ops/content-candidates");
```

And ensure invalid paths still normalize:

```ts
expect(sanitizeOpsNextPath("/advisor")).toBe("/ops/resources");
```

- [ ] **Step 6: Run targeted tests and build**

Run:

```powershell
npm.cmd run test -- tests/deployment/reviewAccess.test.ts tests/resources/contentCandidates.test.ts
npm.cmd run build
```

Expected: both commands pass.

- [ ] **Step 7: Commit content candidate page**

```powershell
git add app/ops/content-candidates/page.tsx components/ops/ContentCandidatesWorkspace.tsx components/ops/ContentCandidateTable.tsx components/ops/OpsShell.tsx tests/deployment/reviewAccess.test.ts
git commit -m "feat: add ops content candidate review page"
```

---

### Task 6: Full Verification and Browser Acceptance

**Files:**
- No new source files.
- Verification covers customer pages, ops pages, and docs.

- [ ] **Step 1: Run full test suite**

Run:

```powershell
npm.cmd run test
```

Expected: all test files pass.

- [ ] **Step 2: Run production build**

Run:

```powershell
npm.cmd run build
```

Expected: build exits with code 0 and route list includes `/ops/content-candidates`.

- [ ] **Step 3: Start local server on port 3000**

Stop any old dev server first, then run:

```powershell
npm.cmd run dev -- --hostname 127.0.0.1 --port 3000
```

Expected: `Ready` and local URL `http://127.0.0.1:3000`.

- [ ] **Step 4: Verify protected ops route behavior**

Use browser or Playwright:

1. Open `http://127.0.0.1:3000/ops/content-candidates`.
2. Expected: redirected to `/ops/login?next=%2Fops%2Fcontent-candidates`.
3. Log in through `/ops/login`.
4. Expected: `/ops/content-candidates` is accessible.
5. Click ops nav between resources, content material, quote requests, and leads.
6. Expected: nav works without token in URL.

- [ ] **Step 5: Verify resource content material entry**

Use browser or Playwright:

1. Open `/ops/resources` after login.
2. Click `新建资源`.
3. Expand `公开内容素材`.
4. Fill `公开摘要草稿`, `内容备注`, `城市标签`, `适用场景`, `FAQ 素材`, `图片授权状态`, `案例潜力`, `内容状态`.
5. Save.
6. Expected: the resource appears in the resource list and can be seen in `/ops/content-candidates`.

- [ ] **Step 6: Verify candidate status guard**

Use browser or Playwright:

1. On `/ops/content-candidates`, choose a resource whose `imageAuthorizationStatus` is not `public_approved`.
2. Change status to `public_ready`.
3. Expected: status does not change to `public_ready`; message explains missing authorization or review information.

- [ ] **Step 7: Verify customer-side field isolation**

Use browser or Playwright:

1. Open `/`, `/advisor`, `/inquiry`.
2. Search visible text and page HTML for:
   - `supplierName`
   - `internalNegotiationNote`
   - `internalRiskNote`
   - `conflictNote`
   - `supplierResponseSummary`
   - `operatorFollowupNote`
   - `contentStatus`
   - `publicContentNotes`
   - `imageAuthorizationStatus`
   - `casePotential`
3. Expected: none appear on customer pages.

- [ ] **Step 8: Verify docs claims**

Run:

```powershell
rg -n "一键发布|自动发布|正式收录|开启收录" docs/product/2026-07-05-phase-2-roadmap.md docs/delivery/2026-07-05-client-review-package.md docs/superpowers/specs/2026-07-04-huichuhai-platform-design.md
```

Expected: no Phase 2 statement claims public publishing or indexing.

- [ ] **Step 9: Commit final verification notes if added**

If a review note file is created, commit only that file:

```powershell
git add docs/reviews/<review-note-file>.md
git commit -m "docs: record content candidate verification"
```

- [ ] **Step 10: Push branch**

```powershell
git push origin codex/huichuhai-mvp-d
```

Expected: push succeeds.

---

## Self-Review

- Spec coverage:
  - `/ops/resources` gets a grouped public content material section in Task 4.
  - `/ops/content-candidates` is added and protected in Task 5.
  - No-login redirect is covered in Task 5 and Task 6.
  - Customer-side field isolation is covered in Task 3 and Task 6.
  - Mapper safety tests are covered in Task 3.
  - `npm run test` and `npm run build` are covered in Task 6.
- Scope check:
  - Plan does not add public page generation, sitemap changes, CMS publishing, or indexing.
  - `published` is not used as a Phase 2 content status.
  - `public_ready` is treated as internal readiness for content production, not public publication.
- Type consistency:
  - `ResourceContentStatus`, `ImageAuthorizationStatus`, `CasePotential`, and new `ResourceMaster` fields are defined before use.
  - `ContentCandidateSummary` uses only public-safe candidate fields plus derived gaps.
  - Customer mappers exclude candidate workflow fields from customer payloads.
