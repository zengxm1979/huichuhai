import { QuoteRequestOpsWorkspace } from "@/components/ops/QuoteRequestOpsWorkspace";
import { OpsShell } from "@/components/ops/OpsShell";
import { mockQuoteRequests } from "@/content/mockQuoteRequests";
import { mockResources } from "@/content/mockResources";
import { requireOpsAccess } from "@/lib/deployment/opsServerAccess";

export const dynamic = "force-dynamic";

export default async function OpsQuoteRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  await requireOpsAccess("/ops/quote-requests", params.token);

  return (
    <OpsShell title="当次询价单">
      <QuoteRequestOpsWorkspace initialQuoteRequests={mockQuoteRequests} resources={mockResources} />
    </OpsShell>
  );
}
