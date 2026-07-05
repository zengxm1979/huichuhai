# Vercel Model Env Save Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a protected "保存并启用 MiniMax" flow in `/ops/model-settings` that tests the submitted MiniMax key, writes the approved model settings to Vercel environment variables, and triggers a production redeploy.

**Architecture:** Keep API keys server-only. The browser sends the key once to a protected route; the route first runs the existing model connection test, then calls a small Vercel API adapter to upsert environment variables and redeploy the latest production deployment. Responses return only status, variable names, and deployment identifiers.

**Tech Stack:** Next.js App Router route handlers, TypeScript, Zod, Vitest, existing ops cookie/token guard, Vercel REST API.

---

## External API Notes

- Vercel REST API requires a bearer access token in the `Authorization` header.
- Environment variables can be created/updated through `POST https://api.vercel.com/v10/projects/{idOrName}/env?upsert=true`.
- Deployments can be listed through `GET https://api.vercel.com/v7/deployments?projectId=...&target=production&limit=1`.
- A redeploy can be triggered through `POST https://api.vercel.com/v13/deployments` with an existing `deploymentId`.
- Team projects append `teamId=...`; no token or API key is ever returned to the client.

## File Structure

- Create `lib/deployment/vercelEnv.ts`
  - Reads `VERCEL_API_TOKEN`, `VERCEL_PROJECT_ID`, optional `VERCEL_TEAM_ID`, and `VERCEL_TARGET`.
  - Exposes `getVercelAutomationStatus`, `saveAdvisorModelEnvAndRedeploy`, and testable lower-level helpers.
  - Uses dependency-injected `fetch` for tests.
- Create `app/ops/model-settings/save/route.ts`
  - Protected POST route.
  - Accepts only `provider=minimax`.
  - Runs `testAdvisorModelConnection`.
  - Calls Vercel adapter only after test success.
  - Returns safe JSON without key values.
- Modify `lib/agent/modelConnectionTest.ts`
  - Add `vercelAutomationConfigured` to `getModelSettingsEnvStatus`.
  - Keep existing connection test behavior.
- Modify `components/ops/ModelSettingsTester.tsx`
  - Fix existing Chinese mojibake in the touched model settings UI.
  - Show automation capability status.
  - Add "保存并启用 MiniMax" after a passing MiniMax test.
  - Display saving/deploying/success/failure states.
- Modify `app/ops/model-settings/test/route.ts` and `app/ops/model-settings/page.tsx`
  - Fix touched Chinese mojibake only.
- Modify `.env.example`
  - Add `VERCEL_API_TOKEN=`, `VERCEL_PROJECT_ID=`, `VERCEL_TEAM_ID=`, `VERCEL_TARGET=production`.
- Modify docs
  - `docs/product/2026-07-05-real-ai-advisor-agent-design.md`: describe one-click Vercel env save boundaries.
  - `docs/deployment/2026-07-05-vercel-review-deployment-status.md`: list required management env vars for enabling one-click save.
- Tests
  - `tests/deployment/modelSettingsSaveRoute.test.ts`
  - Update `tests/deployment/modelSettingsRoute.test.ts`
  - Update `tests/deployment/modelSettingsSafety.test.ts`

## Task 1: Add Plan and Environment Status

- [ ] Add this plan file.
- [ ] Write a failing test in `tests/deployment/modelSettingsSafety.test.ts` that expects `getModelSettingsEnvStatus`/page source to expose automation status without exposing `VERCEL_API_TOKEN` to customer entry files.
- [ ] Run `npm run test -- tests/deployment/modelSettingsSafety.test.ts` and confirm failure.
- [ ] Add `vercelAutomationConfigured` to `getModelSettingsEnvStatus`.
- [ ] Update `ModelSettingsTester` env status type and runtime status rows.
- [ ] Run the targeted test and confirm pass.

## Task 2: Build Vercel API Adapter

- [ ] Write failing tests in `tests/deployment/modelSettingsSaveRoute.test.ts` for adapter behavior:
  - missing config reports unavailable without token leakage;
  - env upsert calls Vercel `POST /v10/projects/{idOrName}/env?upsert=true`;
  - redeploy lists production deployments and posts a redeploy with `deploymentId`;
  - Vercel errors are redacted.
