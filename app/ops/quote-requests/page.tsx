import { notFound } from "next/navigation";
import { QuoteRequestTable } from "@/components/ops/QuoteRequestTable";
import { OpsShell } from "@/components/ops/OpsShell";
import { mockQuoteRequests } from "@/content/mockQuoteRequests";
import { mockResources } from "@/content/mockResources";

export const dynamic = "force-dynamic";

const previewToken = process.env.OPS_PREVIEW_TOKEN ?? "huichuhai-ops-preview";

export default async function OpsQuoteRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;

  if (params.token !== previewToken) {
    notFound();
  }

  return (
    <OpsShell title="当次询价单">
      <QuoteRequestTable quoteRequests={mockQuoteRequests} resources={mockResources} />
    </OpsShell>
  );
}
