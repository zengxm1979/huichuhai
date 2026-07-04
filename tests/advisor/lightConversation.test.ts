import { describe, expect, it } from "vitest";
import {
  buildAdvisorReply,
  extractRequirementsFromText,
  isRequirementReady,
  mergeRequirements,
  shouldAutoSubmitDraft,
  summaryToDisplayRows,
} from "@/lib/advisor/lightConversation";

describe("light advisor conversation", () => {
  it("extracts city attendee budget event type and services from customer text", () => {
    const summary = extractRequirementsFromText("地点在吉隆坡，120人，经销商大会，预算80-100万，需要物料和接送机");

    expect(summary.eventCity).toBe("吉隆坡");
    expect(summary.attendeeCount).toBe(120);
    expect(summary.eventType).toBe("经销商大会");
    expect(summary.budgetRange).toBe("80-100万");
    expect(summary.requestedServices).toEqual(expect.arrayContaining(["会议物料", "接送机"]));
  });

  it("merges new requirements without dropping prior structured fields", () => {
    const current = {
      eventCity: "槟城",
      requestedServices: ["会议物料"],
    };
    const next = mergeRequirements(current, {
      attendeeCount: 80,
      requestedServices: ["会议物料", "晚宴"],
    });

    expect(next.eventCity).toBe("槟城");
    expect(next.attendeeCount).toBe(80);
    expect(next.requestedServices).toEqual(["会议物料", "晚宴"]);
  });

  it("marks requirements ready only after core customer fields are collected", () => {
    expect(
      isRequirementReady({
        eventCity: "吉隆坡",
        attendeeCount: 120,
        eventType: "经销商大会",
        budgetRange: "80-100万",
        requestedServices: ["会议物料"],
      }),
    ).toBe(true);

    expect(
      isRequirementReady({
        eventCity: "暂未确定",
        attendeeCount: 120,
        eventType: "经销商大会",
        budgetRange: "80-100万",
        requestedServices: [],
      }),
    ).toBe(false);
  });

  it("auto-submits a sufficient typed draft only once", () => {
    const draft = "地点在吉隆坡，120人，经销商大会，预算80-100万，需要物料和接送机";

    expect(shouldAutoSubmitDraft(draft, "")).toBe(true);
    expect(shouldAutoSubmitDraft(draft, draft)).toBe(false);
    expect(shouldAutoSubmitDraft("地点在吉隆坡，120人", "")).toBe(false);
  });

  it("answers a vague Johor Bahru investment summit consultation before narrowing", () => {
    const text = "我想到新山举办投资大会，有什么建议的方案吗？";
    const summary = mergeRequirements({}, extractRequirementsFromText(text));
    const reply = buildAdvisorReply(summary, text);
    const rows = summaryToDisplayRows(summary);

    expect(summary.eventCity).toBe("新山");
    expect(summary.eventType).toBe("投资大会");
    expect(reply).toContain("新山");
    expect(reply).toContain("投资大会");
    expect(reply).toContain("跨境考察");
    expect(reply).toContain("闭门交流");
    expect(reply).not.toContain("预计人数");
    expect(reply).not.toContain("预算范围");
    expect(reply).not.toContain("地点在吉隆坡");
    expect(reply).not.toContain("经销商大会");
    expect(rows.map((row) => row.label)).toEqual(["咨询进度", "活动意图", "倾向地点", "关注重点", "大致规模"]);
    expect(rows.find((row) => row.label === "咨询进度")?.value).toBe("方向比较中");
  });
});
