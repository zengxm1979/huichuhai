"use client";

import type { ReactNode } from "react";
import { BrandLogo } from "@/components/brand/BrandLogo";

export const ADVISOR_OPEN_EVENT = "huichuhai:open-advisor";

export function openAdvisorDrawer() {
  window.dispatchEvent(new CustomEvent(ADVISOR_OPEN_EVENT));
}

export function OpenAdvisorButton({
  children,
  className,
  showIcon = false,
}: {
  children: ReactNode;
  className?: string;
  showIcon?: boolean;
}) {
  return (
    <button className={className} onClick={openAdvisorDrawer} type="button">
      {showIcon ? <BrandLogo className="h-5 w-5" variant="mark" /> : null}
      {children}
    </button>
  );
}
