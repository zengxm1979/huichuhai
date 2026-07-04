import type { ResourceMaster } from "@/lib/resources/types";

export const OPS_RESOURCE_PREVIEW_STORAGE_KEY = "hch_ops_resources_preview";

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

type StoredOpsResources = {
  resources: ResourceMaster[];
  updatedAt: string;
  version: 1;
};

export function mergePreviewResources(seedResources: ResourceMaster[], storedResources: ResourceMaster[] | null): ResourceMaster[] {
  if (!storedResources?.length) return seedResources;

  const storedIds = new Set(storedResources.map((resource) => resource.id));
  return [...storedResources, ...seedResources.filter((resource) => !storedIds.has(resource.id))];
}

export function readOpsResourcePreviewStore(storage: StorageLike): ResourceMaster[] | null {
  const raw = storage.getItem(OPS_RESOURCE_PREVIEW_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<StoredOpsResources>;
    if (parsed.version !== 1 || !Array.isArray(parsed.resources)) return null;
    return parsed.resources as ResourceMaster[];
  } catch {
    return null;
  }
}

export function loadOpsResourcePreviewStore(storage: StorageLike, seedResources: ResourceMaster[]): ResourceMaster[] {
  return mergePreviewResources(seedResources, readOpsResourcePreviewStore(storage));
}

export function saveOpsResourcePreviewStore(storage: StorageLike, resources: ResourceMaster[]) {
  const payload: StoredOpsResources = {
    resources,
    updatedAt: new Date().toISOString(),
    version: 1,
  };

  storage.setItem(OPS_RESOURCE_PREVIEW_STORAGE_KEY, JSON.stringify(payload));
}

export function clearOpsResourcePreviewStore(storage: StorageLike) {
  storage.removeItem(OPS_RESOURCE_PREVIEW_STORAGE_KEY);
}
