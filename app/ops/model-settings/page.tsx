import { ModelSettingsTester } from "@/components/ops/ModelSettingsTester";
import { OpsShell } from "@/components/ops/OpsShell";
import { getModelSettingsEnvStatus } from "@/lib/agent/modelConnectionTest";
import { requireOpsAccess } from "@/lib/deployment/opsServerAccess";

export const dynamic = "force-dynamic";

export default async function OpsModelSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  await requireOpsAccess("/ops/model-settings", params.token);

  return (
    <OpsShell title="AI 模型">
      <ModelSettingsTester envStatus={getModelSettingsEnvStatus()} />
    </OpsShell>
  );
}
