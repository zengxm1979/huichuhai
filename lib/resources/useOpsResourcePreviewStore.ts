"use client";

import { useCallback, useEffect, useState } from "react";
import {
  loadOpsResourcePreviewStore,
  saveOpsResourcePreviewStore,
} from "@/lib/resources/opsResourcePreviewStore";
import type { ResourceMaster } from "@/lib/resources/types";

type ResourceUpdater = ResourceMaster[] | ((current: ResourceMaster[]) => ResourceMaster[]);

export function useOpsResourcePreviewStore(initialResources: ResourceMaster[]) {
  const [resources, setResourcesState] = useState(initialResources);

  useEffect(() => {
    setResourcesState(loadOpsResourcePreviewStore(window.localStorage, initialResources));
  }, [initialResources]);

  const setResources = useCallback((updater: ResourceUpdater) => {
    setResourcesState((current) => {
      const next = typeof updater === "function" ? updater(current) : updater;
      saveOpsResourcePreviewStore(window.localStorage, next);
      return next;
    });
  }, []);

  return { resources, setResources };
}
