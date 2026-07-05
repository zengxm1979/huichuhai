import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("model settings customer-side safety", () => {
  it("does not expose ops model settings entry or key names in customer entry files", () => {
    const customerFiles = [
      "app/page.tsx",
      "app/advisor/page.tsx",
      "app/inquiry/page.tsx",
      "components/advisor/AdvisorLightChat.tsx",
    ];

    for (const file of customerFiles) {
      const source = readFileSync(file, "utf8");
      expect(source).not.toContain("/ops/model-settings");
      expect(source).not.toContain("OPENAI_API_KEY");
      expect(source).not.toContain("MINIMAX_API_KEY");
    }
  });

  it("keeps the ops model settings form minimal for operators", () => {
    const source = readFileSync("components/ops/ModelSettingsTester.tsx", "utf8");
    const constants = readFileSync("lib/agent/modelConnectionConstants.ts", "utf8");

    expect(source).not.toContain("Base URL");
    expect(source).not.toContain("setBaseUrl");
    expect(source).toContain('useState<Provider>("minimax")');
    expect(source).toContain("DEFAULT_MINIMAX_MODEL");
    expect(constants).toContain('DEFAULT_MINIMAX_MODEL = "MiniMax-M3"');
    expect(source).toContain("不要把 API Key 发给无关人员");
    expect(source).toContain("Response Preview");
    expect(source).toContain("Validation Issues");
    expect(source).toContain("Issues Count");
    expect(source).toContain("结构校验失败，但没有返回具体字段路径；请查看 Response Preview");
    expect(source.indexOf("Validation Issues")).toBeLessThan(source.indexOf("Response Preview"));
  });
});
