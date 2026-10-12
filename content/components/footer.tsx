"use client";

import { usePathname } from "next/navigation";
import { MarketingFooter } from "@/components/marketing-footer";

export function Footer() {
  const pathname = usePathname();

  // The landing page includes its own product footer.
  if (pathname === "/" || pathname.startsWith("/app")) {
    return null;
  }

  return <MarketingFooter />;
}
