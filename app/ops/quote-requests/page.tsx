import { notFound } from "next/navigation";
import { QuoteRequestOpsWorkspace } from "@/components/ops/QuoteRequestOpsWorkspace";
import { OpsShell } from "@/components/ops/OpsShell";
import { mockQuoteRequests } from "@/content/mockQuoteRequests";
import { mockResources } from "@/content/mockResources";
import { getOpsPreviewToken } from "@/lib/deployment/reviewAccess";

export const dynamic = "force-dynamic";

const previewToken = getOpsPreviewToken();

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
      <QuoteRequestOpsWorkspace initialQuoteRequests={mockQuoteRequests} resources={mockResources} />
    </OpsShell>
  );
}
