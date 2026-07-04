import { ResourceOpsWorkspace } from "@/components/ops/ResourceOpsWorkspace";
import { OpsShell } from "@/components/ops/OpsShell";
import { mockResources } from "@/content/mockResources";
import { requireOpsAccess } from "@/lib/deployment/opsServerAccess";

export const dynamic = "force-dynamic";

export default async function OpsResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  await requireOpsAccess("/ops/resources", params.token);

  return (
    <OpsShell title="资源主档">
      <ResourceOpsWorkspace initialResources={mockResources} />
    </OpsShell>
  );
}
