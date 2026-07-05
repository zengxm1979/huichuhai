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
});
