import { notFound } from "next/navigation";
import { ResourceOpsWorkspace } from "@/components/ops/ResourceOpsWorkspace";
import { OpsShell } from "@/components/ops/OpsShell";
import { mockResources } from "@/content/mockResources";
import { getOpsPreviewToken } from "@/lib/deployment/reviewAccess";

export const dynamic = "force-dynamic";

const previewToken = getOpsPreviewToken();

export default async function OpsResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;

  if (params.token !== previewToken) {
    notFound();
  }

  return (
    <OpsShell title="资源主档">
      <ResourceOpsWorkspace initialResources={mockResources} />
    </OpsShell>
  );
}
