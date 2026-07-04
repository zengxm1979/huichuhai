import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { brandAssets, brandLogoLabels } from "@/lib/brand/assets";

describe("brand assets", () => {
  it("uses the approved HCH lockup direction", () => {
    expect(brandLogoLabels.primaryMark).toBe("HCH");
    expect(brandLogoLabels.chineseName).toBe("会出海");
    expect(brandAssets.headerLogo).toBe("/brand/hch-logo-lockup.svg");
    expect(brandAssets.footerLogo).toBe("/brand/hch-logo-lockup-reverse.svg");
    expect(brandAssets.favicon).toBe("/brand/hch-app-icon.svg");
  });

  it("keeps brand entry files free of mojibake", () => {
    const files = [
      "public/brand/hch-mark.svg",
      "public/brand/hch-logo-lockup.svg",
      "public/brand/hch-logo-lockup-reverse.svg",
      "lib/brand/assets.ts",
      "components/brand/BrandLogo.tsx",
      "components/layout/SiteHeader.tsx",
      "components/layout/SiteFooter.tsx",
      "components/advisor/AdvisorLightChat.tsx",
      "components/advisor/AdvisorPanel.tsx",
      "components/ops/OpsShell.tsx",
      "app/layout.tsx",
    ];
    const badPattern = /浼|鍔|鹃|鎵|涓|鍥|鏂|寰|绋|棰|闂|锛|鈥|�/;

    for (const file of files) {
      const content = readFileSync(join(process.cwd(), file), "utf8");
      expect(content, file).not.toMatch(badPattern);
    }
  });

  it("does not use the rejected blocky geometric HCH interim paths", () => {
    const lockup = readFileSync(join(process.cwd(), "public/brand/hch-logo-lockup.svg"), "utf8");
    const mark = readFileSync(join(process.cwd(), "public/brand/hch-mark.svg"), "utf8");

    expect(lockup).toMatch(/Georgia|Times New Roman|serif/);
    expect(mark).toMatch(/Georgia|Times New Roman|serif/);
    expect(lockup).not.toContain("M22 18h13v22h21");
    expect(mark).not.toContain("M11 20h8v20h13");
  });
});
