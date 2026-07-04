import { describe, expect, it } from "vitest";
import { PACKAGE_TIERS } from "@/lib/constants/packageTiers";

describe("PACKAGE_TIERS", () => {
  it("uses the approved customer-facing package labels", () => {
    expect(PACKAGE_TIERS.map((tier) => tier.label)).toEqual(["经济型", "标准型", "高配型"]);
  });
});
