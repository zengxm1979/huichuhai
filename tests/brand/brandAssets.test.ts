import { describe, expect, it } from "vitest";
import { brandAssets, brandLogoLabels } from "@/lib/brand/assets";

describe("brand assets", () => {
  it("uses the approved HCH lockup direction", () => {
    expect(brandLogoLabels.primaryMark).toBe("HCH");
    expect(brandLogoLabels.chineseName).toBe("会出海");
    expect(brandAssets.headerLogo).toBe("/brand/hch-logo-lockup.svg");
    expect(brandAssets.footerLogo).toBe("/brand/hch-logo-lockup-reverse.svg");
    expect(brandAssets.favicon).toBe("/brand/hch-app-icon.svg");
  });
});
