import { notFound } from "next/navigation";
import { ResourceTable } from "@/components/ops/ResourceTable";
import { OpsShell } from "@/components/ops/OpsShell";
import { mockResources } from "@/content/mockResources";

export const dynamic = "force-dynamic";

const previewToken = process.env.OPS_PREVIEW_TOKEN ?? "huichuhai-ops-preview";

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
      <ResourceTable resources={mockResources} />
    </OpsShell>
  );
}
