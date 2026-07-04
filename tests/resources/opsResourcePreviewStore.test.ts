import { describe, expect, it } from "vitest";
import { mockResources } from "@/content/mockResources";
import {
  OPS_RESOURCE_PREVIEW_STORAGE_KEY,
  loadOpsResourcePreviewStore,
  mergePreviewResources,
  readOpsResourcePreviewStore,
  saveOpsResourcePreviewStore,
} from "@/lib/resources/opsResourcePreviewStore";
import type { ResourceMaster } from "@/lib/resources/types";

class MemoryStorage implements Pick<Storage, "getItem" | "setItem" | "removeItem"> {
  private values = new Map<string, string>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }

  removeItem(key: string) {
    this.values.delete(key);
  }
}

describe("ops resource preview store", () => {
  it("uses a stable local preview storage key", () => {
    expect(OPS_RESOURCE_PREVIEW_STORAGE_KEY).toBe("hch_ops_resources_preview");
  });

  it("merges locally saved resources ahead of server seed resources", () => {
    const localResource: ResourceMaster = {
      ...mockResources[0],
      id: "res_local_acceptance",
      resourceName: "Content Candidate Acceptance Venue [MOCK]",
      city: "新山",
      publicSummaryDraft: "Local preview resource [MOCK]",
      contentStatus: "verified",
    };

    const merged = mergePreviewResources(mockResources, [localResource, { ...mockResources[1], resourceName: "Edited [MOCK]" }]);

    expect(merged[0]).toBe(localResource);
    expect(merged.find((resource) => resource.id === mockResources[1].id)?.resourceName).toBe("Edited [MOCK]");
    expect(merged.some((resource) => resource.id === mockResources[0].id)).toBe(true);
    expect(merged.some((resource) => resource.id === mockResources[2].id)).toBe(true);
  });

  it("round trips preview resources through storage", () => {
    const storage = new MemoryStorage();
    const localResource = {
      ...mockResources[0],
      id: "res_local_saved",
      resourceName: "Saved Resource [MOCK]",
      contentStatus: "needs_review" as const,
    };

    saveOpsResourcePreviewStore(storage, [localResource]);

    const raw = storage.getItem(OPS_RESOURCE_PREVIEW_STORAGE_KEY);
    expect(raw).toContain("Saved Resource [MOCK]");
    expect(readOpsResourcePreviewStore(storage)).toEqual([localResource]);
    expect(loadOpsResourcePreviewStore(storage, mockResources)[0].id).toBe("res_local_saved");
  });

  it("falls back to seed resources when storage is empty or invalid", () => {
    const storage = new MemoryStorage();
    expect(loadOpsResourcePreviewStore(storage, mockResources)).toEqual(mockResources);

    storage.setItem(OPS_RESOURCE_PREVIEW_STORAGE_KEY, "{bad json");
    expect(loadOpsResourcePreviewStore(storage, mockResources)).toEqual(mockResources);
  });
});
