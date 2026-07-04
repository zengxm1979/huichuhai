import { assertCustomerSafePayload } from "@/components/advisor/customerVisibility";
import type {
  CustomerQuoteRequestPayload,
  CustomerResourceSummary,
  InquiryQuoteRequest,
  ResourceMaster,
} from "@/lib/resources/types";

export function mapResourceMasterToCustomerSummary(resource: ResourceMaster): CustomerResourceSummary {
  const payload: CustomerResourceSummary = {
    id: resource.id,
    resourceType: resource.resourceType,
    resourceName: resource.resourceName,
    city: resource.city,
    district: resource.district,
    serviceScope: resource.serviceScope,
    suitableScenarios: resource.suitableScenarios,
    capacityOrSpec: resource.capacityOrSpec,
    referencePriceLabel: `参考范围 ${formatMoney(resource.referencePriceMin, resource.currency)} - ${formatMoney(
      resource.referencePriceMax,
      resource.currency,
    )} / ${resource.pricingUnit}`,
    priceScopeNote: resource.priceScopeNote,
    seasonalityRule: resource.seasonalityRule,
    leadTimeRequirement: resource.leadTimeRequirement,
    requiresQuoteConfirmation: resource.requiresQuoteConfirmation,
    customerVisibleSummary: resource.customerVisibleSummary,
    lastVerifiedAt: resource.lastVerifiedAt,
  };

  assertCustomerSafePayload(payload);
  return payload;
}

export function mapQuoteRequestToCustomerPayload(
  request: InquiryQuoteRequest,
  resource?: ResourceMaster,
): CustomerQuoteRequestPayload {
  const payload: CustomerQuoteRequestPayload = {
    id: request.id,
    inquiryId: request.inquiryId,
    resourceMasterId: request.resourceMasterId,
    resourceName: resource?.resourceName,
    quoteRequestType: request.quoteRequestType,
    eventType: request.eventType,
    eventDateStart: request.eventDateStart,
    eventDateEnd: request.eventDateEnd,
    attendeeCount: request.attendeeCount,
    requestedServices: request.requestedServices,
    availabilityStatus: request.availabilityStatus,
    quoteStatus: request.quoteStatus,
    quotedPriceLabel: quotePriceLabel(request),
    customerVisibleQuoteSummary: request.customerVisibleQuoteSummary,
    seasonalityNote: request.seasonalityNote,
    paymentTermSummary: request.paymentTermSummary,
    cancellationTermSummary: request.cancellationTermSummary,
    customerNotice: "正式价格、档期、付款和取消条款，需基于本次询价由顾问确认。",
  };

  assertCustomerSafePayload(payload);
  return payload;
}

function quotePriceLabel(request: InquiryQuoteRequest): string {
  if (request.quotedPriceMin === undefined || request.quotedPriceMax === undefined) {
    return "等待供应商确认本次报价";
  }

  return `本次询价范围 ${formatMoney(request.quotedPriceMin, request.currency)} - ${formatMoney(
    request.quotedPriceMax,
    request.currency,
  )}`;
}

function formatMoney(value: number, currency: string): string {
  return `${currency} ${value.toLocaleString("zh-CN")}`;
}
