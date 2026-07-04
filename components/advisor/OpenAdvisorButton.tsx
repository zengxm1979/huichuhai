"use client";

import type { ReactNode } from "react";
import { MessageCircle } from "lucide-react";

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
      {showIcon ? <MessageCircle size={16} /> : null}
      {children}
    </button>
  );
}
