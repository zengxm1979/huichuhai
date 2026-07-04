import { describe, expect, it } from "vitest";
import { inquirySchema } from "@/lib/validation/inquirySchema";

describe("inquirySchema", () => {
  it("accepts a valid inquiry with one contact method", () => {
    const result = inquirySchema.safeParse({
      company: "示例科技有限公司 [MOCK]",
      contactName: "李女士 [MOCK]",
      wechat: "mock-wechat",
      eventType: "经销商大会",
      eventDate: "2026年9月 [MOCK]",
      attendeeCount: 120,
    });

    expect(result.success).toBe(true);
  });

  it("requires at least one contact method", () => {
    const result = inquirySchema.safeParse({
      company: "示例科技有限公司 [MOCK]",
      contactName: "李女士 [MOCK]",
      eventType: "经销商大会",
      eventDate: "2026年9月 [MOCK]",
      attendeeCount: 120,
    });

    expect(result.success).toBe(false);
  });
});