- [ ] Run targeted test and confirm failure.
- [ ] Create `lib/deployment/vercelEnv.ts`.
- [ ] Implement:
  - `getVercelAutomationStatus(env)`;
  - `saveAdvisorModelEnvAndRedeploy({ provider, model, apiKey }, options)`;
  - query construction with optional `teamId`;
  - redacted error handling.
- [ ] Run targeted test and confirm pass.

## Task 3: Add Protected Save Route

- [ ] Write failing route tests in `tests/deployment/modelSettingsSaveRoute.test.ts`:
  - unauthenticated POST returns 401;
  - provider other than MiniMax is rejected;
  - failed connection test does not call Vercel API;
  - passed connection test updates only variable names and returns deployment URL/ID;
  - response never contains the submitted API key or Vercel bearer token.
- [ ] Run targeted test and confirm failure.
- [ ] Create `app/ops/model-settings/save/route.ts`.
- [ ] Use existing ops token/cookie guard.
- [ ] Call `testAdvisorModelConnection` before Vercel writes.
- [ ] Return safe payload:
  - `ok`;
  - `testResult`;
  - `envUpdated`;
  - `deploymentId`/`deploymentUrl`;
  - `message`.
- [ ] Run targeted test and confirm pass.

## Task 4: Add Operator UI Flow

- [ ] Write/update `tests/deployment/modelSettingsSafety.test.ts` source tests:
  - UI contains "保存并启用 MiniMax";
  - UI contains "自动保存能力";
  - UI does not contain localStorage/sessionStorage for API keys;
  - customer entry files do not expose `/ops/model-settings/save` or Vercel management variable names.
- [ ] Run targeted test and confirm failure.
- [ ] Update `components/ops/ModelSettingsTester.tsx`:
  - after successful MiniMax test, enable save button;
  - save POSTs to `/ops/model-settings/save`;
  - show saving/deployment submitted/failure states;
  - show env variable names only, never values;
  - if automation is not configured, show contact-technical message and keep testing available.
- [ ] Fix Chinese mojibake in touched UI strings.
- [ ] Run targeted test and confirm pass.

## Task 5: Docs and Env Example

- [ ] Update `.env.example` with Vercel management variable names only.
- [ ] Update product/deployment docs with:
  - the route tests MiniMax first;
  - env save uses Vercel management credentials;
  - redeploy is triggered after successful env update;
  - browser never stores or displays keys;
  - real enablement requires `VERCEL_API_TOKEN` and `VERCEL_PROJECT_ID`.
- [ ] Run `rg` checks for key names in customer files and docs.

## Task 6: Verification, Commit, Push

- [ ] Run `npm run test`.
- [ ] Run `npm run build`.
- [ ] Run a sensitive string check for real key patterns and `Authorization` leakage.
- [ ] Run `git diff --check`.
- [ ] Stage only relevant files, preserving unrelated dirty docs/review files.
- [ ] Commit with `feat: add one-click minimax enablement`.
- [ ] Push `origin/codex/huichuhai-mvp-d`.
- [ ] Do not configure real Vercel management credentials or call the live save route with a real key.

## Rollback and Failure Boundaries

- If MiniMax connection test fails, no Vercel API call is made.
- If env upsert fails, no redeploy is attempted and the error is redacted.
- If redeploy fails after env update succeeds, the route returns `envUpdated` and a redacted deployment error; manual redeploy can recover. Existing deployments continue serving the previous environment until a new deployment succeeds.
- The feature can be disabled operationally by not configuring `VERCEL_API_TOKEN`/`VERCEL_PROJECT_ID`; the test-only flow remains usable.

## Self-Review

- Spec coverage: ops protection, MiniMax-only save, Vercel env upsert, redeploy, UI status, `.env.example`, docs, tests, and no client-side storage are covered.
- Placeholder scan: no TBD/TODO/fill-later placeholders remain.
- Type consistency: save route and UI use `provider`, `model`, `apiKey`, `testMessage`; Vercel response returns `envUpdated`, `deploymentId`, `deploymentUrl`, and `message`.
