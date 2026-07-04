import { describe, expect, it } from "vitest";
import { mockQuoteRequests } from "@/content/mockQuoteRequests";
import { mockResources } from "@/content/mockResources";
import {
  mapQuoteRequestToCustomerPayload,
  mapResourceMasterToCustomerSummary,
} from "@/lib/resources/customerMappers";

const forbiddenCustomerKeys = [
  "supplierName",
  "internalNegotiationNote",
  "internalRiskNote",
  "conflictNote",
  "supplierResponseSummary",
  "operatorFollowupNote",
  "supplier_name",
  "internal_negotiation_note",
  "internal_risk_note",
  "conflict_note",
  "supplier_response_summary",
  "operator_followup_note",
];

function flattenKeys(value: unknown): string[] {
  if (!value || typeof value !== "object") return [];

  if (Array.isArray(value)) {
    return value.flatMap((item) => flattenKeys(item));
  }

  return Object.entries(value).flatMap(([key, child]) => [key, ...flattenKeys(child)]);
}

describe("resource customer mappers", () => {
  it("maps resource masters to customer-safe reference summaries", () => {
    const summaries = mockResources.map(mapResourceMasterToCustomerSummary);
    const allKeys = summaries.flatMap((summary) => flattenKeys(summary));

    expect(summaries).toHaveLength(4);
    expect(summaries.every((summary) => summary.referencePriceLabel.includes("参考范围"))).toBe(true);
    expect(summaries.some((summary) => summary.requiresQuoteConfirmation)).toBe(true);
    expect(allKeys).not.toEqual(expect.arrayContaining(forbiddenCustomerKeys));
  });

  it("maps inquiry quote requests to customer-safe quote status payloads", () => {
    const payloads = mockQuoteRequests.map((request) =>
      mapQuoteRequestToCustomerPayload(
        request,
        mockResources.find((resource) => resource.id === request.resourceMasterId),
      ),
    );
    const allKeys = payloads.flatMap((payload) => flattenKeys(payload));

    expect(payloads).toHaveLength(3);
    expect(payloads.map((payload) => payload.quoteStatus)).toEqual(
      expect.arrayContaining(["waiting_supplier", "quoted", "limited"]),
    );
    expect(payloads.every((payload) => payload.customerNotice.includes("正式价格"))).toBe(true);
    expect(allKeys).not.toEqual(expect.arrayContaining(forbiddenCustomerKeys));
  });
});
