import { describe, expect, it } from "vitest";
import {
  applyAdvisorSearchParamsToCustomerState,
  buildAdvisorConfigurationHref,
} from "@/lib/advisor/advisorUrlState";
import { getCustomerAdvisorState } from "@/lib/advisor/mockAdvisorFlow";

describe("advisor URL state handoff", () => {
  it("builds a configuration URL from customer-safe requirement summary", () => {
    const href = buildAdvisorConfigurationHref({
      eventCity: "槟城",
      eventType: "新品发布会",
      attendeeCount: 88,
      budgetRange: "60-70万",
      requestedServices: ["会议物料", "接送机"],
    });

    const url = new URL(href, "https://example.test");
    expect(url.pathname).toBe("/advisor");
    expect(url.searchParams.get("state")).toBe("configuration");
    expect(url.searchParams.get("city")).toBe("槟城");
    expect(url.searchParams.get("eventType")).toBe("新品发布会");
    expect(url.searchParams.get("attendeeCount")).toBe("88");
    expect(url.searchParams.get("budgetRange")).toBe("60-70万");
    expect(url.searchParams.get("services")).toBe("会议物料,接送机");
  });

  it("applies customer-safe query fields to the configuration state", () => {
    const state = applyAdvisorSearchParamsToCustomerState(getCustomerAdvisorState("configuration"), {
      city: "槟城",
      eventType: "新品发布会",
      attendeeCount: "88",
      budgetRange: "60-70万",
    });

    expect(state.inquiry.city).toBe("槟城");
    expect(state.inquiry.eventType).toBe("新品发布会");
    expect(state.inquiry.attendeeCount).toBe(88);
    expect(state.inquiry.budgetRange).toBe("60-70万");
    expect(JSON.stringify(state)).not.toContain("supplierName");
    expect(JSON.stringify(state)).not.toContain("internalNegotiationNote");
  });
});
