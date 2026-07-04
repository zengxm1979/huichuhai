import { ContentCandidatesWorkspace } from "@/components/ops/ContentCandidatesWorkspace";
import { OpsShell } from "@/components/ops/OpsShell";
import { mockResources } from "@/content/mockResources";
import { requireOpsAccess } from "@/lib/deployment/opsServerAccess";

type PageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function OpsContentCandidatesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  await requireOpsAccess("/ops/content-candidates", params.token);

  return (
    <OpsShell title="内容素材候选池">
      <ContentCandidatesWorkspace initialResources={mockResources} />
    </OpsShell>
  );
}
